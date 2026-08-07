# CHANGELOG.md

No CHANGELOG.md existed before the 2026-08-06 documentation audit. The entries below for
the pre-audit period are reconstructed directly from `git log` (not invented) — these are
the repo's only real history. Dates are the actual commit timestamps.

## [Unreleased] — 2026-08-07 — Documentation checkpoint pass (no app code changed)

A "final transfer checkpoint" doc audit: re-verified all 17 handoff docs against the live
repo/code, `git status`/`git log`/`git fetch origin` (clean, up to date with
`origin/main`, HEAD `173c9ac`), and re-ran `npx tsc --noEmit`/`npm run lint`/
`npm run build` (all clean). Found and fixed several docs that still described the
pre-`173c9ac` Anthropic-based chat implementation (`FEATURES.md`, `ARCHITECTURE.md`,
this file, `API_REFERENCE.md`, `SECURITY.md`, `DEPLOYMENT.md`, `FILE_MAP.md`,
`ROADMAP.md`, `TESTING.md`, `SETUP.md`, `DECISIONS.md`, `HANDOFF.md`) — all now match
`src/app/api/chat/route.ts`'s actual `openai`-SDK-against-self-hosted-platform
implementation. Also corrected `PROJECT_STATE.md`'s "Git state" section, which still
named `0cd8c68`/3-commits-total as latest despite two more commits (`ab7a901`, `173c9ac`)
having landed since. No secrets found in any tracked file; `.env.example`'s live-looking
GNews/FMP/Spotify/Upstash values remain an unresolved, previously-flagged finding (never
committed — see SECURITY.md, TASKS.md DB-002).

## [Unreleased] — 2026-08-06 (commit `173c9ac`) — Switch chat feature off Anthropic

Replaced the direct Anthropic API call (`@anthropic-ai/sdk`, model `"claude-opus-4-8"`)
in `src/app/api/chat/route.ts` with the `openai` SDK pointed at a self-hosted
OpenAI-compatible platform (`https://api.gariyuuu.com/v1`, model `"Yuu no Sekai"`), to
stop paying for direct Anthropic API access. `ANTHROPIC_API_KEY` renamed to
`AI_PLATFORM_API_KEY` in `.env.example`/`.env.local`/`CLAUDE.md`. Verified end-to-end via
a real `npm run dev` + `curl POST /api/chat` call (HTTP 200, real reply). Scope was
explicitly limited to the chat feature — no other section, the aggregation logic, Redis
store, or cron route were touched. See SESSION_LOG.md Session 2 and DECISIONS.md D-016.

## 2026-08-06 (commit `ab7a901`) — Documentation audit (handoff doc build)

This is a **documentation-only** change. No application code, config, or dependency was
modified. Committed as `ab7a901` ("docs: add full handoff documentation system").

**Files created:**
`PROJECT_STATE.md`, `ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`, `TASKS.md`,
`ROADMAP.md`, `DECISIONS.md`, `DATABASE.md`, `API_REFERENCE.md`, `UI_SYSTEM.md`,
`SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `CHANGELOG.md` (this file),
`SESSION_LOG.md`, `HANDOFF.md`.

**Files updated:**
`CLAUDE.md` (previously contained only an `@AGENTS.md` import and no project
documentation; rewritten with full project identity, stack, commands, architecture,
conventions, environment variable reference, and AI working instructions, all sourced
from reading the actual code).

**Problems discovered during the audit** (see SECURITY.md and CLAUDE.md's "Known
issues" for full detail — not fixed, only documented):
- `.env.example` on disk contains live-looking credential values instead of
  placeholders (GNews, FMP, Spotify, what appears to be a real Anthropic key, and
  Upstash Redis credentials). Confirmed never committed to git history
  (`.gitignore`'s `.env*` rule, verified via `git log --all --full-history` and
  `git ls-files`). Recommendation: rotate all of these and replace the file's values
  with placeholders.
- `GET /api/cron` has no authentication when `CRON_SECRET` is unset.
- `THESPORTSDB_KEY` is documented in `.env.example`/`SETUP.md` but unused — sports
  data actually comes from ESPN's keyless public API.
- `date-fns` is declared as a dependency but never imported anywhere in `src/`.
- No test framework, no CI/CD workflow, no rate limiting anywhere in the app.

**Verification performed:** `npx tsc --noEmit` (clean), `npm run lint` (clean),
`npm run build` (succeeded, all 7 routes compiled). No dev server was started, no
database was touched, nothing was deployed as part of writing these docs.

No product/application behavior was intentionally changed by the 2026-08-06 doc audit
itself (the chat migration above was a separate, later, explicitly-scoped task).

---

## Reconstructed history (from `git log`, prior to this audit)

### 2026-08-06 — `0cd8c68` — Add custom favicon matching the app's newspaper branding
Added `src/app/favicon.ico` and/or `src/app/icon.svg` branding assets (exact diff not
re-derived here beyond the commit message and the files' current presence in the repo).

### 2026-07-24 — `e46139d` — Add digest sources, archive view, and chat widget
The core feature commit: added all 8 `src/lib/sources/*.ts` fetchers, the aggregation/
store layer, the archive pages, and the chat widget (originally Anthropic-backed; later
migrated to a self-hosted platform in commit `173c9ac`, see above) — i.e., this single
commit brought the app from a bare `create-next-app` scaffold to its current
functional shape.

### 2026-07-21 — `717550f` — Initial commit from Create Next App
Repository created via `create-next-app`; unmodified boilerplate (`README.md`,
default Tailwind/ESLint/TypeScript config, default `public/` assets).
