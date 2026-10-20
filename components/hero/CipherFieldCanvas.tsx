"use client";

import { useEffect, useRef } from "react";
import { CIPHER_SET, PLAINTEXT, cellSize, onThemeChange, readPalette, type FieldInput } from "@/lib/hero/field";

interface Props {
  heroEl: HTMLElement;
  input: FieldInput;
  active: boolean;
  monoFamily: string;
  onReady: () => void;
}

const rgb = ([r, g, b]: [number, number, number]) => `rgb(${(r * 255) | 0} ${(g * 255) | 0} ${(b * 255) | 0})`;

/**
 * 2D-canvas tier of the cipher field for phones and low-power machines:
 * a sparser grid, ~24fps, no shaders. Same idea (ciphertext churn, a
 * touch/pointer lens that reveals plaintext, re-keying on scroll), a fraction of the cost.
 */
export default function CipherFieldCanvas({ heroEl, input, active, monoFamily, onReady }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    activeRef.current = active;
    if (active) wake.current();
  }, [active]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let W = 0, H = 0, cw = 12, ch = 18, cols = 0, rows = 0;
    let glyphs = new Uint8Array(0);
    let next = new Float32Array(0);
    let tone = new Float32Array(0);
    let palette = readPalette();
    let ink = rgb(palette.ink);
    let amber = rgb(palette.accentText);

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = heroEl.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      [cw, ch] = cellSize(W, "canvas");
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch) + 2;
      const n = cols * rows;
      glyphs = new Uint8Array(n).map(() => (Math.random() * CIPHER_SET.length) | 0);
      next = new Float32Array(n).map(() => Math.random() * 4);
      tone = new Float32Array(n).map(() => Math.random() ** 2);
      ctx.font = `500 ${Math.round(ch * 0.62)}px ${monoFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(heroEl);

    const offTheme = onThemeChange(() => {
      palette = readPalette();
      ink = rgb(palette.ink);
      amber = rgb(palette.accentText);
    });

    let raf = 0;
    let last = 0;
    let t = 0;
    let intro = 0;
    let exit = 0;
    let lens = 0;
    let lx = input.x, ly = input.y;
    let readied = false;

    const frame = (now: number) => {
      raf = 0;
      if (!activeRef.current) return; // sleep until woken
      raf = requestAnimationFrame(frame);
      const elapsed = now - last;
      if (elapsed < 1000 / 24) return;
      const dt = Math.min(elapsed / 1000, 0.1);
      last = now;
      t += dt;
      intro = Math.min(1, intro + dt / 1.2);
      exit += (input.exit - exit) * Math.min(1, dt * 8);
      lens += (input.lens - lens) * Math.min(1, dt * 10);
      lx += (input.x - lx) * Math.min(1, dt * 16);
      ly += (input.y - ly) * Math.min(1, dt * 16);

      const lensR = Math.max(70, Math.min(120, W * 0.2));
      const drift = exit * exit * H * 0.45 + t * 6 * exit;
      const rowShift = Math.floor(drift / ch);
      const yOff = -(drift % ch);
      const churn = 1 + exit * 8;

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      for (let r = 0; r < rows; r++) {
        const y = r * ch + ch / 2 + yOff;
        if (y < -ch || y > H + ch) continue;
        const gr = r + rowShift;
        const fade = 1 - Math.min(1, Math.max(0, (y / H - 0.35) / 0.65)) * (0.55 + 0.45 * exit);
        for (let c = 0; c < cols; c++) {
          const i = ((gr % rows) * cols + c) | 0;
          if (t >= next[i]) {
            glyphs[i] = (Math.random() * CIPHER_SET.length) | 0;
            next[i] = t + (0.6 + Math.random() * 5) / churn;
          }
          if (tone[i] > intro * 1.4) continue;
          const x = c * cw + cw / 2;
          const inLens = lens > 0.05 && (x - lx) ** 2 + (y - ly) ** 2 < lensR * lensR;
          if (inLens) {
            ctx.fillStyle = palette.light ? ink : amber;
            ctx.globalAlpha = 0.95 * lens;
            ctx.fillText(PLAINTEXT[(c + gr * 23) % PLAINTEXT.length], x, y);
            ctx.fillStyle = ink;
          } else {
            ctx.fillStyle = ink;
            ctx.globalAlpha = (0.07 + 0.13 * tone[i]) * fade * (1 - exit * 0.6) * intro;
            ctx.fillText(CIPHER_SET[glyphs[i]], x, y);
          }
        }
      }
      if (lens > 0.05) {
        ctx.globalAlpha = 0.9 * lens;
        ctx.strokeStyle = amber;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(lx, ly, lensR, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (!readied) {
        readied = true;
        onReady();
      }
    };

    wake.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    wake.current();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wake.current = () => {};
      ro.disconnect();
      offTheme();
    };
  }, [heroEl, input, monoFamily, onReady]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
