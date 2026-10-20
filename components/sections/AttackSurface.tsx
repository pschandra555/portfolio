import { skills, subnets } from "@/content/site";
import { buildTopology } from "@/lib/topology";
import { Section } from "./Section";
import { SkillGraph } from "./SkillGraph";
import { DecryptText } from "@/components/text/DecryptText";

/**
 * 03 — ATTACK SURFACE. The network map on tablet/desktop; the subnet list is
 * the phone layout and the screen-reader-friendly version everywhere.
 */
export function AttackSurface() {
  const topo = buildTopology();
  return (
    <Section id="attack-surface">
      <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id="attack-surface-title" className="t-display text-[clamp(3.5rem,12vw,10rem)] md:col-span-8">
          <DecryptText text="ATTACK SURFACE" />
        </h2>
        <p className="max-w-[40ch] text-muted md:col-span-4">
          No progress bars. Skills are hosts on the subject&apos;s network. Ping one to see which operations it was used in.
        </p>
      </div>

      <div className="hidden md:block">
        <SkillGraph topo={topo} />
      </div>

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 md:sr-only">
        {subnets.map((n) => (
          <div key={n.id}>
            <h3 className="t-label mb-3 flex justify-between border-b border-rule pb-2">
              <span>{n.label}</span>
              <span className="text-muted">{n.cidr}</span>
            </h3>
            <ul className="space-y-2">
              {topo.skills
                .filter((s) => s.subnet === n.id)
                .map((s) => (
                  <li key={s.id}>
                    <span className="flex justify-between gap-4">
                      <span>{s.label}</span>
                      <span className="t-label self-center text-right text-muted">{s.tools.map((t) => t.name).join(" · ")}</span>
                    </span>
                    {s.projects.length > 0 && (
                      <span className="t-label block text-accent-text">
                        → {s.projects.map((p) => topo.projects.find((x) => x.slug === p)!.codename).join(", ")}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <p className="sr-only">{skills.length} skills across {subnets.length} subnets.</p>
      </div>
    </Section>
  );
}
