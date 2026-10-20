"use client";

import { useEffect, useRef } from "react";
import { scrambleTo, HEX } from "@/lib/cipher";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * A short value (HUD readouts, labels) that re-keys through cipher glyphs
 * whenever it changes. Screen readers only ever see the settled value.
 */
export function ScrambleValue({
  value,
  duration = 500,
  glyphs = HEX,
  className,
}: {
  value: string;
  duration?: number;
  glyphs?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current || prefersReducedMotion()) {
      first.current = false;
      el.textContent = value;
      return;
    }
    return scrambleTo(value, (s) => (el.textContent = s), { duration, set: glyphs });
  }, [value, duration, glyphs]);

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </span>
  );
}
