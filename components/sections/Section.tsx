import type { ReactNode } from "react";
import { FileHeader } from "@/components/dossier/FileHeader";
import { FoldMarks } from "@/components/dossier/FoldMarks";

/** One "file" in the dossier. Registers itself with the HUD via data-section. */
export function Section({
  id,
  children,
  className = "",
  headerTitle,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  headerTitle?: string;
}) {
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={`${id}-title`}
      className={`relative z-10 mx-[var(--gutter)] py-[var(--section-y)] lg:mr-[calc(var(--gutter)+52px)] outline-none ${className}`}
    >
      <FoldMarks />
      <FileHeader id={id} title={headerTitle} />
      <div className="pt-10 md:pt-16">{children}</div>
    </section>
  );
}
