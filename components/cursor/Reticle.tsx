"use client";

import { useEffect, useRef } from "react";
import { overlays } from "@/lib/overlays";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Amber targeting reticle. Fine pointers only; never with reduced motion.
 * Labels come from the nearest [data-cursor] ("Decrypt", "Open", "View",
 * "Drag", "Ping"), falling back to "Open" on links and "Select" on buttons.
 * Inside the hero ([data-cursor-mode="lens"]) the shader draws the lens
 * ring, so the reticle shrinks to a crosshair + label.
 */
export function Reticle() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    const html = document.documentElement;
    const sync = () => html.classList.toggle("has-reticle", overlays.get() === null);
    sync();
    const unsub = overlays.subscribe(sync);

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const loop = () => {
      rx += (x - rx) * 0.24;
      ry += (y - ry) * 0.24;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
      el.style.setProperty("--rx", `${rx.toFixed(1)}px`);
      el.style.setProperty("--ry", `${ry.toFixed(1)}px`);
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      el.dataset.visible = "true";
      kick();
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      const interactive = t.closest("a,button,[role=button],[role=option],summary,label,select");
      const typing = t.closest("input,textarea,[contenteditable=true]");
      let mode = "idle";
      let text = "";
      if (typing) mode = "text";
      else if (interactive) {
        mode = "hover";
        text = tagged?.dataset.cursor ?? (interactive.matches("a") ? "Open" : "Select");
      } else if (tagged) {
        mode = tagged.dataset.cursorMode ?? "hover";
        text = tagged.dataset.cursor ?? "";
      }
      el.dataset.mode = mode;
      if (label.current) label.current.textContent = text;
    };
    const onDown = () => (el.dataset.down = "true");
    const onUp = () => delete el.dataset.down;
    const onLeave = () => (el.dataset.visible = "false");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      unsub();
      html.classList.remove("has-reticle");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={root} className="reticle" aria-hidden="true" data-mode="idle" data-visible="false">
      <span className="reticle-ring">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="reticle-dot" />
      <span ref={label} className="reticle-label t-label" />
    </div>
  );
}
