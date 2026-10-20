"use client";

import { profile } from "@/content/site";
import { useLocalTime } from "@/lib/time";

/** Live status pill, styled as a clearance badge, with the subject's local time. */
export function ClearanceBadge() {
  const time = useLocalTime("minutes");
  return (
    <p className="t-label inline-flex flex-wrap items-center gap-x-2 gap-y-1 border border-accent-text bg-bg px-3 py-2">
      <span aria-hidden="true" className="inline-block size-1.5 animate-pulse rounded-full bg-accent shadow-[var(--accent-glow)]" />
      <span className="text-muted">CLEARANCE</span>
      <span className="text-ink">{profile.status.toUpperCase()}</span>
      <span aria-hidden="true" className="text-rule">
        |
      </span>
      <span className="text-muted">
        <time>{time}</time> IST
      </span>
    </p>
  );
}
