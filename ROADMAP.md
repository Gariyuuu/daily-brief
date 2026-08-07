# ROADMAP.md

No time estimates are given anywhere below — none exist in the repo, and none are
invented here.

## Current milestone

**Working single-user daily briefing app with 8 live data sections, an archive, and a
chat assistant — functionally complete for a personal-use MVP.**
- Objective: every section works or gracefully degrades; digest is generated on a
  schedule and on demand; history is browsable.
- Priority: (achieved) — this is the current state of `main`, not a future target.
- Status: **Done**, per this audit's code-level verification (build/typecheck/lint
  clean, all 8 sources wired with graceful degradation, cron + refresh + archive + chat
  all present).
- Dependencies: none outstanding.
- Difficulty: N/A (already built).
- Risk: the open items in TASKS.md (unauthenticated cron when `CRON_SECRET` unset,
  credentials needing rotation) are risks to the *current* milestone's security
  posture, not blockers to calling it functionally done.
- Definition of done: matches what's currently on `main` — 8 sections rendering via the
  `Section<T>` pattern, `/archive`, cron-scheduled + manual refresh, chat widget.

## Next milestone

**Harden the security/operability gaps found in this audit.**
- Objective: make `CRON_SECRET` mandatory, rotate all currently-exposed credentials,
  add basic rate limiting to `/api/chat` and `/api/digest` (POST), add a top-level
  try/catch to `/api/digest` and `/api/cron` so unexpected failures return a controlled
  JSON error instead of a raw 500.
- Priority: High (security-adjacent).
- Status: Not started.
- Dependencies: none technical; needs the maintainer's decision on exactly how strict
  the cron auth should become (see TASKS.md DB-003).
- Difficulty: Low-Medium — each item is a small, isolated code change.
- Risk: Low — these are additive/defensive changes, not architectural rewrites.
- Definition of done: TASKS.md's DB-002/DB-003 items closed; `GET /api/cron` rejects
  requests when `CRON_SECRET` doesn't match; `.env.example` holds only placeholders.

## MVP completion

Already reached, per the "Current milestone" above — the app does what `SETUP.md`
describes it should do, end to end.

## Post-MVP

- Verify and, if needed, fix the chat model ID (`claude-opus-4-8`) against Anthropic's
  live model catalog (TASKS.md DB-006).
- Resolve the `THESPORTSDB_KEY` dead-config situation — either remove it or actually use
  it (TASKS.md DB-004).
- Remove the unused `date-fns` dependency, or find a real use for it (TASKS.md DB-005).

## Long-term ideas

All sourced from `SETUP.md`'s "Ideas for later" section (verbatim source, not invented
by this audit):
- Push notifications when the daily digest is ready.
- More sources: podcasts, TV/movie releases, air quality index, moon phase.
- Per-user saved cities/watchlists/teams instead of one fixed config.
- Streaming chat responses instead of a single request/response.

Each of these would be a genuine scope expansion (especially per-user config, which
requires introducing accounts/auth where currently none exists) — not sized or
prioritized here beyond what `SETUP.md` itself implies (listed as "later," no ordering
given).

## Optional improvements

- Add a formatter (Prettier) and/or pre-commit hooks — no CI or formatting enforcement
  currently exists.
- Add minimal automated tests around the error-handling paths in
  `src/lib/sources/*.ts` and `src/lib/aggregate.ts`'s `isStale()` logic.
- Replace `RefreshButton.tsx`'s blocking `alert()` on error with inline UI, to match
  `ChatWidget.tsx`'s inline error-bubble pattern.

## Out of scope

- Multi-user accounts/authentication as currently architected would be a major rewrite
  (every route, the store's key scheme, and the UI would need to change) — not
  something to attempt incidentally while doing smaller tasks.
- Payment/billing integration — none exists and none is implied anywhere in the repo;
  out of scope unless explicitly requested.
- Mobile app / native client — this is a web-only Next.js app; no mobile wrapper exists
  or is referenced.
