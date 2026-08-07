# PROJECT_STATE.md — Exact Handoff Snapshot

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

## Git state

- **Branch**: `main` (only branch; `git branch -a` shows no other local or remote
  branches besides `remotes/origin/main`)
- **Remote**: `origin` → `https://github.com/Gariyuuu/daily-brief.git`
- **Latest commit**: `173c9ac` — "Switch chat feature from Anthropic to self-hosted
  goat-ai-platform" (2026-08-06 22:27:17 -0700). Confirmed via `git log --oneline -5` and
  `git fetch origin` during this checkpoint session (2026-08-07): branch is up to date
  with `origin/main`, 0 ahead / 0 behind.
- **Full commit history** (5 commits total):
  1. `717550f` — "Initial commit from Create Next App" (2026-07-21 23:57:34 -0700)
  2. `e46139d` — "Add digest sources, archive view, and chat widget" (2026-07-24
     13:04:18 -0700)
  3. `0cd8c68` — "Add custom favicon matching the app's newspaper branding" (2026-08-06
     03:33:50 -0700)
  4. `ab7a901` — "docs: add full handoff documentation system" (2026-08-06 20:20:07
     -0700) — the original 17-file doc build this audit describes below.
  5. `173c9ac` — "Switch chat feature from Anthropic to self-hosted goat-ai-platform"
     (2026-08-06 22:27:17 -0700, HEAD) — Session 2's chat migration, committed.
- **Working tree**: clean (`git status` → "nothing to commit, working tree clean") as of
  this 2026-08-07 checkpoint pass, before this pass's own doc edits.
- **Untracked files**: none. `.env.local` and `.env.example` exist on disk but are
  correctly excluded by `.gitignore`'s `.env*` rule and have never been committed
  (`git log --all --full-history -- .env.local` returns nothing).

## Active objective

Bring `daily-brief` up to the same documentation standard as `chamber-seven` and
`buildstrike-arena` — a full repo audit plus 17 handoff markdown files. This is a
**documentation-only** task; no application behavior was changed.

## Last completed task

None prior to this audit — the repo had only `CLAUDE.md` (a single `@AGENTS.md` import
line), `AGENTS.md`, `README.md` (create-next-app boilerplate), and `SETUP.md` (an
accurate human-facing setup guide). No PROJECT_STATE.md, TASKS.md, or any of the other
14 files existed before this session.

## Current task (this session)

**Documentation audit and 17-file handoff doc build**, per the instructions given at
session start. Status: in progress / nearing completion at the time this file was
written.

Related files: all 17 root-level `.md` files (`CLAUDE.md`, `PROJECT_STATE.md`,
`ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`, `TASKS.md`, `ROADMAP.md`,
`DECISIONS.md`, `DATABASE.md`, `API_REFERENCE.md`, `UI_SYSTEM.md`, `SECURITY.md`,
`TESTING.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, `SESSION_LOG.md`, `HANDOFF.md`).

What has been attempted / completed so far:
- Read every source file in `src/` (14 TS/TSX files under `lib/`, 9 under `components/`,
  6 route/page files under `app/`), `package.json`, `.env.example` (names + noted the
  values are live-looking, not read into any doc), `.gitignore`, `vercel.json`,
  `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`,
  `README.md`, `SETUP.md`, `AGENTS.md`, `.vercel/project.json`, full `git log` and
  `git status`.
- Ran `npx tsc --noEmit` (exit 0, clean), `npm run lint` (exit 0, clean), `npm run build`
  (succeeded — Turbopack, all 7 routes compiled/collected without error).
- Rewrote `CLAUDE.md` (previously just the `@AGENTS.md` import) with full project
  documentation.
- Created this file (`PROJECT_STATE.md`).

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
- Whether the Vercel deployment is currently live, and whether production env vars
  (especially `CRON_SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN`, `AI_PLATFORM_API_KEY`) are
  actually set there, is **unverified** — would require Vercel dashboard/CLI access
  outside this task's scope. Note: production still has the old `ANTHROPIC_API_KEY` var
  name set (if it was ever configured there) — it must be renamed to
  `AI_PLATFORM_API_KEY` in Vercel's project settings for chat to work in production.
- Whether the daily Vercel Cron job (`vercel.json`, `0 12 * * *`) is actually registered
  and firing in production is **unverified**.

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
   FMP, Spotify, Anthropic, Upstash) since they were read by this audit process and
   should be treated as exposed, then replace `.env.example`'s values with obvious
   placeholders (e.g. `your_gnews_api_key`) so future audits/agents never see real
   values there. This is a security follow-up, not part of this documentation task.
2. **Decide whether `CRON_SECRET` should be made mandatory** (reject unauthenticated
   `GET /api/cron` requests entirely rather than skipping the check when unset) — a
   deliberate security decision for the maintainer, not something to change silently.
3. **Verify the Vercel deployment state** — confirm whether `daily-brief` is actually
   live, whether the cron job is registered, and whether production env vars are set,
   then update DEPLOYMENT.md and this file with the confirmed live URL (or lack thereof).

## Verification required before continuing any new feature work

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` after any code change (all
three were clean at the start of this audit and should stay clean). Since there is no
automated test suite, also manually exercise the affected route(s) via `npm run dev`
before considering a change complete — see TESTING.md for the smoke-test checklist.
