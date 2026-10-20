"use client";

import { useEffect } from "react";
import { dossier } from "@/lib/scroll/store";
import { setLenis } from "@/lib/scroll/lenis";
import { loadGsap } from "@/lib/scroll/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Lenis smooth scroll driven by GSAP's ticker (one RAF loop for everything),
 * plus the scroll → decryption-progress bridge. Both libraries load after
 * hydration; native scrolling works until they arrive. With reduced motion,
 * Lenis is never loaded.
 */
export function SmoothScroll() {
  useEffect(() => {
    let alive = true;
    let cleanupLenis = () => {};

    if (!prefersReducedMotion()) {
      Promise.all([import("lenis"), loadGsap()]).then(([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (!alive) return;
        const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        setLenis(lenis);
        cleanupLenis = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          setLenis(null);
        };
      });
    }

    // Progress: plain scroll listener, coalesced to one update per frame.
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      dossier.set({ progress: Math.round(p * 1000) / 1000 });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();

    return () => {
      alive = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      cleanupLenis();
    };
  }, []);

  return null;
}
