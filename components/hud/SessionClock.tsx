"use client";

import { useSessionId } from "@/lib/session";
import { useLocalTime } from "@/lib/time";

/** Bottom-left HUD: session id + the subject's local time (IST). */
export function SessionClock() {
  const session = useSessionId();
  const time = useLocalTime();
  return (
    <p className="flex items-center gap-3">
      <span className="hidden sm:inline">
        <span className="text-muted">SESSION </span>0x{session}
      </span>
      <span>
        <span className="text-muted">IST </span>
        <time>{time}</time>
      </span>
    </p>
  );
}
