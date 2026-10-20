import Link from "next/link";
import { isPending, type Project } from "@/content/site";
import { CaseHeader } from "./CaseHeader";
import { CrtFeed } from "./CrtFeed";
import { opNumber } from "./status";

/** One case file in the sticky stack. The whole card is a link to the full case page. */
export function OperationCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const done = project.roadmap.filter((r) => r.done).length;
  return (
    <article
      data-cursor="Open"
      className="op-card relative border border-rule bg-raised px-5 pb-6 pt-10 md:sticky md:px-10 md:pb-10 md:pt-14"
      style={{ "--i": index, "--n": total } as React.CSSProperties}
      aria-labelledby={`op-${project.slug}-title`}
    >
      <CaseHeader project={project} index={index} />

      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <div className="space-y-6 md:col-span-7">
          <p className="text-xl leading-snug md:text-2xl">{project.tagline}</p>
          <dl className="t-label grid gap-y-2 sm:grid-cols-[7rem_1fr]">
            <dt className="text-muted max-sm:mt-2">OBJECTIVE</dt>
            <dd className="normal-case tracking-normal [font-family:var(--font-sans)] text-base">{project.objective}</dd>
            <dt className="text-muted max-sm:mt-2">STACK</dt>
            <dd className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span key={s} className="border border-rule px-1.5 py-0.5">
                  {s}
                </span>
              ))}
            </dd>
            <dt className="text-muted max-sm:mt-2">ROADMAP</dt>
            <dd className="flex items-center gap-3">
              <span aria-hidden="true" className="flex gap-0.5">
                {project.roadmap.map((r, i) => (
                  <span key={i} className={`h-2 w-4 ${r.done ? "bg-accent" : "border border-rule"}`} />
                ))}
              </span>
              {done}/{project.roadmap.length} milestones
            </dd>
            <dt className="text-muted max-sm:mt-2">ETA</dt>
            <dd>{isPending(project.eta) ? <span className="text-muted">[PENDING DATA]</span> : project.eta}</dd>
          </dl>
        </div>
        <div className="hidden md:col-span-5 md:block">
          <CrtFeed src={project.demoVideo} label={`FEED // ${opNumber(index)} // ${project.codename}`} />
        </div>
      </div>

      <Link
        href={`/operations/${project.slug}`}
        prefetch={true}
        className="t-label mt-8 inline-flex items-center gap-2 border-b border-current pb-0.5 hover:text-accent-text after:absolute after:inset-0 after:content-['']"
      >
        Open case file <span aria-hidden="true">→</span>
        <span className="sr-only">: Operation {project.name}</span>
      </Link>
    </article>
  );
}
