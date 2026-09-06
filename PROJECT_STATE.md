# PROJECT_STATE.md — Exact Handoff Snapshot

> **Update 2026-09-05 — W9 UI/UX overhaul pass (uncommitted).**
> This repo was polished as part of group **W9** of `~/Projects/OVERHAUL-GROUPS.md`
> (numbers-first surfaces). Working tree is now **dirty and uncommitted**: 25
> file(s) changed. Nothing was committed, pushed or deployed.
> No product architecture, backend logic, schema, auth or route changes.
> Full detail: this repo's `SESSION_LOG.md` (newest entry) and `UI_SYSTEM.md`.
> Verification run this pass: `npx tsc --noEmit` 0 errors; `npm run lint` clean. `build` not run.
> The group's shared tokens are a **new portfolio design-system layer**,
> `~/Projects/.design-system/families/numerics.css` (v1.0). `MASTER.css` is unchanged.

## Audit timestamp

2026-08-06, documentation audit session (account/agent identity: unknown — first
session to produce this doc set). All facts below were verified against the repo at
this timestamp; no code was changed.

**Update (2026-08-06, Session 2)**: the chat feature (`src/app/api/chat/route.ts`) was
migrated off `@anthropic-ai/sdk` to the `openai` SDK against a self-hosted
OpenAI-compatible platform (`https://api.gariyuuu.com/v1`, model `"Yuu no Sekai"`), so
the user stops paying for direct Anthropic API access. `ANTHROPIC_API_KEY` is now
`AI_PLATFORM_API_KEY`. `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass
clean, and the endpoint was functionally verified via a real `npm run dev` + `curl`
request (HTTP 200, real reply). See SESSION_LOG.md Session 2 for full detail. The rest
of this file (below) describes the state as of the original documentation audit and is
otherwise still accurate — only the chat/LLM facts changed.

**Update (2026-08-07, checkpoint session)**: a "final transfer checkpoint" pass
re-verified all 17 docs against the live repo. Both prior sessions' doc changes
(`ab7a901`) and code changes (`173c9ac`) are now committed and pushed to `origin/main` —
the "Git state" section below was stale (it still named `0cd8c68`/3 commits as latest)
and has been corrected. Several sibling docs (FEATURES.md, ARCHITECTURE.md, CHANGELOG.md,
API_REFERENCE.md, SECURITY.md, DEPLOYMENT.md, FILE_MAP.md, ROADMAP.md, TESTING.md,
SETUP.md, DECISIONS.md, HANDOFF.md) still described the pre-migration Anthropic/
`ANTHROPIC_API_KEY`/`claude-opus-4-8` chat implementation as current — all corrected in
this pass to match the actual `openai`-SDK-against-self-hosted-platform implementation
in `src/app/api/chat/route.ts`. No application code was changed in this pass.
`npx tsc --noEmit`, `npm run lint`, and `npm run build` re-verified clean. `.env.example`
still holds live-looking GNews/FMP/Spotify/Upstash values on disk (never committed) —
same finding as before, still unresolved (TASKS.md DB-002).

**Update (2026-08-17, onboard sync)**: three real code commits landed after the
2026-08-07 checkpoint without a doc update: `7240b1c`/`e47a545` (SEO metadata, Open
Graph images via `next/og`, `src/app/robots.ts`, `src/app/sitemap.ts`, new `NEXT_PUBLIC_SITE_URL` env
var) and `9b0e424`/`37f84ef` (animated `thinking-orbs` package added to `ChatWidget`'s
loading state). `main` is now at `37f84ef` (10 commits total), tree clean, up to date
with `origin/main`. This pass: re-read every changed file, corrected the now-false "no
`NEXT_PUBLIC_*` variables" claim across `CLAUDE.md`/`ARCHITECTURE.md`/`SECURITY.md`,
added the 4 new files to `FILE_MAP.md`/`ARCHITECTURE.md`, added a new FEATURES.md entry
(#13, SEO metadata), updated `UI_SYSTEM.md`'s animation/loading-state claims, and — new
this pass — **fetched the production URL read-only and confirmed it's live**:
`https://daily-brief-lovat.vercel.app` renders a real, fully populated digest, resolving
the long-standing "is this deployed?" unknown (though `CRON_SECRET`/`AI_PLATFORM_API_KEY`/
Upstash production config remains unverified — a passive fetch doesn't exercise those
paths). Re-ran `npx tsc --noEmit` (clean), `npm run lint` (clean, note: script text
changed from `eslint .` to `eslint`, same effective behavior), and `npm run build`
(clean, 12 routes now including the 4 new SEO routes). No application code was changed
in this pass. `.env.example` still holds live-looking GNews/FMP/Spotify/Upstash values
— unresolved, still TASKS.md DB-002 (now promoted to "Current task").

## Git state

- **Branch**: `main` (only branch; `git branch -a` shows no other local or remote
  branches besides `remotes/origin/main`)
- **Remote**: `origin` → `https://github.com/Gariyuuu/daily-brief.git`
- **Latest commit**: `37f84ef` — "Merge branch 'chore/polish' into main" (2026-08-16).
  Confirmed via `git log --oneline -10` on 2026-08-17: branch is up to date with
  `origin/main`.
- **Full commit history** (10 commits total, `git rev-list --count HEAD` confirmed,
  newest first):
  1. `37f84ef` — "Merge branch 'chore/polish' into main" (2026-08-16, HEAD)
  2. `9b0e424` — "feat(chat): add animated thinking indicator to chat widget" (2026-08-15)
  3. `e47a545` — "Merge chore/metadata-og: site + per-date metadata, OG images, sitemap, robots" (2026-08-14)
  4. `7240b1c` — "chore: add OG images, robots.txt, sitemap, and richer metadata" (2026-08-13)
  5. `e83d500` — "docs: checkpoint pass — fix stale Anthropic->self-hosted chat refs, git state" (2026-08-07)
  6. `173c9ac` — "Switch chat feature from Anthropic to self-hosted goat-ai-platform" (2026-08-06)
  7. `ab7a901` — "docs: add full handoff documentation system" (2026-08-06) — the original 17-file doc build.
  8. `0cd8c68` — "Add custom favicon matching the app's newspaper branding" (2026-08-06)
  9. `e46139d` — "Add digest sources, archive view, and chat widget" (2026-07-24)
  10. `717550f` — "Initial commit from Create Next App" (2026-07-21)
- **Working tree**: clean (`git status` → "nothing to commit, working tree clean") as of
  this 2026-08-17 onboard-sync pass, before this pass's own doc edits.
- **Untracked files**: none. `.env.local` and `.env.example` exist on disk but are
  correctly excluded by `.gitignore`'s `.env*` rule and have never been committed
  (`git log --all --full-history -- .env.local` returns nothing).

## Active objective

Originally: bring `daily-brief` up to the same documentation standard as
`chamber-seven` and `buildstrike-arena` — a full repo audit plus 17 handoff markdown
files (`DB-001`, done). As of 2026-08-17: keep those docs synced against real code
drift (`DB-007`, this pass, done) — no ongoing objective beyond normal maintenance.

## Last completed task

`DB-007` (2026-08-17) — onboard sync reconciling 3 undocumented commits (SEO
metadata/OG/sitemap/robots, `NEXT_PUBLIC_SITE_URL`, `thinking-orbs` chat indicator)
across all affected docs; confirmed the production deployment is live. Before that,
`DB-001` (2026-08-06/07) — the original 17-file doc build, later re-verified in a
2026-08-07 checkpoint pass.

## Current task (as of 2026-08-17 onboard sync)

`DB-002` — rotate the still-live credential values in `.env.example` (GNews, FMP,
Spotify, Upstash) and replace them with obvious placeholders. **Status: not started,
blocked** on the maintainer's provider-dashboard access — no agent can complete this
unilaterally. See TASKS.md for full acceptance criteria; DB-003 (mandatory
`CRON_SECRET`) is the next item queued after this one.

The original `DB-001` (17-file doc build, 2026-08-06/07) and this pass's `DB-007`
(2026-08-17 onboard sync, reconciling 3 undocumented commits) are both **done** — see
"Recently completed" in TASKS.md.

What this pass (2026-08-17) did:
- Re-read every file changed since the 2026-08-07 checkpoint (`git diff --stat
  e83d500..37f84ef`): `package.json`, `src/app/layout.tsx`, `src/app/opengraph-image.tsx`,
  `src/app/archive/[date]/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`,
  `src/components/ChatWidget.tsx`.
- Confirmed `THESPORTSDB_KEY` and `date-fns` are still unused (`grep -rn` returned
  nothing in `src/`) — DB-004/DB-005 still valid, unchanged.
- Re-ran `npx tsc --noEmit` (clean), `npm run lint` (clean), `npm run build` (clean, 12
  routes).
- Fetched `https://daily-brief-lovat.vercel.app` read-only — confirmed live.
- Corrected `CLAUDE.md`, `ARCHITECTURE.md`, `SECURITY.md` (`NEXT_PUBLIC_SITE_URL`),
  `FILE_MAP.md`, `FEATURES.md` (#13 added), `UI_SYSTEM.md`, `DEPLOYMENT.md`, `TASKS.md`,
  this file, `HANDOFF.md`, `CHANGELOG.md`, `SESSION_LOG.md`, `.env.example`.

## What works (verified this audit)

- `npx tsc --noEmit` — passes, no type errors.
- `npm run lint` — passes, no lint errors/warnings.
- `npm run build` — succeeds; all 7 app routes (`/`, `/_not-found`, `/api/chat`,
  `/api/cron`, `/api/digest`, `/archive`, `/archive/[date]`) and `/icon.svg` compile and
  are collected without error.
- Every one of the 8 digest sources has a `Section<T>`-shaped fetcher in
  `src/lib/sources/` with error handling that degrades to an "unavailable" UI state
  instead of crashing (verified by reading the code — see FEATURES.md for the
  per-feature classification).

## What fails / is unverified

- **No end-to-end runtime verification was performed in the original audit** — it did
  not start the dev server, did not hit any live external API, and did not exercise
  `/api/chat`, `/api/digest`, or `/api/cron` against real data. **This is now resolved
  for `/api/chat` specifically**: Session 2 (2026-08-06) migrated chat off Anthropic to
  a self-hosted OpenAI-compatible platform (model `"Yuu no Sekai"`) and verified it
  end-to-end with a real `npm run dev` + `curl` call (HTTP 200, real reply) — see
  SESSION_LOG.md. `/api/digest` and `/api/cron` remain unverified against real data.
- **Resolved (2026-08-17)**: the Vercel deployment is confirmed live at
  `https://daily-brief-lovat.vercel.app` (read-only fetch, real digest data rendered —
  GNews/FMP/Spotify/weather config confirmed set in production). Still **unverified**:
  whether `CRON_SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN`, and `AI_PLATFORM_API_KEY` are
  set there — a passive page fetch doesn't exercise the chat widget, cron route, or
  archive-persistence path. The old `ANTHROPIC_API_KEY` var name note below is now
  historical (chat migrated off Anthropic in commit `173c9ac`, well before this fetch).
- Whether the daily Vercel Cron job (`vercel.json`, `0 12 * * *`) is actually registered
  and firing in production is still **unverified**.

## Current errors

None found in the codebase itself (build/typecheck/lint all clean). The issues below
are risks/gaps, not active errors:
- `GET /api/cron` has no authentication when `CRON_SECRET` is unset (see SECURITY.md).
- `.env.example` on disk holds live-looking values instead of placeholders (see
  SECURITY.md and CLAUDE.md's "Known issues" — not committed to git, but should be
  rotated/replaced).
- `THESPORTSDB_KEY` is dead config (documented, never read by any source file).

## Blockers

None for the documentation task itself. For any future feature work: no test framework
exists, so changes to `src/lib/sources/*.ts` or the API routes cannot be regression-
tested automatically — manual verification via `npm run dev` + hitting each route would
be required (see TESTING.md's manual smoke-test checklist).

## Assumptions currently in effect

- Assuming this is genuinely a single-user personal project (per SETUP.md's framing) and
  that the complete absence of auth is intentional, not an oversight.
- Assuming the real values in `.env.example`/`.env.local` are the developer's own
  personal free-tier/pay-as-you-go keys, not shared/production secrets belonging to a
  team — still recommending rotation as a precaution since this audit surfaced them.
- Assuming `date-fns` (declared in `package.json`, unused in `src/`) was either
  scaffolded speculatively or its usage was later removed without removing the
  dependency — not assuming it's a sign of a broken feature.

## Next three recommended actions

1. **Rotate the credentials currently sitting in `.env.example`/`.env.local`** (GNews,
   FMP, Spotify, Upstash — re-confirmed still real-looking on 2026-08-17) then replace
   `.env.example`'s values with obvious placeholders (e.g. `your_gnews_api_key`) so
   future audits/agents never see real values there. `DB-002`, blocked on the
   maintainer's provider-dashboard access.
2. **Decide whether `CRON_SECRET` should be made mandatory** (reject unauthenticated
   `GET /api/cron` requests entirely rather than skipping the check when unset) — a
   deliberate security decision for the maintainer, not something to change silently.
   `DB-003`.
3. **Confirm `CRON_SECRET`/`AI_PLATFORM_API_KEY`/Upstash are set in production** — the
   2026-08-17 live fetch confirmed the deployment exists and GNews/FMP/Spotify/weather
   are configured, but didn't exercise the chat widget, cron route, or archive
   persistence, so those three remain unverified.

## Verification required before continuing any new feature work

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` after any code change (all
three were clean at the start of this audit and should stay clean). Since there is no
automated test suite, also manually exercise the affected route(s) via `npm run dev`
before considering a change complete — see TESTING.md for the smoke-test checklist.
