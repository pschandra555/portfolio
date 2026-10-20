"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { pickFieldTier } from "@/lib/device";
import { FieldInput, heroExit, markHero } from "@/lib/hero/field";

type Tier = "webgl" | "canvas";
type FieldProps = {
  heroEl: HTMLElement;
  input: FieldInput;
  active: boolean;
  monoFamily: string;
  onReady: () => void;
  onStruggle?: () => void;
};

const load = (tier: Tier): Promise<ComponentType<FieldProps>> =>
  tier === "webgl"
    ? import("./CipherFieldGL").then((m) => m.default)
    : import("./CipherFieldCanvas").then((m) => m.default);

/** Wait until the page has loaded and the main thread is idle, so the field never competes with LCP. */
const whenIdle = (cb: () => void) => {
  let cancel = () => {};
  const idle = () => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(cb, { timeout: 1500 });
      cancel = () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(cb, 300);
      cancel = () => clearTimeout(id);
    }
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
  return () => {
    window.removeEventListener("load", idle);
    cancel();
  };
};

/**
 * Picks the right cipher-field tier for this device, lazy-loads it after the
 * hero text has painted, and feeds it pointer + scroll input without React renders.
 * Reduced motion: renders nothing (the page is already declassified).
 */
export function CipherField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [input] = useState(() => new FieldInput());
  const [field, setField] = useState<{ tier: Tier; Comp: ComponentType<FieldProps>; hero: HTMLElement; mono: string } | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const hero = hostRef.current?.parentElement;
    if (!hero) return;
    const tier = pickFieldTier();
    if (tier === "none") return;

    let alive = true;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim() || "monospace";
    const stopIdle = whenIdle(async () => {
      await document.fonts.load(`500 20px ${mono}`).catch(() => {});
      await document.fonts.ready;
      const Comp = await load(tier);
      if (alive) setField({ tier, Comp, hero, mono });
    });

    // Pointer → lens. Mouse/pen: lens follows inside the hero. Touch: press and drag.
    const local = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      input.set({ x: e.clientX - r.left, y: e.clientY - r.top });
      return e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onMove = (e: PointerEvent) => {
      const inside = local(e);
      if (e.pointerType === "touch") return;
      input.set({ lens: inside ? 1 : 0 });
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" && local(e)) input.set({ lens: 1 });
    };
    const onTouchMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" && input.lens > 0) local(e);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") input.set({ lens: 0 });
    };
    const onLeave = () => input.set({ lens: 0 });
    const onScroll = () => input.set({ exit: heroExit(hero) });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointermove", onTouchMove, { passive: true });
    hero.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Stop rendering entirely while the hero is off screen.
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(hero);

    return () => {
      alive = false;
      stopIdle();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", onTouchMove);
      hero.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      markHero(hero, null);
    };
  }, [input]);

  const onReady = useCallback(() => {
    if (field) markHero(field.hero, field.tier);
  }, [field]);

  // The GPU couldn't keep up: swap to the 2D tier.
  const onStruggle = useCallback(() => {
    if (!field) return;
    load("canvas").then((Comp) => setField({ ...field, tier: "canvas", Comp }));
  }, [field]);

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {field && (
        <field.Comp
          key={field.tier}
          heroEl={field.hero}
          input={input}
          active={active}
          monoFamily={field.mono}
          onReady={onReady}
          onStruggle={onStruggle}
        />
      )}
    </div>
  );
}
