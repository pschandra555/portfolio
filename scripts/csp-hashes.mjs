// CSP layer 2: hash every inline script in the prerendered HTML.
//
// Runs after `next build` (see package.json "build"). For each fully
// prerendered page it adds, right after <meta charset>,
//   <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'sha256-…' …">
// listing the SHA-256 of every inline <script> on that page. Together with the
// header CSP from next.config.ts, an inline script only runs if it's listed.
//
// Pages with a postponed (streamed-at-request-time) part are skipped: their
// streamed scripts can't be known at build time, so they keep the header CSP only.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = process.env.NEXT_DIST_DIR ?? ".next";
const root = join(dist, "server", "app");
if (!existsSync(root)) {
  console.error(`[csp] ${root} not found. Run next build first.`);
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });

const SCRIPT = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
const DATA_TYPES = /type=["']?(application\/(ld\+)?json|text\/template)/i;

let pages = 0;
let skipped = 0;
for (const file of walk(root)) {
  const metaFile = file.replace(/\.html$/, ".meta");
  if (existsSync(metaFile)) {
    const meta = JSON.parse(readFileSync(metaFile, "utf8"));
    if (meta.postponed) {
      skipped++;
      console.log(`[csp] skip (streams at request time): ${file}`);
      continue;
    }
  }
  let html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;

  const hashes = new Set();
  for (const [, attrs = "", body] of html.matchAll(SCRIPT)) {
    if (/\ssrc=/i.test(attrs) || DATA_TYPES.test(attrs)) continue;
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }

  const policy = `script-src 'self' ${[...hashes].join(" ")}`.trim();
  const tag = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`;
  const charset = html.match(/<meta charSet="utf-8"\s*\/?>/i);
  const at = charset ? charset.index + charset[0].length : html.indexOf("<head>") + "<head>".length;
  if (at < 6 || html.slice(0, at).includes("<script")) {
    console.error(`[csp] can't place meta before the first script in ${file}`);
    process.exit(1);
  }
  html = html.slice(0, at) + tag + html.slice(at);
  writeFileSync(file, html);
  pages++;
  console.log(`[csp] ${hashes.size} inline scripts hashed: ${file}`);
}
console.log(`[csp] done: ${pages} pages hardened, ${skipped} skipped.`);
