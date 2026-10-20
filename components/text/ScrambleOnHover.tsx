"use client";

import { useEffect, useRef } from "react";
import { CIPHER, scrambleTo } from "@/lib/cipher";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Link/button label that re-keys through cipher glyphs when its control is
 * hovered or focused. Assistive tech only ever gets the plain label.
 */
export function ScrambleOnHover({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.closest<HTMLElement>("a,button,[role=button]");
    if (!el || !host || prefersReducedMotion()) return;
    let cancel = () => {};
    const run = () => {
      cancel();
      cancel = scrambleTo(text, (s) => (el.textContent = s), { duration: 380, set: CIPHER });
    };
    host.addEventListener("pointerenter", run);
    host.addEventListener("focus", run);
    return () => {
      cancel();
      host.removeEventListener("pointerenter", run);
      host.removeEventListener("focus", run);
    };
  }, [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
