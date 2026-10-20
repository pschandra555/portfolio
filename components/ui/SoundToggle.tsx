"use client";

import { ambient, useAmbient } from "@/lib/sound";

/** Ambient server-room hum + typewriter clicks. Off by default. */
export function SoundToggle() {
  const on = useAmbient();
  return (
    <button
      type="button"
      onClick={() => void ambient.toggle()}
      aria-pressed={on}
      aria-label="Ambient sound"
      className="t-label inline-flex min-h-6 items-center gap-1.5 px-1 hover:text-accent-text"
    >
      <span aria-hidden="true" className="flex h-2.5 items-end gap-px">
        {[0.5, 1, 0.7].map((h, i) => (
          <span
            key={i}
            className={`w-[2px] bg-current ${on ? "eq-bar" : ""}`}
            style={{ height: on ? `${h * 100}%` : "2px", animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
      <span className={on ? "text-accent-text" : "text-muted"}>SOUND {on ? "ON" : "OFF"}</span>
    </button>
  );
}
