"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isPending } from "@/content/site";
import type { LogEvent } from "@/lib/events";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const SEV_CLASS: Record<LogEvent["severity"], string> = {
  CRITICAL: "bg-accent text-accent-ink border-accent",
  HIGH: "bg-accent text-accent-ink border-accent",
  MEDIUM: "text-accent-text border-accent-text",
  LOW: "text-ink border-rule",
  INFO: "text-muted border-rule",
};

/**
 * The journey as a SIEM event stream. Rows stream in as they scroll into
 * view; filter chips narrow by source. All rows are in the DOM from the
 * start: the streaming is visual only.
 */
export function SiemLog({ events }: { events: LogEvent[] }) {
  const sources = useMemo(() => Array.from(new Set(events.map((e) => e.source))), [events]);
  const [filter, setFilter] = useState<string>("ALL");
  const body = useRef<HTMLOListElement>(null);
  const shown = filter === "ALL" ? events : events.filter((e) => e.source === filter);

  useEffect(() => {
    const el = body.current;
    if (!el || prefersReducedMotion()) return;
    el.classList.add("siem-live");
    let batch = 0;
    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        // Stagger rows that arrive together, like events flushing from a buffer.
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => (batch = 0));
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const row = e.target as HTMLElement;
          row.style.transitionDelay = `${batch++ * 90}ms`;
          row.dataset.in = "true";
          io.unobserve(row);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    el.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [filter]);

  return (
    <div className="border border-rule bg-raised">
      <div className="t-label flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <span className="text-muted">
          index=subject sourcetype=journey | sort time · <span className="text-ink">{shown.length} events</span>
        </span>
        <div role="group" aria-label="Filter events by source" className="flex flex-wrap gap-1.5">
          {["ALL", ...sources].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={`min-h-6 border px-2 py-0.5 ${filter === s ? "border-accent bg-accent text-accent-ink" : "border-rule text-muted hover:text-ink"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="t-label hidden grid-cols-[9rem_6.5rem_4.5rem_6.5rem_1fr_7rem] gap-4 border-b border-rule px-4 py-2 text-muted lg:grid">
        <span>TIME</span>
        <span>EVENT ID</span>
        <span>SRC</span>
        <span>SEVERITY</span>
        <span>MESSAGE</span>
        <span className="text-right">STATE</span>
      </div>

      <ol ref={body} key={filter} className="font-mono text-[13px]">
        {shown.map((e) => (
          <li
            key={e.id}
            className="siem-row grid gap-x-4 gap-y-1 border-b border-rule px-4 py-4 last:border-b-0 lg:grid-cols-[9rem_6.5rem_4.5rem_6.5rem_1fr_7rem]"
          >
            <span className={isPending(e.date) ? "text-muted" : ""}>
              {isPending(e.date) ? (
                <>
                  <span aria-hidden="true">████-██</span>
                  <span className="sr-only">Date pending</span>
                </>
              ) : (
                e.date
              )}
            </span>
            <span className="text-muted">{e.id}</span>
            <span>{e.source}</span>
            <span>
              <span className={`inline-block border px-1.5 text-[11px] tracking-[0.06em] ${SEV_CLASS[e.severity]}`}>{e.severity}</span>
            </span>
            <span className="min-w-0 [font-family:var(--font-sans)] text-[15px]">
              {e.title}
              <span className="block text-muted">{e.detail}</span>
            </span>
            <span className="t-label lg:text-right">{e.state}</span>
          </li>
        ))}
      </ol>
      <p className="t-label flex items-center gap-2 border-t border-rule px-4 py-3 text-muted">
        <span aria-hidden="true" className="inline-block h-3 w-1.5 animate-pulse bg-accent" />
        tail -f: awaiting new events…
      </p>
    </div>
  );
}
