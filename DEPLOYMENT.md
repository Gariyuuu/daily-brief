# DEPLOYMENT.md

## Hosting provider

**Vercel**, inferred from three pieces of evidence: `vercel.json` (defines a Cron job,
a Vercel-specific feature), `.vercel/project.json` (a local Vercel CLI project link —
project name `daily-brief`), and `SETUP.md`'s explicit deploy instructions
(`vercel login`, `vercel`, `vercel env add ...`, `vercel --prod`). No other hosting
config (Netlify, Cloudflare Pages, Docker, etc.) exists anywhere in the repo.

**Confirmed live (2026-08-17)** at `https://daily-brief-lovat.vercel.app` — this is the
hardcoded fallback baked into `NEXT_PUBLIC_SITE_URL`'s usage in the SEO files added
commit `7240b1c` (`src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`), and this session
fetched it read-only: it renders a real, fully populated digest (weather, markets,
news, sports, music, crypto, tech, quote), confirming `GNEWS_API_KEY`, `FMP_API_KEY`,
`SPOTIFY_CLIENT_ID/SECRET`, and the weather config are set in production. **Still
unverified**: whether `CRON_SECRET`, `AI_PLATFORM_API_KEY`, and the Upstash vars are
set in production (a passive page fetch doesn't exercise the chat widget, cron route,
or archive-persistence path) — checking those would require actually using the chat
widget or hitting `/api/cron`/`/archive`, not attempted this session to stay
non-destructive.

## Build / install commands

Standard Next.js defaults, no custom `vercel.json` `buildCommand`/`installCommand`
overrides (the file's only key is `crons`):
```bash
npm install
npm run build     # → "next build" (Turbopack, per package.json's script and the
                   #    build output header "▲ Next.js 16.2.11 (Turbopack)")
npm run start      # → "next start" — production server, used for local prod testing only
```

## Runtime version

No `.nvmrc`, no `engines` field in `package.json`, so Vercel will use its own default
Node.js runtime version for the Next.js version detected — not pinned by this repo.
The audit environment used Node v26.3.0 / npm 11.16.0, but this is **not** a
repo-enforced constraint.

## Env config

Every env var listed in CLAUDE.md's "Environment setup" table must be added to the
Vercel project (Project Settings → Environment Variables) for production behavior to
match local `.env.local` behavior. `SETUP.md` documents the `vercel env add VAR_NAME
production` flow for each one (e.g. `vercel env add GNEWS_API_KEY production`). **Do
not add real values to any file in this repo** —
they belong only in Vercel's env var store and local `.env.local` (both outside git).

Per `SETUP.md`, adding/changing env vars requires a redeploy (`vercel --prod`) to take
effect — Next.js reads `process.env.*` at request/build time, not live from Vercel's
dashboard.

## Domains

None found configured in-repo (no `vercel.json` `alias`/domain config). Whatever
domain(s) are attached to the Vercel project would be managed entirely through Vercel's
dashboard/CLI, not this repo.

## Scheduled-job / cron configuration

Defined entirely in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron", "schedule": "0 12 * * *" }
  ]
}
```
This registers a daily Vercel Cron trigger for `GET /api/cron` at 12:00 UTC. Vercel
automatically sends `Authorization: Bearer $CRON_SECRET` on cron-triggered requests once
`CRON_SECRET` is set as a project env var (per `SETUP.md` and confirmed by the auth
check in `src/app/api/cron/route.ts`). **This registration only takes effect on
deployment** — pushing a change to `vercel.json`'s cron config requires a production
deploy for Vercel to pick it up; whether the cron is currently registered against a
live deployment is unverified in this audit.

## Migration order

Not applicable — no SQL migrations exist (see DATABASE.md). The only "migration"
concern is the `Digest` TypeScript shape's backward compatibility with already-archived
Redis data, which has no tooling/ordering to follow (see DATABASE.md's "Migration
risks").

## Deployment limitations

- No CI/CD pipeline found (no `.github/workflows/*`) — deployment appears to be manual
  (`vercel --prod` per `SETUP.md`), not triggered automatically by pushes to `main`
  unless configured separately through Vercel's GitHub integration (not verifiable from
  this repo alone).
- No staging/preview-specific config found beyond Vercel's default preview-deployment
  behavior for non-production branches (Vercel's standard behavior, not something this
  repo customizes).
- The cron job only fires against whatever is the **production** deployment (Vercel
  Cron is a production-only feature) — preview deployments won't run it.

## Rollback process

None documented in-repo. Standard Vercel rollback (redeploying a previous build via the
Vercel dashboard/CLI) would apply, but nothing in this repo automates or documents that
process specifically for this project.

## Health checks

None implemented — no dedicated `/api/health` or similar endpoint exists. The closest
thing is that `GET /api/digest` and `GET /api/cron` both return a simple JSON success
response on success, which could be manually polled, but neither was built as a
health-check endpoint.

## Post-deploy verification

Not automated. Recommended manual steps after any deploy (derived from the app's
actual behavior, not an existing documented process):
1. Visit the production URL's `/` and confirm the page loads and at least the 4
   keyless sections show real data.
2. Visit `/archive` and confirm the persistence banner is **absent** (i.e. Upstash env
   vars are actually set in production) unless in-memory-only archive is intentional.
3. Manually trigger `GET /api/cron` once (with the correct `CRON_SECRET` header) or wait
   for the next scheduled run, then confirm `/archive` shows today's date.
4. Open the chat widget and send one message to confirm `AI_PLATFORM_API_KEY` is valid
   in production.
5. Confirm the Vercel dashboard shows the Cron job registered for `/api/cron` at the
   expected schedule (Project → Cron Jobs).

None of the above was performed in this audit (would require touching a live
deployment, outside this task's non-destructive scope).
