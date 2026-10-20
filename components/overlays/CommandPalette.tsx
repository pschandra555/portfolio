"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { links, projects, sections } from "@/content/site";
import { overlays, useOverlay } from "@/lib/overlays";
import { ambient } from "@/lib/sound";
import { scrollToSection } from "@/lib/scroll/lenis";
import { setTheme } from "@/components/ui/ThemeToggle";
import { statusStamp } from "@/components/operations/status";

type Item = { id: string; group: "Files" | "Operations" | "Actions"; label: string; meta: string; keywords?: string; run: () => void };

/**
 * ⌘K / Ctrl+K: the file index. A native <dialog> with the combobox/listbox
 * pattern: type to filter, ↑/↓ to move, Enter to open, Esc to close.
 */
export function CommandPalette() {
  const open = useOverlay() === "palette";
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const go = (href: string) => router.push(href, { transitionTypes: ["redact"] });

  const items = useMemo<Item[]>(() => {
    const files: Item[] = sections.map((s) => ({
      id: `file-${s.id}`,
      group: "Files",
      label: s.label,
      meta: `FILE ${s.file}`,
      run: () => (window.location.pathname === "/" ? scrollToSection(s.id) : go(`/#${s.id}`)),
    }));
    const ops: Item[] = projects.map((p) => ({
      id: `op-${p.slug}`,
      group: "Operations",
      label: `Operation ${p.codename}`,
      meta: statusStamp[p.status].text.toUpperCase(),
      keywords: `${p.name} ${p.stack.join(" ")}`,
      run: () => go(`/operations/${p.slug}`),
    }));
    const actions: Item[] = [
      { id: "terminal", group: "Actions", label: "Open terminal", meta: "`", keywords: "shell console ctf flag", run: () => overlays.open("terminal") },
      {
        id: "theme",
        group: "Actions",
        label: "Toggle theme",
        meta: "TERMINAL / DOSSIER",
        keywords: "dark light",
        run: () => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"),
      },
      { id: "sound", group: "Actions", label: "Toggle ambient sound", meta: "OFF BY DEFAULT", keywords: "audio hum", run: () => void ambient.toggle() },
      { id: "github", group: "Actions", label: "GitHub", meta: "↗", run: () => window.open(links.github, "_blank", "noopener,noreferrer") },
      ...(links.resume
        ? [{ id: "resume", group: "Actions" as const, label: "Résumé", meta: "PDF ↗", run: () => window.open(links.resume!, "_blank", "noopener,noreferrer") }]
        : []),
      ...(links.email
        ? [{ id: "email", group: "Actions" as const, label: "Copy email address", meta: "CLIPBOARD", run: () => void navigator.clipboard?.writeText(links.email!) }]
        : []),
    ];
    return [...files, ...ops, ...actions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return items;
    return items.filter((i) => {
      const hay = `${i.label} ${i.meta} ${i.group} ${i.keywords ?? ""}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [q, items]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      setQ("");
      setActive(0);
      d.showModal();
      input.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  const choose = (i: Item | undefined) => {
    if (!i) return;
    ambient.click(1.2);
    overlays.close();
    // Let the dialog close (and Lenis restart) before scrolling or navigating.
    requestAnimationFrame(() => i.run());
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      ambient.click(0.5);
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    }
  };

  const activeId = results[active] ? `pal-${results[active].id}` : undefined;
  let lastGroup = "";

  return (
    <dialog
      ref={dialog}
      aria-label="File index"
      onCancel={(e) => {
        e.preventDefault();
        overlays.close();
      }}
      onClick={(e) => e.target === dialog.current && overlays.close()}
      className="palette-dialog m-0 bg-transparent p-0 text-ink backdrop:bg-black/50"
    >
      <div className="w-[min(640px,calc(100vw-32px))] border border-rule bg-raised shadow-[0_40px_80px_-20px_rgb(0_0_0/0.7)]">
        <div className="t-label flex items-center justify-between border-b border-rule px-4 py-2 text-muted">
          <span>FILE INDEX · CASE #SC-0x7F3A</span>
          <span>ESC</span>
        </div>
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label="Search files, operations and actions"
          placeholder="Search the dossier…"
          maxLength={60}
          className="w-full border-b border-rule bg-transparent px-4 py-4 text-lg outline-none placeholder:text-muted focus:border-accent-text"
        />
        <ul id="palette-list" role="listbox" aria-label="Results" data-lenis-prevent className="max-h-[min(420px,55svh)] overflow-y-auto py-2">
          {results.length === 0 && <li className="t-label px-4 py-6 text-muted">NO MATCHING FILES. RECORD MAY BE REDACTED.</li>}
          {results.map((i, idx) => {
            const header = i.group !== lastGroup ? (lastGroup = i.group) : null;
            const on = idx === active;
            return (
              <li key={i.id} role="presentation">
                {header && (
                  <p role="presentation" className="t-label px-4 pb-1 pt-3 text-muted">
                    {header}
                  </p>
                )}
                <div
                  id={`pal-${i.id}`}
                  role="option"
                  aria-selected={on}
                  onPointerMove={() => setActive(idx)}
                  onClick={() => choose(i)}
                  className={`mx-2 flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5 ${on ? "bg-accent text-accent-ink" : ""}`}
                >
                  <span>{i.label}</span>
                  <span className={`t-label ${on ? "" : "text-muted"}`}>{i.meta}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="t-label flex gap-4 border-t border-rule px-4 py-2 text-muted">
          <span>↑↓ MOVE</span>
          <span>↵ OPEN</span>
          <span>` TERMINAL</span>
        </p>
      </div>
    </dialog>
  );
}
