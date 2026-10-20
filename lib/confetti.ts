"use client";

import { HEX } from "@/lib/cipher";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/** Confetti made of hex glyphs. Self-removing; skipped entirely under reduced motion. */
export function hexConfetti() {
  if (prefersReducedMotion()) return;
  const c = document.createElement("canvas");
  c.setAttribute("aria-hidden", "true");
  c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100";
  document.body.appendChild(c);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth, H = window.innerHeight;
  c.width = W * dpr;
  c.height = H * dpr;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const colors = [cs.getPropertyValue("--accent").trim(), cs.getPropertyValue("--accent-text").trim(), cs.getPropertyValue("--ink").trim()];
  const mono = cs.getPropertyValue("--font-jetbrains").trim() || "monospace";

  const N = W < 600 ? 110 : 220;
  const parts = Array.from({ length: N }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const v = 7 + Math.random() * 11;
    return {
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.72,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      s: 12 + Math.random() * 16,
      g: HEX[(Math.random() * 16) | 0],
      c: colors[(Math.random() * colors.length) | 0],
    };
  });

  const start = performance.now();
  const frame = (now: number) => {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 2.2) / 1);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.font = `700 ${p.s}px ${mono}`;
      ctx.fillText(p.g, 0, 0);
      ctx.restore();
    }
    if (t < 3.2) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}
