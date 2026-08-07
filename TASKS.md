# TASKS.md

Every task has an ID (`DB-###`), status, priority, relevant files, dependencies,
acceptance criteria, validation steps, blockers, and notes.

## Current task

### DB-001 — Documentation audit and handoff doc build
- **Status**: In progress (nearing completion at time of writing)
- **Priority**: High (explicitly requested)
- **Description**: Full repository audit of `daily-brief`, verify/rewrite `CLAUDE.md`,
  and create the 16 other standard handoff docs (PROJECT_STATE, ARCHITECTURE, FILE_MAP,
  FEATURES, TASKS, ROADMAP, DECISIONS, DATABASE, API_REFERENCE, UI_SYSTEM, SECURITY,
  TESTING, DEPLOYMENT, CHANGELOG, SESSION_LOG, HANDOFF), matching the structural/format
  standard of `chamber-seven` and `buildstrike-arena` (structure only — all content
  in daily-brief's docs is sourced from daily-brief itself).
- **Relevant files**: all 17 root `.md` files.
- **Dependencies**: none.
- **Acceptance criteria**:
  - All 17 files exist and are internally consistent with each other and with the code.
  - No secrets/real key values appear in any doc.
  - `PROJECT_STATE.md` reflects exact git state (branch, commit hash, clean/dirty tree).
  - `HANDOFF.md` ends with the "Prompt for the next Claude Code account" block.
  - No application behavior changed; nothing committed/pushed/deployed.
- **Validation steps**: re-read every new file for internal consistency; re-run
  `git status` to confirm the tree is still only touched by doc file changes; confirm
  `npx tsc --noEmit` / `npm run lint` / `npm run build` still pass (they were not
  supposed to be affected by doc-only changes, and weren't).
- **Blockers**: none.
- **Notes for whoever resumes if this is interrupted**: if any of the 17 files listed
  above is still missing, it wasn't finished — check the repo root's `.md` file listing
  first. All content must be derived from reading `daily-brief`'s own code; do not port
  content from `chamber-seven`/`buildstrike-arena`.

## Next up

- **DB-002 — Rotate credentials found live in `.env.example`/`.env.local`.**
  Priority: **High** (security). Files: `.env.example`, `.env.local` (neither tracked
  by git). Dependencies: none. Acceptance criteria: every key in `.env.example` is
  regenerated at its provider and the file holds only obvious placeholders (e.g.
  `your_gnews_api_key`), never real values. Validation: confirm the app still runs with
  `npm run dev` after updating `.env.local` with the new real values (kept out of
  `.env.example`). Blockers: requires access to each provider's dashboard (GNews, FMP,
  Spotify, Anthropic Console, Upstash Console) — outside this audit's scope. Notes:
  this audit found the values but did not read/reproduce them anywhere; see
  SECURITY.md.
- **DB-003 — Make `CRON_SECRET` mandatory (reject, don't skip, when unset).**
  Priority: Medium-High. Files: `src/app/api/cron/route.ts`. Dependencies: DB-002 should
  land first so a real `CRON_SECRET` exists in production before tightening the check.
  Acceptance criteria: `GET /api/cron` returns 401 whenever `CRON_SECRET` is unset or
  doesn't match, with no bypass path. Validation: `npx tsc --noEmit`, `npm run lint`,
  manual curl test locally with and without a matching header. Blockers: none technical;
  needs the maintainer's confirmation this is desired (it's a deliberate security
  posture change, flagged rather than made unilaterally in this audit — see CLAUDE.md's
  "DO NOT CHANGE WITHOUT REVIEW").
- **DB-004 — Remove or wire up `THESPORTSDB_KEY`.** Priority: Low. Files:
  `.env.example`, `SETUP.md`, possibly `src/lib/sources/sports.ts` if the intent is to
  actually use TheSportsDB instead of/alongside ESPN. Acceptance criteria: either the
  env var and its docs mentions are removed (if ESPN is the permanent choice) or the
  sports source is updated to actually use it. Validation: `npm run build` + manual
  smoke test of the Sports section. Blockers: needs a decision on which sports API to
  keep long-term.
- **DB-005 — Remove unused `date-fns` dependency (or start using it).** Priority: Low.
  Files: `package.json`. Acceptance criteria: either removed from `package.json` +
  `npm install` re-run, or a genuine usage is added. Validation: `npm run build`.
  Blockers: none.
- **DB-006 — Verify the Anthropic chat model ID (`claude-opus-4-8`).** Priority: Medium.
  Files: `src/app/api/chat/route.ts`. Acceptance criteria: confirmed against Anthropic's
  current model catalog to be a real, available model; chat tested end-to-end with a
  real `ANTHROPIC_API_KEY`. Validation: manual chat test via `npm run dev`. Blockers:
  requires a valid `ANTHROPIC_API_KEY` and willingness to make a real (billed) API call.

## Blocked

None currently blocked on external dependencies besides the provider-dashboard access
needed for DB-002 and the live-API-call needed for DB-006.

## High priority

- DB-002 (credential rotation)
- DB-003 (mandatory CRON_SECRET)

## Medium priority

- DB-006 (verify chat model ID)

## Low priority

- DB-004 (THESPORTSDB_KEY cleanup)
- DB-005 (date-fns cleanup)

## Bugs

None found that reproduce in code (build/typecheck/lint all clean). See "Known issues"
in CLAUDE.md and the security gaps above — these are risks/gaps, not confirmed
runtime bugs, since no live traffic was exercised in this audit.

## Technical debt

- No rate limiting anywhere (`/api/digest` POST, `/api/chat`, `/api/cron` when
  unauthenticated).
- No error boundary/try-catch at the top level of `/api/digest` and `/api/cron`'s
  route handlers around `buildDigest()`/`saveDigest()`.
- `ChatWidget.tsx`'s error handling uses a plain error bubble; `RefreshButton.tsx` uses
  a blocking browser `alert()` — inconsistent error UX patterns across the two client
  components.
- No formatter (Prettier) config — formatting consistency depends entirely on
  individual editor settings.

## Testing needed

- No test framework exists at all (see TESTING.md). Before any significant feature
  work, consider whether adding even minimal tests around `src/lib/sources/*.ts`'s
  error-handling paths (mock fetch failures) and `src/lib/aggregate.ts`'s `isStale()`
  logic would be worthwhile — currently 100% manually verified.
- Manual smoke test of `/api/chat` against a real `ANTHROPIC_API_KEY` (never performed
  in this audit).
- Manual smoke test of the full cron flow (`GET /api/cron` with/without a correct
  `CRON_SECRET` header) against a running dev server.

## Documentation needed

Covered by this audit (DB-001). Follow-up: once DB-002/DB-003/DB-004 are actually
executed, update CLAUDE.md's "Known issues," this file, and SECURITY.md to reflect the
resolved state instead of leaving them listed as open gaps.

## Recently completed

- DB-001 (this audit) — documentation build, in progress/nearing completion.

## Deferred

- Streaming chat responses (noted as a "for later" idea in `SETUP.md`, not started).
- Push notifications when the daily digest is ready (`SETUP.md` idea, not started).
- Per-user saved cities/watchlists/teams instead of one fixed config (`SETUP.md` idea,
  not started — would require adding actual user accounts/auth, a large change).
- Additional sources: podcasts, TV/movie releases, air quality index, moon phase
  (`SETUP.md` ideas, not started).

## Rejected ideas

None found recorded anywhere in the repo (no rejected-ideas log existed before this
audit).
