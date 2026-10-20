import { ViewTransition } from "react";
import type { Project } from "@/content/site";
import { Stamp } from "@/components/dossier/Stamp";
import { opNumber, statusStamp } from "./status";

/**
 * The folder tab + codename strip. The same element appears on the card and
 * on the case page, so the browser morphs one into the other on navigation.
 */
export function CaseHeader({ project, index, as: Tag = "h3", large = false }: { project: Project; index: number; as?: "h1" | "h3"; large?: boolean }) {
  const s = statusStamp[project.status];
  return (
    <ViewTransition name={`op-${project.slug}`} share="morph" default="none">
      <div className="relative">
        {/* folder tab */}
        <span aria-hidden="true" className="t-label absolute -top-7 left-0 border border-b-0 border-rule bg-raised px-3 py-1.5 text-muted">
          {opNumber(index)} · CASE FILE
        </span>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Tag id={`op-${project.slug}-title`} className={`t-display ${large ? "text-[clamp(3.5rem,13vw,11rem)]" : "text-[clamp(3rem,7vw,6rem)]"}`}>
            <span className="t-label block pb-2 text-muted">Operation</span>
            {project.codename}
          </Tag>
          <Stamp tone={s.tone} dashed={s.dashed} rotate={-5} size={large ? "lg" : "md"} className="mt-2">
            {s.text}
          </Stamp>
        </div>
      </div>
    </ViewTransition>
  );
}
