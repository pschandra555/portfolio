"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CIPHER, randomGlyph } from "@/lib/cipher";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { ambient } from "@/lib/sound";

type Turn = { id: number; role: "user" | "assistant"; content: string; done: boolean; mode?: "live" | "offline"; error?: boolean };

const SUGGESTIONS = [
  "What is he working on right now?",
  "Which certifications does he hold?",
  "Is HoneyGrid live?",
  "What's his DevSecOps stack?",
  "How do I get in touch?",
];

const MAX = 400;

/**
 * "Interrogate the file": a transcript-style chat over /api/interrogate.
 * Answers stream in and decrypt glyph by glyph. The log is aria-busy while
 * streaming, so screen readers hear each answer once, complete.
 */
export function InterrogateChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const ask = async (q: string) => {
    const question = q.trim().slice(0, MAX);
    if (!question || busy) return;
    setInput("");
    const history = [...turns.filter((t) => t.done && !t.error), { role: "user" as const, content: question }]
      .slice(-8)
      .map(({ role, content }) => ({ role, content: content.slice(0, role === "user" ? MAX : 1200) }));
    const qId = nextId.current++;
    const aId = nextId.current++;
    setTurns((t) => [...t, { id: qId, role: "user", content: question, done: true }, { id: aId, role: "assistant", content: "", done: false }]);
    setBusy(true);
    ambient.click(1.2);

    const update = (patch: Partial<Turn>) => setTurns((t) => t.map((x) => (x.id === aId ? { ...x, ...patch } : x)));

    try {
      abort.current = new AbortController();
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abort.current.signal,
      });
      if (res.status === 429) {
        const { retryAfter } = await res.json().catch(() => ({ retryAfter: 60 }));
        update({ content: `Interrogation paused. Too many questions; try again in ${retryAfter}s.`, done: true, error: true });
        return;
      }
      if (!res.ok || !res.body) {
        update({ content: "The file didn't respond. Try again in a moment.", done: true, error: true });
        return;
      }
      const mode = res.headers.get("X-Interrogate-Mode") === "live" ? "live" : "offline";
      update({ mode });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        update({ content: text });
      }
      update({ content: text.trim() || "That isn't in the file.", done: true });
    } catch (e) {
      if ((e as Error).name !== "AbortError") update({ content: "Connection lost mid-answer. Try again.", done: true, error: true });
      else update({ done: true });
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const mode = [...turns].reverse().find((t) => t.mode)?.mode;
  let q = 0;

  return (
    <div className="border border-rule bg-raised">
      <div className="t-label flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3 text-muted">
        <span>INTERROGATION ROOM 05 · TRANSCRIPT</span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className={`inline-block size-1.5 rounded-full ${busy ? "animate-pulse bg-accent" : mode === "live" ? "bg-accent" : "bg-rule"}`} />
          {mode === "live" ? "LIVE MODEL" : mode === "offline" ? "RECORDED ANSWERS" : "STANDING BY"}
        </span>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-busy={busy}
        aria-label="Interrogation transcript"
        data-lenis-prevent
        tabIndex={0}
        className="max-h-[min(460px,55svh)] min-h-48 overflow-y-auto px-4 py-4"
      >
        {turns.length === 0 && (
          <p className="t-label py-6 text-muted">
            No questions on record. Ask anything about the subject; answers come only from this dossier.
          </p>
        )}
        <ol>
        {turns.map((t) => {
          const n = t.role === "user" ? ++q : q;
          return (
            <li key={t.id} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[7.5rem_1fr]">
              <span className={`t-label pt-1 ${t.role === "user" ? "text-muted" : "text-accent-text"}`}>
                {t.role === "user" ? `Q-${String(n).padStart(2, "0")} VISITOR` : `A-${String(n).padStart(2, "0")} THE FILE`}
              </span>
              {t.role === "user" ? (
                <p className="text-lg">{t.content}</p>
              ) : (
                <Answer text={t.content} done={t.done} error={t.error} />
              )}
            </li>
          );
        })}
        </ol>
      </div>

      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t border-rule px-4 py-3" role="group" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="t-label min-h-6 border border-rule px-2.5 py-1.5 text-left normal-case tracking-normal hover:border-accent-text hover:text-accent-text"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3 border-t border-rule px-4 py-3 focus-within:border-accent-text">
        <label htmlFor="interrogate-input" className="t-label shrink-0 text-accent-text">
          ASK &gt;
        </label>
        <input
          id="interrogate-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX}
          autoComplete="off"
          placeholder="Ask the file about the subject…"
          aria-describedby="interrogate-help"
          className="min-w-0 flex-1 bg-transparent py-2 text-lg outline-none placeholder:text-muted"
        />
        {busy ? (
          <button type="button" onClick={() => abort.current?.abort()} className="t-label min-h-6 border border-rule px-3 py-2 hover:text-accent-text">
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="t-label min-h-6 border border-accent-text px-3 py-2 text-accent-text hover:bg-accent hover:text-accent-ink disabled:border-rule disabled:text-muted disabled:hover:bg-transparent"
          >
            Interrogate
          </button>
        )}
      </form>
      <p id="interrogate-help" className="t-label flex flex-wrap justify-between gap-2 border-t border-rule px-4 py-2 text-muted">
        <span>Answers come only from this dossier and can be wrong. The record above is authoritative.</span>
        <span aria-hidden="true">
          {input.length}/{MAX}
        </span>
      </p>
    </div>
  );
}

/**
 * Streams in as ciphertext: the newest characters arrive as glyphs and lock
 * into plaintext a beat later. While streaming, the visual layer is hidden
 * from assistive tech; the finished answer is announced once.
 */
function Answer({ text, done, error }: { text: string; done: boolean; error?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = useRef(text);
  const doneRef = useRef(done);

  useEffect(() => {
    target.current = text;
    doneRef.current = done;
  }, [text, done]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = target.current;
      return;
    }
    let shown = 0;
    let raf = 0;
    let last = performance.now();
    const TAIL = 7;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const goal = target.current.length;
      const backlog = goal - shown;
      // Reveal speed scales with backlog so long answers never lag far behind.
      shown = Math.min(goal, shown + Math.max(1, dt * Math.max(70, backlog * 4)));
      const n = Math.floor(shown);
      const lockedText = target.current.slice(0, n);
      let tail = "";
      const pending = Math.min(TAIL, goal - n + (doneRef.current ? 0 : 3));
      for (let i = 0; i < pending; i++) tail += randomGlyph(CIPHER);
      el.textContent = lockedText;
      if (tail) {
        const g = document.createElement("span");
        g.className = "decrypted";
        g.textContent = tail;
        el.appendChild(g);
      }
      if (doneRef.current && n >= goal) {
        el.textContent = target.current;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <p className={`whitespace-pre-wrap text-lg leading-relaxed ${error ? "text-muted" : ""}`}>
      <span ref={ref} aria-hidden="true" />
      {done && <span className="sr-only">{text}</span>}
    </p>
  );
}
