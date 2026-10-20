"use client";

import { sections } from "@/content/site";
import { useDossier } from "@/lib/scroll/store";
import { ScrambleOnHover } from "@/components/text/ScrambleOnHover";

/**
 * Folder index tabs on the right edge (desktop). Each tab is a plain anchor:
 * Lenis intercepts it for smooth scrolling, and it still works with no JS.
 */
export function FileTabs() {
  const active = useDossier((s) => s.section);
  return (
    <nav aria-label="File index" className="t-label fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-end gap-px">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "location" : undefined}
                className={`group flex items-center gap-2 border-y border-l py-1.5 pl-2.5 pr-3 transition-[padding,color,background-color] duration-300 ${
                  on ? "border-accent bg-accent pr-5 text-accent-ink" : "border-rule bg-bg text-muted hover:pr-5 hover:text-ink"
                }`}
              >
                <span>{s.file}</span>
                <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-40 group-focus-visible:max-w-40">
                  <ScrambleOnHover text={s.label} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
