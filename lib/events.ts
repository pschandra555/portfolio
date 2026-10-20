import { certs, timeline, type Severity, type TimelineEvent } from "@/content/site";

export interface LogEvent {
  id: string;
  date: string;
  source: "EDU" | "CERT" | "CTF" | "INTERN" | "HACK" | "PROJ";
  severity: Severity;
  title: string;
  detail: string;
  /** Short state column, e.g. VERIFIED / SCHEDULED. */
  state: string;
}

const SOURCE: Record<TimelineEvent["kind"], LogEvent["source"]> = {
  education: "EDU",
  certification: "CERT",
  ctf: "CTF",
  internship: "INTERN",
  hackathon: "HACK",
  project: "PROJ",
};

/**
 * Every journey entry as a SIEM event. Certifications come straight from
 * `certs`, with their real status, so the log can never claim a cert that
 * isn't earned.
 */
export function buildEvents(): LogEvent[] {
  const fromTimeline: LogEvent[] = timeline.map((e) => ({
    id: "",
    date: e.date,
    source: SOURCE[e.kind],
    severity: e.severity,
    title: e.title,
    detail: e.detail,
    state: e.kind === "education" ? "ACTIVE" : "LOGGED",
  }));
  const fromCerts: LogEvent[] = certs.map((c) => ({
    id: "",
    date: c.date ?? "",
    source: "CERT",
    severity: c.status === "earned" ? "HIGH" : c.status === "in-progress" ? "MEDIUM" : "INFO",
    title:
      c.status === "earned"
        ? `Credential earned: ${c.name}`
        : c.status === "in-progress"
          ? `Training in progress: ${c.name}`
          : `Next target: ${c.name}`,
    detail:
      c.status === "earned"
        ? `Issued by ${c.issuer}.${c.credentialUrl ? " Credential verifiable." : " Verification link pending."}`
        : c.status === "in-progress"
          ? `${c.issuer}.${c.progress ? ` ${c.progress}.` : ""} Not yet earned.`
          : `${c.issuer}. Scheduled, not started.`,
    state: c.status === "earned" ? (c.credentialUrl ? "VERIFIED" : "EARNED") : c.status === "in-progress" ? "IN PROGRESS" : "SCHEDULED",
  }));
  return [...fromTimeline, ...fromCerts].map((e, i) => ({ ...e, id: `EVT-${(0x7f30 + i).toString(16).toUpperCase()}` }));
}
