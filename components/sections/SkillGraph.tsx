"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TOPO_H, TOPO_W, type Topology } from "@/lib/topology";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Sel = { kind: "skill" | "project"; id: string } | null;

/**
 * Attack-surface map: skills are hosts grouped into subnets, wired to the
 * operations that used them. Click (or Enter) a host to ping it: packets run
 * to its operations and everything else dims. Hover/focus shows a port scan.
 */
export function SkillGraph({ topo }: { topo: Topology }) {
  const reduced = useReducedMotion();
  const [sel, setSel] = useState<Sel>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [ping, setPing] = useState(0);

  const skillById = useMemo(() => new Map(topo.skills.map((s) => [s.id, s])), [topo]);
  const projectBySlug = useMemo(() => new Map(topo.projects.map((p) => [p.slug, p])), [topo]);

  const lit = useMemo(() => {
    if (!sel) return null;
    const skillsLit = new Set<string>();
    const projectsLit = new Set<string>();
    if (sel.kind === "skill") {
      skillsLit.add(sel.id);
      skillById.get(sel.id)!.projects.forEach((p) => projectsLit.add(p));
    } else {
      projectsLit.add(sel.id);
      projectBySlug.get(sel.id)!.skills.forEach((s) => skillsLit.add(s));
    }
    return { skillsLit, projectsLit };
  }, [sel, skillById, projectBySlug]);

  const select = (next: Sel) => {
    setSel((cur) => (cur && next && cur.kind === next.kind && cur.id === next.id ? null : next));
    setPing((n) => n + 1);
  };

  const status = (() => {
    if (!sel) return "Select a host to ping it. Its operations will answer.";
    if (sel.kind === "skill") {
      const s = skillById.get(sel.id)!;
      const replies = s.projects.map((p) => projectBySlug.get(p)!.codename);
      return replies.length
        ? `PING ${s.ip} (${s.label}): ${replies.length} ${replies.length === 1 ? "host" : "hosts"} replied: ${replies.join(", ")}`
        : `PING ${s.ip} (${s.label}): no operations route here yet. Training ground only.`;
    }
    const p = projectBySlug.get(sel.id)!;
    return `TRACE OP ${p.codename}: ${p.skills.length} hosts in path: ${p.skills.map((id) => skillById.get(id)!.label).join(", ")}`;
  })();

  const tip = hover ? skillById.get(hover) : null;
  const dim = (on: boolean) => (lit && !on ? 0.16 : 1);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${TOPO_W} ${TOPO_H}`}
        className="h-auto w-full select-none"
        data-cursor="Ping"
        role="group"
        aria-label="Skills network map. Each skill is a host; activate one to see which operations used it."
        onClick={(e) => e.target === e.currentTarget && setSel(null)}
      >
        {/* subnets */}
        {topo.subnets.map((sn) => (
          <g key={sn.id} aria-hidden="true" style={{ opacity: lit ? 0.5 : 1, transition: "opacity .3s" }}>
            <circle cx={sn.x} cy={sn.y} r={sn.r} fill="none" stroke="var(--rule)" strokeDasharray="2 5" />
            <text x={sn.x} y={sn.y - sn.r - 8} textAnchor="middle" className="fill-muted font-mono text-[11px] uppercase tracking-[0.08em]">
              {sn.label} · {sn.cidr}
            </text>
          </g>
        ))}

        {/* links */}
        <g aria-hidden="true">
          {topo.edges.map((e) => {
            const s = skillById.get(e.skill)!;
            const p = projectBySlug.get(e.project)!;
            const on = !!lit && lit.skillsLit.has(e.skill) && lit.projectsLit.has(e.project);
            return (
              <line
                key={e.skill + e.project}
                x1={s.x}
                y1={s.y}
                x2={p.x}
                y2={p.y}
                stroke={on ? "var(--accent-text)" : "var(--rule)"}
                strokeWidth={on ? 1.4 : 1}
                style={{ opacity: dim(on), transition: "opacity .3s, stroke .3s" }}
              />
            );
          })}
        </g>

        {/* packets */}
        {lit && !reduced && (
          <g key={ping} aria-hidden="true">
            {topo.edges
              .filter((e) => lit.skillsLit.has(e.skill) && lit.projectsLit.has(e.project))
              .map((e, i) => {
                const s = skillById.get(e.skill)!;
                const p = projectBySlug.get(e.project)!;
                const [a, b] = sel!.kind === "skill" ? [s, p] : [p, s];
                return (
                  <circle key={i} r={3.5} className="fill-accent" opacity={0}>
                    <animateMotion dur="0.75s" begin={`${i * 0.08}s`} repeatCount="3" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
                    <animate attributeName="opacity" values="0;1;1;0" dur="0.75s" begin={`${i * 0.08}s`} repeatCount="3" />
                  </circle>
                );
              })}
          </g>
        )}

        {/* projects */}
        {topo.projects.map((p) => {
          const on = !!lit?.projectsLit.has(p.slug);
          return (
            <g
              key={p.slug}
              role="button"
              tabIndex={0}
              aria-pressed={sel?.kind === "project" && sel.id === p.slug}
              aria-label={`Operation ${p.codename}: trace its ${p.skills.length} skills`}
              className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--accent-text)] [&:focus-visible>rect]:[stroke-width:2]"
              onClick={() => select({ kind: "project", id: p.slug })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), select({ kind: "project", id: p.slug }))}
              style={{ opacity: dim(on), transition: "opacity .3s" }}
            >
              <rect x={p.x - 52} y={p.y - 15} width={104} height={30} fill={on ? "var(--accent)" : "var(--bg-raised)"} stroke="var(--ink)" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className={`font-mono text-[10px] tracking-[0.06em] ${on ? "fill-accent-ink" : "fill-ink"}`}>
                {p.codename}
              </text>
            </g>
          );
        })}

        {/* skill hosts */}
        {topo.skills.map((s) => {
          const on = !!lit?.skillsLit.has(s.id);
          const active = sel?.kind === "skill" && sel.id === s.id;
          return (
            <g
              key={s.id}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${s.label}, ${s.ip}. Tools: ${s.tools.map((t) => t.name).join(", ")}. Used in ${s.projects.length} operations. Ping.`}
              className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--accent-text)] [&:focus-visible>rect]:[stroke-width:2]"
              onClick={() => select({ kind: "skill", id: s.id })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), select({ kind: "skill", id: s.id }))}
              onPointerEnter={() => setHover(s.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
              style={{ opacity: dim(on), transition: "opacity .3s" }}
            >
              <rect x={s.x - 18} y={s.y - 18} width={36} height={36} fill="transparent" stroke="none" />
              <rect
                x={s.x - 5}
                y={s.y - 5}
                width={10}
                height={10}
                fill={on ? "var(--accent)" : "var(--bg)"}
                stroke={on ? "var(--accent-text)" : "var(--ink)"}
              />
              <text x={s.x} y={s.y + 20} textAnchor="middle" className={`font-sans text-[12px] ${on ? "fill-accent-text" : "fill-ink"}`}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* port-scan tooltip */}
      {tip && (
        <div
          aria-hidden="true"
          className="t-label pointer-events-none absolute z-10 w-64 -translate-x-1/2 border border-rule bg-bg p-3 shadow-xl"
          style={{ left: `${(tip.x / TOPO_W) * 100}%`, top: `calc(${(tip.y / TOPO_H) * 100}% + 34px)` }}
        >
          <p className="mb-2 normal-case text-muted">Nmap scan report for {tip.id}.local ({tip.ip})</p>
          <div className="grid grid-cols-[5.5rem_3rem_1fr] gap-y-0.5">
            <span className="text-muted">PORT</span>
            <span className="text-muted">STATE</span>
            <span className="text-muted">SERVICE</span>
            {tip.tools.map((t) => (
              <span key={t.name} className="contents">
                <span>{t.port}</span>
                <span className="text-accent-text">open</span>
                <span className="truncate normal-case">{t.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p aria-live="polite" className="t-label mt-4 min-h-[3em] border-t border-rule pt-3">
        <span className="text-accent-text">$ </span>
        {status}
        {sel?.kind === "project" && (
          <Link href={`/operations/${sel.id}`} prefetch={true} transitionTypes={["redact"]} className="ml-3 underline hover:text-accent-text">
            Open case file →
          </Link>
        )}
      </p>
    </div>
  );
}
