import { profile, sections } from "@/content/site";

/**
 * The metadata strip that opens every file:
 * [FILE 02] — OPERATIONS ........................ CASE #SC-0x7F3A · PAGE 03/07
 */
export function FileHeader({ id, title }: { id: string; title?: string }) {
  const i = sections.findIndex((s) => s.id === id);
  const s = sections[i];
  return (
    <div className="t-label flex items-center gap-3 text-muted">
      <span className="whitespace-nowrap text-ink">
        [FILE {s.file}] — {(title ?? s.label).toUpperCase()}
      </span>
      <span aria-hidden="true" className="rule-x hidden flex-1 sm:block" />
      <span className="hidden whitespace-nowrap md:inline">
        CASE #{profile.caseNo} · PAGE {String(i + 1).padStart(2, "0")}/{String(sections.length).padStart(2, "0")}
      </span>
    </div>
  );
}
