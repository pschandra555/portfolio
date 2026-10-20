import * as THREE from "three";
import { glyphFieldFragment, glyphFieldVertex } from "@/shaders/glyphField";
import {
  ATLAS_COLS,
  ATLAS_ROWS,
  CIPHER_SET,
  PLAINTEXT,
  buildAtlas,
  buildNameMask,
  cellSize,
  readPalette,
  type FieldInput,
} from "@/lib/hero/field";

const charTexture = (s: string) => {
  const data = new Uint8Array(Array.from(s, (c) => c.charCodeAt(0)));
  const t = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat, THREE.UnsignedByteType);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
};

const canvasTexture = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.flipY = false;
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  return t;
};

/**
 * GPU state for the cipher field. Plain class on purpose: uniforms are
 * mutated every frame, which is exactly what React state shouldn't do.
 */
export class GlyphFieldGL {
  readonly material: THREE.ShaderMaterial;
  private intro = 0;
  private lens = 0;
  private frames = 0;
  private slow = 0;
  private struggled = false;
  private readied = false;

  constructor(monoFamily: string) {
    this.material = new THREE.ShaderMaterial({
      vertexShader: glyphFieldVertex,
      fragmentShader: glyphFieldFragment,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uAtlas: { value: canvasTexture(buildAtlas(monoFamily)) },
        uMask: { value: null },
        uPlain: { value: charTexture(PLAINTEXT) },
        uCipher: { value: charTexture(CIPHER_SET) },
        uAtlasGrid: { value: new THREE.Vector2(ATLAS_COLS, ATLAS_ROWS) },
        uPlainLen: { value: PLAINTEXT.length },
        uCipherLen: { value: CIPHER_SET.length },
        uRes: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uCell: { value: new THREE.Vector2(9, 14) },
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uExit: { value: 0 },
        uMouse: { value: new THREE.Vector2(-9999, -9999) },
        uLens: { value: 0 },
        uLensR: { value: 120 },
        uInk: { value: new THREE.Vector3() },
        uAccent: { value: new THREE.Vector3() },
        uAccentText: { value: new THREE.Vector3() },
        uLight: { value: 0 },
      },
    });
    this.applyPalette();
  }

  /** Resolution, cell size and the name mask follow the hero's layout. */
  resize(width: number, height: number, dpr: number, heroEl: HTMLElement) {
    const u = this.material.uniforms;
    u.uRes.value.set(width, height);
    u.uDpr.value = dpr;
    u.uCell.value.set(...cellSize(width, "webgl"));
    u.uLensR.value = Math.max(90, Math.min(150, width * 0.085));
    (u.uMask.value as THREE.Texture | null)?.dispose();
    u.uMask.value = canvasTexture(buildNameMask(heroEl));
  }

  /** Theme tokens → uniforms. */
  applyPalette() {
    const p = readPalette();
    const u = this.material.uniforms;
    u.uInk.value.set(...p.ink);
    u.uAccent.value.set(...p.accent);
    u.uAccentText.value.set(...p.accentText);
    u.uLight.value = p.light ? 1 : 0;
  }

  /** Advance one frame. Returns true once if the GPU can't hold ~40fps. */
  tick(delta: number, input: FieldInput): boolean {
    const u = this.material.uniforms;
    const dt = Math.min(delta, 0.1);
    u.uTime.value += dt;
    this.intro = Math.min(1, this.intro + dt / 1.8);
    u.uIntro.value = 1 - Math.pow(1 - this.intro, 3);
    u.uExit.value += (input.exit - u.uExit.value) * Math.min(1, dt * 8);
    this.lens += (input.lens - this.lens) * Math.min(1, dt * 9);
    u.uLens.value = this.lens;
    // The lens trails the pointer slightly, like a heavy loupe.
    const m = u.uMouse.value as THREE.Vector2;
    const k = m.x < -1000 ? 1 : Math.min(1, dt * 14);
    m.x += (input.x - m.x) * k;
    m.y += (input.y - m.y) * k;

    // Frame-rate guard: after warm-up, if most frames run below ~40fps, report once.
    if (this.struggled || u.uTime.value < 2) return false;
    this.frames++;
    if (delta > 1 / 40) this.slow++;
    if (this.frames < 120) return false;
    const bad = this.slow / this.frames > 0.6;
    this.frames = this.slow = 0;
    if (bad) this.struggled = true;
    return bad;
  }

  /** True exactly once: on the first rendered frame. */
  claimReady() {
    if (this.readied) return false;
    this.readied = true;
    return true;
  }

  dispose() {
    for (const u of Object.values(this.material.uniforms)) (u.value as THREE.Texture | null)?.dispose?.();
    this.material.dispose();
  }
}
