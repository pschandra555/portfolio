import type { CSSProperties, ReactNode } from "react";

type Tone = "stamp" | "accent" | "ink" | "muted";

const toneClass: Record<Tone, string> = {
  stamp: "text-stamp",
  accent: "text-accent-text",
  ink: "text-ink",
  muted: "text-muted",
};

/**
 * A rubber stamp: typewriter face, double rule, slight rotation and an ink
 * texture mask so it never looks like a flat CSS badge.
 * `dashed` is for "not yet" states (planned / next target).
 */
export function Stamp({
  children,
  tone = "stamp",
  rotate = -4,
  dashed = false,
  size = "md",
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: Tone;
  rotate?: number;
  dashed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}) {
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-5 py-2 text-3xl" : "px-3 py-1 text-base";
  return (
    <span
      className={`stamp t-type inline-block uppercase leading-none tracking-[0.12em] ${pad} ${toneClass[tone]} ${className}`}
      data-dashed={dashed || undefined}
      style={{ rotate: `${rotate}deg`, ...style }}
    >
      {children}
    </span>
  );
}
