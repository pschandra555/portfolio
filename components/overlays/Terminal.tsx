"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { overlays, useOverlay } from "@/lib/overlays";
import { ambient } from "@/lib/sound";
import { hexConfetti } from "@/lib/confetti";
import { scrollToSection } from "@/lib/scroll/lenis";
import { setTheme } from "@/components/ui/ThemeToggle";
import { BANNER, completions, runCommand, type Line, type TerminalContext } from "./commands";

type Entry = { id: number; cmd?: string; lines: Line[] };

const TONE: Record<NonNullable<Line["tone"]>, string> = {
  ink: "text-[#e8e6e1]",
  muted: "text-[#8e8c86]",
  accent: "text-[#ffb000] [text-shadow:0_0_8px_rgb(255_176_0/0.35)]",
  error: "text-[#ff7a66]",
};

/**
 * The hidden terminal (press `). A native <dialog> so focus is trapped and
 * the page behind is inert. Always "terminal" coloured, in both themes.
 */
export function Terminal() {
  const open = useOverlay() === "terminal";
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: BANNER }]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const nextId = useRef(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      input.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [entries]);

  const ctx: TerminalContext = {
    close: () => overlays.close(),
    goTo: (id) => {
      if (window.location.pathname === "/") scrollToSection(id);
      else router.push(`/#${id}`, { transitionTypes: ["redact"] });
    },
    open: (href) => {
      overlays.close();
      if (href.startsWith("/")) router.push(href, { transitionTypes: ["redact"] });
      else window.open(href, "_blank", "noopener,noreferrer");
    },
    toggleTheme: () => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"),
    clear: () => setEntries([]),
    celebrate: () => hexConfetti(),
  };

  const submit = async () => {
    const cmd = value;
    setValue("");
    cursor.current = -1;
    if (cmd.trim()) history.current = [cmd, ...history.current.filter((h) => h !== cmd)].slice(0, 50);
    setBusy(true);
    const id = nextId.current++;
    setEntries((e) => [...e, { id, cmd, lines: [] }]);
    const lines = await runCommand(cmd, ctx);
    setEntries((e) => (cmd.trim() === "clear" ? [] : e.map((x) => (x.id === id ? { ...x, lines } : x))));
    setBusy(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    ambient.click(0.7);
    if (e.key === "Enter") {
      e.preventDefault();
      if (!busy) submit();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      cursor.current = Math.max(-1, Math.min(h.length - 1, cursor.current + (e.key === "ArrowUp" ? 1 : -1)));
      setValue(cursor.current < 0 ? "" : h[cursor.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const c = completions(value);
      if (c.length === 1) setValue(c[0] + " ");
      else if (c.length > 1) setEntries((x) => [...x, { id: nextId.current++, lines: [{ text: c.join("   "), tone: "muted" }] }]);
    } else if (e.key === "`" && !value) {
      e.preventDefault();
      overlays.close();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  // Drag the window by its title bar (desktop).
  const startDrag = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const sx = e.clientX - drag.x;
    const sy = e.clientY - drag.y;
    const move = (m: PointerEvent) => setDrag({ x: m.clientX - sx, y: m.clientY - sy });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="term-title"
      onCancel={(e) => {
        e.preventDefault();
        overlays.close();
      }}
      onClick={(e) => e.target === dialog.current && overlays.close()}
      className="terminal-dialog m-0 bg-transparent p-0 backdrop:bg-black/40"
      style={{ translate: `${drag.x}px ${drag.y}px` }}
    >
      <div className="crt flex h-[min(520px,72svh)] w-[min(780px,calc(100vw-32px))] flex-col overflow-hidden rounded-md border border-[#2a2d2b] bg-[#070807] text-[#e8e6e1] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.8)]">
        <div
          onPointerDown={startDrag}
          data-cursor="Drag"
          className="t-label flex cursor-grab items-center justify-between border-b border-[#2a2d2b] px-3 py-2 text-[#8e8c86] active:cursor-grabbing"
        >
          <span id="term-title">visitor@sc-0x7f3a: ~ — tty1</span>
          <button type="button" onClick={() => overlays.close()} className="px-1 hover:text-[#ffb000]" aria-label="Close terminal">
            ESC ✕
          </button>
        </div>

        <div
          ref={scroller}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
          onClick={() => input.current?.focus()}
        >
          {entries.map((e) => (
            <div key={e.id} className="term-entry">
              {e.cmd !== undefined && (
                <p>
                  <span className="text-[#ffb000]">visitor@sc:~$ </span>
                  {e.cmd}
                </p>
              )}
              {e.lines.map((l, i) => (
                <p key={i} className={`whitespace-pre-wrap break-words ${TONE[l.tone ?? "ink"]}`} style={{ "--i": i } as React.CSSProperties}>
                  {l.href ? (
                    <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="underline">
                      {l.text}
                    </a>
                  ) : (
                    l.text || " "
                  )}
                </p>
              ))}
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-[#2a2d2b] px-4 py-3 font-mono text-[13px] focus-within:border-[#ffb000]"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="term-input" className="shrink-0 text-[#ffb000]">
            visitor@sc:~$
          </label>
          <input
            id="term-input"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            maxLength={200}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command. Type help for a list of commands."
            className="min-w-0 flex-1 bg-transparent text-[#e8e6e1] caret-[#ffb000] outline-none"
          />
        </form>
      </div>
    </dialog>
  );
}
