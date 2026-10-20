import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import { projects, skills, subnets, type SubnetId } from "@/content/site";

/**
 * Network-topology layout for the Attack Surface graph.
 * Runs at build time on the server (d3-force is deterministic), so the client
 * receives plain coordinates and ships no physics code.
 */

export const TOPO_W = 1000;
export const TOPO_H = 660;

export interface TopoSkill {
  id: string;
  label: string;
  subnet: SubnetId;
  ip: string;
  tools: { name: string; port: string }[];
  projects: string[];
  x: number;
  y: number;
}
export interface TopoProject {
  slug: string;
  codename: string;
  skills: string[];
  x: number;
  y: number;
}
export interface TopoSubnet {
  id: SubnetId;
  label: string;
  cidr: string;
  x: number;
  y: number;
  r: number;
}
export interface Topology {
  skills: TopoSkill[];
  projects: TopoProject[];
  subnets: TopoSubnet[];
  edges: { skill: string; project: string }[];
}

const PORTS = ["22/tcp", "80/tcp", "443/tcp", "445/tcp", "3000/tcp", "5601/tcp", "8080/tcp", "8443/tcp", "9200/tcp", "53/udp"];
const portFor = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PORTS[h % PORTS.length];
};

type Node = SimulationNodeDatum & { id: string; kind: "skill" | "project"; subnet?: SubnetId };

export function buildTopology(): Topology {
  const cx = TOPO_W / 2;
  const cy = TOPO_H / 2;

  const anchors = new Map(
    subnets.map((s, i) => {
      const a = -Math.PI / 2 + (i / subnets.length) * Math.PI * 2;
      return [s.id, { x: cx + Math.cos(a) * 360, y: cy + Math.sin(a) * 235 }];
    }),
  );

  const projectNodes: Node[] = projects.map((p, i) => {
    const a = Math.PI / 4 + (i / projects.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * 120;
    const y = cy + Math.sin(a) * 78;
    return { id: `p:${p.slug}`, kind: "project", x, y, fx: x, fy: y };
  });

  const skillNodes: Node[] = skills.map((s, i) => {
    const a = anchors.get(s.subnet)!;
    return { id: s.id, kind: "skill", subnet: s.subnet, x: a.x + ((i * 37) % 60) - 30, y: a.y + ((i * 53) % 60) - 30 };
  });

  const edges = projects.flatMap((p) => p.skills.filter((id) => skills.some((s) => s.id === id)).map((id) => ({ skill: id, project: p.slug })));

  const sim = forceSimulation<Node>([...skillNodes, ...projectNodes])
    .force("x", forceX<Node>((d) => (d.kind === "skill" ? anchors.get(d.subnet!)!.x : cx)).strength(0.32))
    .force("y", forceY<Node>((d) => (d.kind === "skill" ? anchors.get(d.subnet!)!.y : cy)).strength(0.32))
    .force("charge", forceManyBody<Node>().strength(-90))
    .force("collide", forceCollide<Node>((d) => (d.kind === "project" ? 60 : 48)))
    .force(
      "link",
      forceLink<Node, { source: string; target: string }>(edges.map((e) => ({ source: e.skill, target: `p:${e.project}` })))
        .id((d) => d.id)
        .distance(230)
        .strength(0.015),
    )
    .stop();
  for (let i = 0; i < 420; i++) sim.tick();

  const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)));
  const pos = new Map(skillNodes.map((n) => [n.id, { x: clamp(n.x!, 70, TOPO_W - 70), y: clamp(n.y!, 40, TOPO_H - 50) }]));

  const counters = new Map<string, number>();
  const topoSkills: TopoSkill[] = skills.map((s) => {
    const n = (counters.get(s.subnet) ?? 10) + 1;
    counters.set(s.subnet, n);
    const base = subnets.find((x) => x.id === s.subnet)!.cidr.split(".").slice(0, 3).join(".");
    return {
      id: s.id,
      label: s.label,
      subnet: s.subnet,
      ip: `${base}.${n}`,
      tools: s.tools.map((t) => ({ name: t, port: portFor(t) })),
      projects: edges.filter((e) => e.skill === s.id).map((e) => e.project),
      ...pos.get(s.id)!,
    };
  });

  const topoSubnets: TopoSubnet[] = subnets.map((sn) => {
    const members = topoSkills.filter((s) => s.subnet === sn.id);
    const x = members.reduce((a, m) => a + m.x, 0) / members.length;
    const y = members.reduce((a, m) => a + m.y, 0) / members.length;
    const r = Math.max(...members.map((m) => Math.hypot(m.x - x, m.y - y))) + 44;
    return { id: sn.id, label: sn.label, cidr: sn.cidr, x: Math.round(x), y: Math.round(y), r: Math.round(r) };
  });

  return {
    skills: topoSkills,
    projects: projects.map((p, i) => ({
      slug: p.slug,
      codename: p.codename,
      skills: edges.filter((e) => e.project === p.slug).map((e) => e.skill),
      x: Math.round(projectNodes[i].x!),
      y: Math.round(projectNodes[i].y!),
    })),
    subnets: topoSubnets,
    edges,
  };
}
