import type Lenis from "lenis";

/** The one Lenis instance (null when reduced motion or before mount). */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Scroll to a section id; falls back to native scrolling. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
  // Move focus for keyboard and screen-reader users without a second jump.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
