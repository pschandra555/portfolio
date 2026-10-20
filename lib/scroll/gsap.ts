"use client";

import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

let pending: Promise<{ gsap: typeof GSAP; ScrollTrigger: typeof ST }> | null = null;

/**
 * GSAP + ScrollTrigger, loaded once and only after hydration, so the
 * animation code never blocks first paint. Every scroll effect awaits this.
 */
export function loadGsap() {
  pending ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return pending;
}
