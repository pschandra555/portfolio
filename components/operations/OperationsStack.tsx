"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { loadGsap } from "@/lib/scroll/gsap";

/**
 * Case files stack like folders sliding over each other (CSS sticky does the
 * stacking). This adds depth: as the next file slides over, the one beneath
 * sinks back and dims. Desktop only; phones get a plain list.
 */
export function OperationsStack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    let alive = true;
    let revert = () => {};
    loadGsap().then(({ gsap }) => {
      if (!alive) return;
      const mm = gsap.matchMedia();
      revert = () => mm.revert();
      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".op-card", root);
        cards.slice(0, -1).forEach((card, i) => {
          gsap.to(card, {
            scale: 0.94,
            filter: "brightness(0.6)",
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true },
          });
        });
      });
    });
    return () => {
      alive = false;
      revert();
    };
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-24 md:gap-[30vh]">
      {children}
    </div>
  );
}
