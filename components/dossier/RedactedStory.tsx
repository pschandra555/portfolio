"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { loadGsap } from "@/lib/scroll/gsap";

/**
 * Paragraphs that start fully redacted and declassify word by word as they
 * scroll through the viewport.
 *
 * The bars are ::after pseudo-elements driven by ONE custom property (--p) on
 * the container, so a frame costs a single style write. The words themselves
 * are real text at all times: screen readers, search engines, no-JS and
 * reduced-motion visitors simply never see the bars.
 * Wrap a word in *asterisks* in site.ts to declassify it in amber.
 */
export function RedactedStory({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const total = paragraphs.reduce((n, p) => n + p.split(" ").length, 0);
  let index = 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let alive = true;
    let kill = () => {};
    loadGsap().then(({ ScrollTrigger }) => {
      // Never cover words someone may already be reading.
      if (!alive || el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("redact-live");
      el.style.setProperty("--p", "0");
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        end: "bottom 50%",
        scrub: 0.4,
        onUpdate: (self) => el.style.setProperty("--p", self.progress.toFixed(4)),
      });
      kill = () => st.kill();
    });
    return () => {
      alive = false;
      kill();
      el.classList.remove("redact-live");
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {paragraphs.map((p, pi) => (
        <p key={pi} className="max-w-[60ch]">
          {p.split(" ").map((raw, wi, arr) => {
            const key = raw.startsWith("*") && raw.replace(/[^*]/g, "").length >= 2;
            const word = key ? raw.replace(/\*/g, "") : raw;
            const t = (index++ / total) * 0.92;
            return (
              <span key={wi}>
                <span className={`rd-w${key ? " decrypted" : ""}`} style={{ "--t": t.toFixed(4) } as React.CSSProperties}>
                  {word}
                </span>
                {wi < arr.length - 1 ? " " : null}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
