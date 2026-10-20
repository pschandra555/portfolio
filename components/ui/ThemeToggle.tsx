"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY as KEY } from "@/lib/theme";

type Theme = "dark" | "light";
const LIGHT = "(prefers-color-scheme: light)";

const read = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ??
  (window.matchMedia(LIGHT).matches ? "light" : "dark");

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia(LIGHT);
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
};

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {}
}

/** "Terminal" (dark) ↔ "printed dossier" (light). */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="t-label inline-flex min-h-6 items-center gap-1.5 border border-rule px-2 py-1 hover:border-accent-text hover:text-accent-text"
      aria-label={`Switch to ${next === "light" ? "printed dossier (light)" : "terminal (dark)"} theme`}
    >
      <span aria-hidden="true" className="inline-block size-2 border border-current" style={{ background: theme === "dark" ? "currentColor" : "transparent" }} />
      <span suppressHydrationWarning className="hidden sm:inline">
        {theme === "dark" ? "TERMINAL" : "DOSSIER"}
      </span>
    </button>
  );
}

