"use client";

import { useEffect } from "react";
import { overlays } from "@/lib/overlays";

const editable = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/** ⌘K / Ctrl+K opens the file index; ` opens the terminal (unless you're typing somewhere). */
export function GlobalKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        overlays.toggle("palette");
      } else if (e.key === "`" && !e.metaKey && !e.ctrlKey && !e.altKey && !editable(e.target)) {
        e.preventDefault();
        overlays.toggle("terminal");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
