# DECRYPT · Sarath Chandra's portfolio

A classified threat-intelligence dossier that arrives encrypted and decrypts as you read.
Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · React Three Fiber + custom GLSL · Groq.

## Edit the content

Everything visitors read lives in **`content/site.ts`**: profile, links, about story, certifications, projects, skills, timeline, CTFs.

- Anything you haven't filled in yet is `ADD` or `null`. The site shows it as `[PENDING DATA]` instead of inventing anything.
- **Certifications:** a cert shows **VERIFIED** only when `status: "earned"` **and** `credentialUrl` is set. The AI chat and the terminal read the same statuses.
- **Projects:** keep `results[].value` as `ADD` until you have real numbers. Move `status` to `"live"` only when it's live.
- **Story:** wrap a word in `*asterisks*` to have it declassify in amber.
- **Demo clips:** put muted `.mp4`/`.webm` files in `public/media/` and set `demoVideo: "/media/name.mp4"`.
- **Housekeeping:** bump `meta.updated` when you publish changes and `meta.securityTxtExpires` once a year.

The mini-CTF flags are hidden in three places (see the top of `lib/ctf.ts`). To change one:

```bash
node scripts/flag-hash.mjs 'FLAG{new_flag}'
```

## Develop

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY for live AI answers (optional)
npm run dev
```

`npm run build` = `next build` + `scripts/csp-hashes.mjs` (see Security). To test a production build next to the dev server:

```bash
NEXT_DIST_DIR=.next-build npm run build && NEXT_DIST_DIR=.next-build npx next start -p 3001
```

## Security

- **CSP, two layers.** The HTTP header (`next.config.ts`) locks down every source (`default-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, …). After the build, `scripts/csp-hashes.mjs` adds a `<meta>` CSP to every prerendered page that allows only the SHA-256 hashes of that page's own inline scripts. Browsers enforce both, so injected inline scripts, foreign scripts, beacons and exfiltration requests are all blocked, while the site stays fully static.
- HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP. No `X-Powered-By`.
- `/api/interrogate`: same-origin only, 8 KB body cap, strict schema, per-IP + global daily rate limits (Upstash if configured, in-memory otherwise), hashed IPs, upstream timeout, never forwards upstream errors. API keys are server-only.
- AI honesty: answers come only from `site.ts`, and a sentence-level guard rewrites any claim of an unearned cert, an unlaunched project, or an unmeasured metric.
- `/.well-known/security.txt` (RFC 9116), generated from `site.ts`.

## Deploy to Vercel

1. **Push to GitHub.**
   ```bash
   git init && git add -A && git commit -m "Initial dossier"
   ```
   ```bash
   gh repo create portfolio --private --source=. --push
   ```
2. **Import** the repo at [vercel.com/new](https://vercel.com/new). It detects Next.js. Keep the default build command (`npm run build`, which includes the CSP step) and Node.js 22 or newer.
3. **Environment variables** (Project → Settings → Environment Variables), all optional:
   `GROQ_API_KEY`, `GROQ_MODEL`, `INTERROGATE_DAILY_CAP`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
4. **Deploy**, then set `links.site` in `content/site.ts` to your real URL (metadata, sitemap, OG and security.txt use it) and push again.
5. **Verify:**
   - View source on `/`: the `<head>` should contain `<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'sha256-…`.
   - [securityheaders.com](https://securityheaders.com) and [PageSpeed Insights](https://pagespeed.web.dev) (mobile).
   - `/.well-known/security.txt`, `/sitemap.xml`, `/robots.txt`, and share the URL somewhere to see the OG card.
6. **Custom domain (optional):** add it under Project → Domains. The HSTS header includes `preload`; only submit the domain to [hstspreload.org](https://hstspreload.org) once every subdomain serves HTTPS, because preloading is hard to undo.
