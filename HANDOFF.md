# HANDOFF.md — Start Here

## What is this project?

**Daily Brief** — a single-user personal web dashboard (Next.js 16 App Router) that
aggregates weather, news, sports scores, stock movers, new music releases, crypto
prices, tech news, and a daily quote/"on this day" fact into one archived-by-date
digest, plus a Claude-powered chat widget to ask questions about any day's brief. Works
with zero configured API keys (4 of 8 sections are keyless); the rest show a
"connect your key" message until configured. Repo:
`/Users/gariyuu/Projects/daily-brief`. GitHub: `https://github.com/Gariyuuu/daily-brief`.

## What should I read first?

1. `CLAUDE.md` — full project reference (stack, commands, architecture, conventions,
   env vars, DO-NOT-CHANGE list, known issues, AI working instructions).
2. `PROJECT_STATE.md` — exact current git state and what's left to do.
3. `TASKS.md` — the task backlog, IDs `DB-001` through `DB-006`.
4. This file, to the end (including the prompt block below).

## What is the current task?

**`DB-002`** — rotate the still-live credential values sitting in `.env.example`
(GNews, FMP, Spotify, Upstash) and replace them with obvious placeholders. **Status:
not started, blocked** on the maintainer's provider-dashboard access — no agent can
finish this unilaterally, but it's the top of the queue. **DB-003** (make `CRON_SECRET`
mandatory) is next after that.

Everything before this is done and committed: `DB-001` (the original 17-file
documentation audit, `ab7a901`), the chat-feature migration off Anthropic (`173c9ac`),
a 2026-08-07 checkpoint pass, and — most recently — `DB-007`, a 2026-08-17 onboard sync
that caught up the docs on 3 commits that had landed without a doc update (SEO
metadata/Open Graph images/`src/app/robots.ts`/`src/app/sitemap.ts`, a new `NEXT_PUBLIC_SITE_URL` env
var, and an animated `thinking-orbs` chat loading indicator) and confirmed the
production deployment is live at `https://daily-brief-lovat.vercel.app`. `git log`
shows `37f84ef` as HEAD (10 commits total), working tree clean, up to date with
`origin/main`.

## What works right now?

Per this session's re-verification (2026-08-17): `npx tsc --noEmit`, `npm run lint`,
and `npm run build` all pass clean (12 routes, up from 7, after the SEO feature added
4 new static routes). Every one of the 8 digest sections is wired end-to-end in code
with graceful degradation (missing key / fetch failure → friendly UI message, never a
crash). The archive, refresh button, chat widget, and (new) SEO metadata/OG images/
sitemap/robots are all fully wired in code. **The production deployment is confirmed
live** — `https://daily-brief-lovat.vercel.app` was fetched read-only this session and
renders a real, fully populated digest. See FEATURES.md for the per-feature status
table — nothing is classified worse than "Mostly complete," and several keyless
sections are "Verified complete."

## What's broken?

Nothing found to be actually broken in the code (no failing build/lint/typecheck as of
2026-08-17, no obvious logic bugs). The real issues are **risks/gaps**, not bugs:
- `.env.example` on disk holds live-looking credential values instead of placeholders
  (never committed to git, but should be rotated — see SECURITY.md). Re-confirmed still
  the case on 2026-08-17.
- `GET /api/cron` has no auth when `CRON_SECRET` is unset — whether it's actually set
  in production is still unverified.
- `THESPORTSDB_KEY` is dead config (sports actually uses ESPN) — re-confirmed unused.
- `date-fns` is still an unused dependency — re-confirmed unused.
- No tests, no CI, no rate limiting exist anywhere.

Resolved since the original audit: the chat feature no longer uses Anthropic at all —
commit `173c9ac` migrated it to a self-hosted OpenAI-compatible platform
(`AI_PLATFORM_API_KEY`, model `"Yuu no Sekai"`), verified live with a real request. See
DECISIONS.md D-016 and SESSION_LOG.md Session 2.

## What should I do next?

If continuing straight documentation work: nothing — DB-001 and DB-007 are both done.
If picking up feature/security work: start with DB-002 (credential rotation) since
it's flagged High priority — it has no *technical* blocker, just needs the
maintainer's provider-dashboard access (not something an agent can do). If that access
isn't available, DB-003 (mandatory `CRON_SECRET`) or DB-008 (document
`NEXT_PUBLIC_SITE_URL` in `SETUP.md`) are unblocked alternatives. See TASKS.md for the
full prioritized list and exact acceptance criteria for each.

## Which files are most important?

- `src/lib/types.ts` — the `Section<T>` contract everything else depends on.
- `src/lib/aggregate.ts` — `buildDigest()`, the single aggregation entry point.
- `src/lib/store.ts` — Redis persistence + in-memory fallback; owns the two Redis key
  names used in production.
- `src/lib/sources/*.ts` — one file per external data source; each has hard-won
  workaround comments worth reading before touching.
- `src/app/api/cron/route.ts` — the security-sensitive scheduled-job endpoint.
- `vercel.json` — the cron schedule; must stay in sync with whatever's deployed.

## Which areas are dangerous to modify?

- `Section<T>`/`Ok<T>`/`Unavailable` shapes in `src/lib/types.ts` — ripples into every
  source file and every component.
- Redis key names in `src/lib/store.ts` — changing them orphans production archive data.
- `.env.example` — read variable **names** only, never reproduce its current values
  anywhere (they appear to be live secrets — see SECURITY.md).
- The `CRON_SECRET` check in `src/app/api/cron/route.ts` — don't weaken it further;
  tightening it is a deliberate decision, not a casual fix (see TASKS.md DB-003).
- `vercel.json`'s cron config — a change here needs a matching production redeploy.

## Which commands should I run first?

```bash
cd /Users/gariyuu/Projects/daily-brief
npm install
npx tsc --noEmit   # should be clean
npm run lint       # should be clean
npm run build      # should succeed, all 7 routes
```

## How do I verify the app still works?

No automated test suite exists (see TESTING.md). After any code change: re-run the
three commands above, then manually run `npm run dev` and walk through
TESTING.md's "Manual smoke-test checklist" (home page loads, all 8 sections degrade
gracefully without keys, Refresh Now works, chat widget responds if
`AI_PLATFORM_API_KEY` is set, `/archive` and `/archive/[date]` render correctly, and
`/api/cron`'s auth behavior matches what's documented in API_REFERENCE.md).

---

## Prompt for the next Claude Code account

```
Before making any change to this repo, read CLAUDE.md, PROJECT_STATE.md, TASKS.md,
HANDOFF.md (this file, in full), and the tail of SESSION_LOG.md. Then run `git status`,
`git log --oneline -10`, and `git fetch origin` (read-only) to check the actual current
branch, working-tree cleanliness, commit history, and sync state against what those
docs claim — flag any contradiction you find between the docs and reality, or between
the docs themselves, before doing anything else, and fix it rather than adding a third,
different answer. Docs in this repo have gone stale before (e.g. a chat-provider
migration landed in commit 173c9ac while several docs still described the old Anthropic
implementation until a 2026-08-07 checkpoint pass caught it) — don't assume any doc is
current just because it looks thorough.

Summarize your understanding of the current state of the project and the current task
back to the user before you start editing anything.

Continue the current task (see TASKS.md and PROJECT_STATE.md for exactly what it is and
what's already done) rather than redoing work that's already finished. Do not restart
already-completed work.

Preserve the existing architecture (the Section<T> graceful-degradation pattern, the
Redis-with-in-memory-fallback store, the zero-auth single-user design, the per-source
file layout in src/lib/sources/) unless you have a strong, explicitly-stated reason to
change it — and if you do change it, update DECISIONS.md with the new decision and why.

This repo is the template original for the "briefing" app family — anibrief,
market-brief, and dramabrief (siblings under ~/Projects/) reuse this structural
pattern. If you're actually working in one of those repos, treat this repo's docs as
background context only, not as that repo's source of truth — read that repo's own
17-file doc set first.

Never read real values out of .env.local or .env.example into chat output, commit
messages, or any file you write — reference variable names only. Treat any value you do
see there as already-compromised, not as safe to reuse or display. As of this writing,
.env.example still holds live-looking GNews/FMP/Spotify/Upstash values on disk
(never committed to git) — TASKS.md DB-002 (rotate + replace with placeholders) is
still open; don't fix it silently, it needs the maintainer's provider-dashboard access.

After completing any meaningful piece of work, update PROJECT_STATE.md, TASKS.md,
SESSION_LOG.md (append, don't overwrite prior entries), CHANGELOG.md, and DECISIONS.md
if you made an architectural choice — keep them from drifting out of sync with the
actual repo state, including the exact latest commit hash in PROJECT_STATE.md's "Git
state" section (verify with `git log`, don't copy a number from another doc).

Do not commit, push, deploy, or run destructive git operations unless the user
explicitly asks you to.
```
