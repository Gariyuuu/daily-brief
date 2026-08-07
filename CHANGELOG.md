# CHANGELOG.md

No CHANGELOG.md existed before this audit. The entries below for the pre-audit period
are reconstructed directly from `git log` (not invented) — these are the repo's only
real history. Dates are the actual commit timestamps.

## [Unreleased] — 2026-08-06 — Documentation audit (handoff doc build)

This is a **documentation-only** change. No application code, config, or dependency was
modified. Nothing was committed as part of this entry being written — see
PROJECT_STATE.md for the exact git state at the time.

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
- The chat route's model ID (`claude-opus-4-8`) could not be verified against
  Anthropic's current model catalog in this audit.
- No test framework, no CI/CD workflow, no rate limiting anywhere in the app.

**Verification performed:** `npx tsc --noEmit` (clean), `npm run lint` (clean),
`npm run build` (succeeded, all 7 routes compiled). No dev server was started, no
database was touched, nothing was deployed, nothing was committed or pushed.

No product/application behavior was intentionally changed by this audit.

---

## Reconstructed history (from `git log`, prior to this audit)

### 2026-08-06 — `0cd8c68` — Add custom favicon matching the app's newspaper branding
Added `src/app/favicon.ico` and/or `src/app/icon.svg` branding assets (exact diff not
re-derived here beyond the commit message and the files' current presence in the repo).

### 2026-07-24 — `e46139d` — Add digest sources, archive view, and chat widget
The core feature commit: added all 8 `src/lib/sources/*.ts` fetchers, the aggregation/
store layer, the archive pages, and the Anthropic-backed chat widget — i.e., this single
commit brought the app from a bare `create-next-app` scaffold to its current
functional shape.

### 2026-07-21 — `717550f` — Initial commit from Create Next App
Repository created via `create-next-app`; unmodified boilerplate (`README.md`,
default Tailwind/ESLint/TypeScript config, default `public/` assets).
