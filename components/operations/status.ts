import type { ProjectStatus } from "@/content/site";

export const statusStamp: Record<ProjectStatus, { text: string; tone: "accent" | "ink" | "muted"; dashed: boolean }> = {
  live: { text: "Live", tone: "accent", dashed: false },
  "in-development": { text: "In development", tone: "ink", dashed: false },
  planned: { text: "Planned", tone: "muted", dashed: true },
};

export const opNumber = (i: number) => `OP-${String(i + 1).padStart(2, "0")}`;
