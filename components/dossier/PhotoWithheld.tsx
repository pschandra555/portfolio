"use client";

import { useEffect, useRef, useState } from "react";
import { randomGlyph } from "@/lib/cipher";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const COLS = 22;
const ROWS = 26;
const NOISE = " .·:-=+*%#";

/**
 * The ID-badge portrait slot. With no photo on file it shows dithered glyph
 * static; hovering (or tapping) decrypts it into the subject's initials as
 * ASCII art. Decorative: the badge's text carries the meaning.
 */
export function PhotoWithheld({ initials }: { initials: string }) {
  const pre = useRef<HTMLPreElement>(null);
  const [open, setOpen] = useState(false);
  const mask = useRef<boolean[] | null>(null);

  // Build an ASCII mask of the initials once fonts are in.
  useEffect(() => {
    document.fonts.ready.then(() => {
      const c = document.createElement("canvas");
      c.width = COLS;
      c.height = ROWS;
      const ctx = c.getContext("2d")!;
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-big-shoulders") || "sans-serif";
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${ROWS * 0.95}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials, COLS / 2, ROWS * 0.56);
      const d = ctx.getImageData(0, 0, COLS, ROWS).data;
      mask.current = Array.from({ length: COLS * ROWS }, (_, i) => d[i * 4] > 110);
    });
  }, [initials]);

  // Static while closed; scramble into the initials when opened.
  useEffect(() => {
    const el = pre.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = 0;
    const start = performance.now();
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - last < 70) return;
      last = now;
      const t = Math.min(1, (now - start) / 700);
      let s = "";
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          const settle = open && mask.current && (reduced || Math.random() < t);
          if (settle) s += mask.current![i] ? randomGlyph("#%@&") : r % 2 ? "·" : " ";
          else s += NOISE[(Math.random() * NOISE.length) | 0];
        }
        s += "\n";
      }
      el.textContent = s;
      if (reduced || (open && t >= 1)) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <div
      data-cursor="Decrypt"
      className="crt relative aspect-[22/26] w-full overflow-hidden border border-rule bg-bg"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      aria-hidden="true"
    >
      <pre
        ref={pre}
        className={`absolute inset-0 m-0 flex items-center justify-center whitespace-pre font-mono text-[clamp(7px,0.9vw,11px)] leading-[1.05] transition-colors duration-500 ${
          open ? "decrypted" : "text-muted"
        }`}
      />
      <span className="t-label absolute inset-x-0 bottom-0 bg-bg/85 px-2 py-1 text-center text-muted">
        {open ? "IDENTITY CONFIRMED" : "PHOTO WITHHELD · HOVER TO DECRYPT"}
      </span>
    </div>
  );
}
