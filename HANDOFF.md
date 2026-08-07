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

**DB-001** (the original 17-file documentation audit) and the **chat-feature migration**
(off Anthropic, commit `173c9ac`) are both complete and committed — `git log` shows
`173c9ac` as HEAD, working tree clean, up to date with `origin/main`. A 2026-08-07
"final transfer checkpoint" pass then re-verified all 17 docs against the live repo and
fixed several files that still described the pre-migration Anthropic-based chat
implementation as current (see CHANGELOG.md's 2026-08-07 entry for the full list).

There is no other in-progress task right now. The next task is whatever the maintainer
prioritizes from TASKS.md's "Next up" list — most likely **DB-002: rotate the
credentials still live in `.env.example`/`.env.local`** (GNews, FMP, Spotify, Upstash)
and replace that file's values with placeholders, or **DB-003: make `CRON_SECRET`
mandatory** if the user prioritizes that instead.

## What works right now?

Per this audit's verification: `npx tsc --noEmit`, `npm run lint`, and `npm run build`
all pass clean. Every one of the 8 digest sections is wired end-to-end in code with
graceful degradation (missing key / fetch failure → friendly UI message, never a
crash). The archive, refresh button, and chat widget are all fully wired in code. See
FEATURES.md for the per-feature status table — nothing is classified worse than
"Mostly complete," and several keyless sections are "Verified complete."

## What's broken?

Nothing found to be actually broken in the code (no failing build/lint/typecheck, no
obvious logic bugs). The real issues are **risks/gaps**, not bugs:
- `.env.example` on disk holds live-looking credential values instead of placeholders
  (never committed to git, but should be rotated — see SECURITY.md).
- `GET /api/cron` has no auth when `CRON_SECRET` is unset.
- `THESPORTSDB_KEY` is dead config (sports actually uses ESPN).
- No tests, no CI, no rate limiting exist anywhere.

Resolved since the original audit: the chat feature no longer uses Anthropic at all —
commit `173c9ac` migrated it to a self-hosted OpenAI-compatible platform
(`AI_PLATFORM_API_KEY`, model `"Yuu no Sekai"`), verified live with a real request. See
DECISIONS.md D-016 and SESSION_LOG.md Session 2.

## What should I do next?

If continuing straight documentation work: nothing — DB-001 is done. If picking up
feature/security work: start with DB-002 (credential rotation) since it's flagged
High priority and has zero technical blockers, just needs provider-dashboard access.
See TASKS.md for the full prioritized list and exact acceptance criteria for each.

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
