/**
 * Cipher glyph field.
 *
 * One fullscreen triangle pair. Every fragment works out which cell it's in,
 * which glyph that cell shows right now, and samples the glyph atlas. No
 * per-glyph geometry, so 15–20k characters cost the same as one quad.
 *
 * Layers, back to front:
 *  1. ciphertext: base64 glyphs that churn at per-cell rates
 *  2. the name: cells inside the <h1>'s letterforms lock to amber
 *  3. the lens: inside the cursor circle, cells show plaintext one-liners
 *
 * Output is premultiplied alpha over a transparent canvas.
 */

export const glyphFieldVertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const glyphFieldFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uAtlas;
  uniform sampler2D uMask;
  uniform sampler2D uPlain;
  uniform sampler2D uCipher;
  uniform vec2  uAtlasGrid;
  uniform float uPlainLen;
  uniform float uCipherLen;

  uniform vec2  uRes;      // canvas size, CSS px
  uniform float uDpr;
  uniform vec2  uCell;     // cell size, CSS px
  uniform float uTime;
  uniform float uIntro;    // 0 → 1 when the field first resolves
  uniform float uExit;     // 0 → 1 as the hero scrolls away
  uniform vec2  uMouse;    // CSS px, top-left origin
  uniform float uLens;     // 0 → 1 lens open
  uniform float uLensR;    // lens radius, CSS px

  uniform vec3  uInk;
  uniform vec3  uAccent;
  uniform vec3  uAccentText;
  uniform float uLight;    // 1 = printed-dossier theme

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float lookup(sampler2D tex, float i, float len) {
    return floor(texture2D(tex, vec2((i + 0.5) / len, 0.5)).r * 255.0 + 0.5) - 32.0;
  }

  float glyph(float idx, vec2 f) {
    vec2 g = vec2(mod(idx, uAtlasGrid.x), floor(idx / uAtlasGrid.x));
    return texture2D(uAtlas, (g + f) / uAtlasGrid).r;
  }

  void main() {
    // CSS px, top-left origin
    vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;

    // Re-key flow: as the hero leaves, the whole field streams upward.
    float drift = uExit * uExit * uRes.y * 0.45 + uTime * 6.0 * uExit;
    vec2 p = px + vec2(0.0, drift);
    vec2 cell = floor(p / uCell);
    vec2 f = fract(p / uCell);

    float h  = hash(cell);
    float h2 = hash(cell + 17.31);

    // Per-cell churn rate; scrolling away re-keys everything faster.
    float rate = 0.15 + 1.6 * h2 * h2 + uExit * 9.0;
    float step_ = floor(uTime * rate + h * 13.0);
    float cipherIdx = lookup(uCipher, floor(hash(cell + step_ * 0.731) * uCipherLen), uCipherLen);

    // Name mask, sampled at the cell centre in page space (the name scrolls with the page).
    vec2 centre = (cell + 0.5) * uCell - vec2(0.0, drift);
    float inName = step(0.5, texture2D(uMask, centre / uRes).r);

    // Intro: cells fade in at random thresholds; name cells lock last.
    float appear = smoothstep(h * 0.7, h * 0.7 + 0.25, uIntro);
    float locked = step(0.35 + h * 0.6, uIntro) * step(h, 1.0 - uExit * 1.6);
    float name = inName * locked;

    // Lens
    float d = distance(px, uMouse);
    float lens = uLens * (1.0 - smoothstep(uLensR - 1.5, uLensR, d));
    float ring = uLens * (1.0 - smoothstep(0.6, 1.6, abs(d - uLensR)));

    float plainIdx = lookup(uPlain, mod(cell.x + cell.y * 23.0, uPlainLen), uPlainLen);
    float idx = lens > 0.5 ? plainIdx : cipherIdx;
    float g = glyph(idx, f);

    // Ambient brightness: dim, uneven, with a slow phosphor scan band.
    float scanPos = fract(uTime * 0.045);
    float scan = smoothstep(0.09, 0.0, abs(px.y / uRes.y - scanPos)) * 0.22;
    float a = (0.07 + 0.13 * h2 * h2 + scan) * (uLight > 0.5 ? 1.15 : 1.0);
    vec3 col = uInk;

    // Name: amber glyphs on terminal; highlighter-filled cells with ink glyphs on paper.
    if (name > 0.5) {
      if (uLight > 0.5) {
        vec2 inset = step(vec2(0.04), f) * step(f, vec2(0.96));
        float fill = inset.x * inset.y * 0.9;
        vec3 c = mix(uAccent, uInk, g);
        float alpha = max(fill, g);
        gl_FragColor = vec4(c * alpha, alpha) * appear;
        return;
      }
      col = uAccentText;
      a = 0.92;
    }

    // Lens interior: plaintext in decrypted amber, ambient cipher held back.
    if (lens > 0.5) {
      col = uLight > 0.5 ? uInk : uAccentText;
      a = 0.95;
    }

    // Field thins out towards the bottom as it flows into the next section.
    float fade = 1.0 - smoothstep(0.35, 1.0, px.y / uRes.y) * (0.55 + 0.45 * uExit);
    float alpha = g * a * appear * fade * (1.0 - uExit * 0.6);

    // Lens ring
    vec3 ringCol = uLight > 0.5 ? uAccentText : uAccent;
    alpha = max(alpha, ring * 0.9);
    col = mix(col, ringCol, ring);

    gl_FragColor = vec4(col * alpha, alpha);
  }
`;
