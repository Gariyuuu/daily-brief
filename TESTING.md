# TESTING.md

## Frameworks

**None.** No test framework is installed — `package.json` has no `test` script, and no
test dependency (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.) appears
in `dependencies` or `devDependencies`. `npm run lint` runs `eslint` only.

## Test structure

Not applicable — no test files exist anywhere in the repo. Confirmed via a project-wide
search for filenames/paths containing "test" or "spec" outside `node_modules`: none
found.

## Existing tests

None.

## Coverage gaps

Everything is currently unverified by automated means. In order of risk, the largest
gaps are:
1. `src/lib/sources/*.ts`'s error-handling paths (`missingKey()`/`fetchFailed()` on
   HTTP failure, timeout, or malformed response) — no test simulates an upstream API
   failure to confirm the UI degrades correctly.
2. `src/lib/aggregate.ts`'s `isStale()` boundary logic (exactly-15-minutes edge case).
3. `src/lib/store.ts`'s Redis-vs-in-memory branching (`hasUpstash`) — no test confirms
   both code paths produce identical behavior.
4. `src/app/api/chat/route.ts`'s `summarizeDigest()` — no test confirms it handles a
   digest where every section is `{ ok: false }` without throwing.
5. `src/lib/utils/dates.ts`'s timezone math (`todayISO`, `homeLocalDate`,
   `utcDateOffset`) — this is exactly the kind of code most prone to off-by-one-day
   bugs around midnight/DST boundaries, and has zero test coverage.

## Manual test steps (what to do in the absence of automated tests)

1. `npm install`
2. `npm run dev`, open `http://localhost:3000`.
3. Confirm the four keyless sections (Weather, Crypto, Tech, Extra/Quote) render real
   data with no `.env.local` configured at all.
4. Add each optional key to `.env.local` one at a time, restart `npm run dev`, and
   confirm the corresponding section (News, Markets, Music, and separately the chat
   widget for `ANTHROPIC_API_KEY`) switches from its "connect your key" message to real
   data.
5. Click "🔄 Refresh Now" and confirm the "generated at" timestamp updates and the
   button shows "Refreshing…" while in flight.
6. Open the chat widget (💬), ask a question about today's weather/news, and confirm a
   reply comes back (requires `ANTHROPIC_API_KEY`).
7. Visit `/archive` — with no Upstash configured, confirm the amber persistence warning
   appears; after configuring Upstash and restarting, confirm past days start
   accumulating and are clickable through to `/archive/YYYY-MM-DD`.
8. Test `GET /api/cron` locally (`curl http://localhost:3000/api/cron`) with and without
   `CRON_SECRET` set in `.env.local`, and with/without a matching `Authorization: Bearer`
   header, to confirm the auth branch behaves as documented in API_REFERENCE.md.

## Fixtures

None exist. If tests are added later, avoid committing any fixture derived from real
API responses that might embed a real key or personally-identifying data (unlikely
given all sources return public data, but the chat context/summarization path touches
whatever `ANTHROPIC_API_KEY`-backed responses look like — keep fixtures synthetic).

## Commands

```bash
npx tsc --noEmit   # typecheck — verified clean during this audit (exit 0)
npm run lint       # eslint . — verified clean during this audit (exit 0)
npm run build      # production build — verified clean during this audit, all 7 routes compiled
```

No `npm test` exists. Running `npm test` will fail (`npm error missing script: test`) —
this is expected, not a bug to fix silently; adding a real test command is tracked in
TASKS.md's "Testing needed" section, not assumed here.

## Known flaky tests

None — there are no tests to be flaky.

## Pre-release checklist

Given there's no CI and no automated tests, treat this as the minimum bar before any
deploy:
1. `npx tsc --noEmit` clean.
2. `npm run lint` clean.
3. `npm run build` succeeds with no route errors.
4. Manual smoke test (see checklist above) covering at least: home page loads, refresh
   button works, chat widget responds (if `ANTHROPIC_API_KEY` configured), archive list
   and one archived day render.
5. If any `src/lib/sources/*.ts` file was touched, manually verify both the success
   path (with the relevant key set) and the missing-key/fetch-failed fallback UI still
   render correctly.
6. If `src/lib/store.ts` or `src/lib/types.ts` was touched, double-check
   backward-compatibility with already-archived `Digest` shapes in production Redis
   (no automated migration exists — see DATABASE.md's "Migration risks").

## Manual smoke-test checklist for core user flows

- [ ] `/` loads and shows today's digest without error.
- [ ] Each of the 8 sections renders either real data or a graceful "connect your key"/
      "unavailable" message — never a crash or blank section.
- [ ] "🔄 Refresh Now" updates the timestamp and doesn't error.
- [ ] Chat widget opens, accepts input, and returns a reply (or a visible ⚠️ error, not
      a silent failure) — requires `ANTHROPIC_API_KEY`.
- [ ] `/archive` shows either the empty-state message or a list of dates, plus the
      persistence warning banner exactly when Upstash is unconfigured.
- [ ] `/archive/YYYY-MM-DD` for a real archived date renders that day's digest;
      `/archive/`(a nonexistent date) shows the Next.js 404 page.
- [ ] `GET /api/cron` behaves per its documented auth rule (see API_REFERENCE.md).
