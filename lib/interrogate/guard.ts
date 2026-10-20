import { certs, isPending, projects } from "@/content/site";
import { certStatus, projectStatus } from "./knowledge";

/**
 * Honesty guard: the last line of defence after the system prompt.
 * Model output is checked sentence by sentence as it streams. Any sentence
 * that claims an unearned cert, a project that isn't live, or a metric that
 * was never measured is replaced with the true status from site.ts.
 */

const NEG =
  /\b(not|no|never|yet to|hasn't|has not|isn't|is not|planned|plans?|planning|aims?|aiming|target(?:s|ing|ed)?|towards?|toward|in progress|pursuing|preparing|working on|will|next|intends?|scheduled|roadmap|goal|hopes?|wants? to|future)\b|n't\b/i;
const CLAIM_CERT = /\b(holds?|has|have|had|earned|obtained|achieved|passed|completed|certified|acquired|awarded|got|cleared|possess(?:es)?)\b/i;
const CLAIM_LIVE = /\b(is live|are live|went live|launched|deployed|in production|released|shipped|available (?:now|online)|up and running|is running|publicly available)\b/i;
const METRIC = /\d+(?:\.\d+)?\s?%|\b\d{2,}[\d,]*\s+(?:sessions?|ips?|attacks?|attackers?|users?|repos?|repositories|flows?|alerts?|scans?|findings?|downloads?|installs?)\b/i;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (names: string[]) => new RegExp(names.map((n) => `(?<![a-z0-9])${escape(n)}(?![a-z0-9])`).join("|"), "i");

const unearned = certs
  .filter((c) => c.status !== "earned")
  .map((c) => ({ re: mentions([c.name, ...(c.aliases ?? [])]), fix: `${c.name} is ${certStatus(c).toLowerCase()}.` }));

const notLive = projects
  .filter((p) => p.status !== "live")
  .map((p) => ({ re: mentions([p.name, p.codename]), fix: `${p.name} is ${projectStatus(p).toLowerCase()}.` }));

const unmeasured = projects
  .filter((p) => p.results.every((r) => isPending(r.value)))
  .map((p) => ({ re: mentions([p.name, p.codename]), fix: `${p.name} has no measured results yet, so there are no numbers to share.` }));

export function checkSentence(s: string): string {
  const negated = NEG.test(s);
  const pick = (rules: { re: RegExp; fix: string }[]) => rules.filter((r) => r.re.test(s)).map((r) => r.fix);
  const fixes = [
    ...(CLAIM_CERT.test(s) && !negated ? pick(unearned) : []),
    ...(CLAIM_LIVE.test(s) && !negated ? pick(notLive) : []),
    ...(METRIC.test(s) ? pick(unmeasured) : []),
  ];
  // Replace the whole sentence: partial edits of a false claim can still mislead.
  return fixes.length ? lead(s) + Array.from(new Set(fixes)).join(" ") + trail(s) : s;
}

const trail = (s: string) => (/\n$/.test(s) ? "\n" : "");

const lead = (s: string) => s.match(/^\s*/)?.[0] ?? "";

/** Buffers streamed text into sentences and passes each through the guard. */
export class SentenceGuard {
  private buf = "";
  push(text: string): string {
    this.buf += text;
    let out = "";
    // A sentence ends at . ! ? or a newline, followed by whitespace.
    const re = /[.!?](?=\s)|\n/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(this.buf))) {
      const end = m.index + m[0].length;
      out += checkSentence(this.buf.slice(last, end));
      last = end;
    }
    this.buf = this.buf.slice(last);
    return out;
  }
  end(): string {
    const rest = this.buf ? checkSentence(this.buf) : "";
    this.buf = "";
    return rest;
  }
}
