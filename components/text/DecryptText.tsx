"use client";

import { useEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react";
import { randomGlyph, HEX } from "@/lib/cipher";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { handshakeDelay } from "@/lib/theme";

type Trigger = "mount" | "inView";

type Props<T extends ElementType> = {
  as?: T;
  text: string;
  trigger?: Trigger;
  /** ms before the reveal starts once triggered */
  delay?: number;
  /** total reveal time in ms */
  duration?: number;
  glyphs?: string;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/**
 * Text that arrives as ciphertext and locks in letter by letter.
 *
 * The real characters are always in the DOM (SSR, crawlers, no-JS), and
 * screen readers get the whole string at once. Each one is held in place while transparent, and a glyph overlays it
 * during the reveal, so there's zero layout shift. With reduced motion, the
 * plaintext is shown immediately.
 */
export function DecryptText<T extends ElementType = "span">({
  as,
  text,
  trigger = "inView",
  delay = 0,
  duration = 900,
  glyphs = HEX,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "span") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const chars = Array.from(root.querySelectorAll<HTMLElement>(".dc-ch"));
    const glyphEls = chars.map((c) => c.querySelector<HTMLElement>(".dc-g")!);
    const n = chars.length;

    // Encrypt immediately (before the first paint after hydration where possible).
    chars.forEach((c, i) => {
      c.dataset.locked = "false";
      glyphEls[i].textContent = randomGlyph(glyphs);
    });

    let raf = 0;
    let timer = 0;
    const run = () => {
      const lock = chars.map((_, i) => (i / Math.max(1, n)) * duration * 0.7 + Math.random() * duration * 0.3);
      const start = performance.now();
      let last = 0;
      const tick = (now: number) => {
        const t = now - start;
        const refresh = now - last > 45; // ~22fps glyph churn reads as "computing", not flicker
        if (refresh) last = now;
        let pending = 0;
        for (let i = 0; i < n; i++) {
          if (chars[i].dataset.locked === "true") continue;
          if (t >= lock[i]) {
            chars[i].dataset.locked = "true";
            glyphEls[i].textContent = "";
          } else {
            pending++;
            if (refresh) glyphEls[i].textContent = randomGlyph(glyphs);
          }
        }
        if (pending) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      // Mount-triggered reveals wait for the handshake overlay to lift.
      timer = window.setTimeout(run, delay + (trigger === "mount" ? handshakeDelay() : 0));
    };

    let io: IntersectionObserver | null = null;
    if (trigger === "mount") start();
    else {
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io?.disconnect();
            start();
          }
        },
        { rootMargin: "0px 0px -15% 0px" },
      );
      io.observe(root);
    }

    return () => {
      io?.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      chars.forEach((c, i) => {
        c.dataset.locked = "true";
        glyphEls[i].textContent = "";
      });
    };
  }, [text, trigger, delay, duration, glyphs]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} {...rest}>
      {/* Per-letter spans can be read letter by letter by some screen readers,
          so assistive tech gets the plain string and the visual layer is hidden. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <span key={wi}>
            <span className="dc-word">
              {Array.from(w).map((ch, ci) => (
                <span key={ci} className="dc-ch" data-locked="true">
                  <span className="dc-c">{ch}</span>
                  <span className="dc-g" />
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
