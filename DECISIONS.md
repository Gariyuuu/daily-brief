# DECISIONS.md

Architectural decisions recoverable from the repo. Each is labeled **Verified** (stated
explicitly in a code comment or doc) or **Inferred** (deduced from the code's shape,
not the developer's stated reasoning — never fabricated).

## D-001 — Use a `Section<T>` ok/unavailable union instead of throwing errors
**Verified.** `src/lib/types.ts` comment: "Each section is either the real data, or a
small 'not ready' object explaining why (missing API key vs. upstream failure) so the
UI can degrade gracefully instead of crashing when one source is unavailable." Applied
identically across all 8 sources and all 8 section components.

## D-002 — Every digest section works with zero API keys except where a paid/rate-
limited provider is unavoidable
**Verified.** `SETUP.md`: "The site works immediately with zero API keys for weather,
crypto, tech news, and the quote/on-this-day section (all keyless public APIs)." Weather
(Open-Meteo), crypto (CoinGecko), tech (Hacker News), and extra (ZenQuotes + Wikipedia)
were all deliberately chosen for being free and keyless; news (GNews), stocks (FMP),
music (Spotify), and chat (self-hosted OpenAI-compatible platform, `AI_PLATFORM_API_KEY`
— see D-016) require keys because no equivalent free-keyless option covers that data.

## D-003 — ESPN's unofficial scoreboard API chosen for sports over TheSportsDB
**Inferred.** `src/lib/sources/sports.ts` comment: "it's the exact same data espn.com
renders from, which is why using it here keeps this in sync with what you'd see visiting
ESPN directly, live status included" — this explains *why ESPN specifically*, but not
why `THESPORTSDB_KEY` remains documented in `.env.example`/`SETUP.md` while unused in
code. Most likely explanation (inferred, not confirmed): TheSportsDB was the original
plan or an earlier implementation, and the source was later swapped to ESPN without
updating the env var docs. Not confirmed from any commit message (`git log` shows no
commit specifically about this swap — only one combined commit, "Add digest sources,
archive view, and chat widget," added everything at once).

## D-004 — GNews.io chosen over NewsAPI
**Verified.** `src/lib/sources/news.ts` comment: "GNews.io free tier ... allows
production use, unlike NewsAPI's dev-only free plan, and returns article images —
which is why it was picked over the alternatives."

## D-005 — Financial Modeling Prep's `/stable` endpoints fetched per-symbol, not batched
**Verified.** `src/lib/sources/stocks.ts` comment: "FMP's legacy /api/v3 endpoints were
retired, and the current 'stable' API's free tier only accepts one symbol per quote
request (batched/comma-separated symbols return a premium error) — so each index is
fetched individually."

## D-006 — AI Watchlist capped at 12 symbols
**Verified.** `src/lib/sources/stocks.ts` comment explains the cap exists specifically
because a 25-name list "burns through" FMP's free-tier daily request budget "in a
handful of rebuilds, which is exactly what emptied out this section earlier today" — a
direct account of a real incident, not a speculative concern.

## D-007 — Spotify's `search?q=tag:new` used instead of the retired `browse/new-releases`
**Verified.** `src/lib/sources/music.ts` comment: "Spotify retired the
'browse/new-releases' endpoint for apps in Development Mode (Nov 2024) — `tag:new`
search returns albums released in roughly the last two weeks and stays available on the
free tier, but that mode caps `limit` at 10."

## D-008 — All dates/times computed against a configurable home timezone, not server UTC
**Verified.** `src/lib/utils/dates.ts` comments explain this twice: once for
"generated at" display formatting, once for "today" digest-date boundaries, both
citing the problem that Vercel's servers run UTC and a naive `toLocaleString()`/date
calculation would show/bucket data by the wrong calendar day for the actual reader.

## D-009 — Redis (Upstash) with an in-memory fallback, not a required dependency
**Verified.** `src/lib/store.ts` comment: "Without those env vars set, we fall back to
an in-memory store so the app still runs locally, but the archive won't persist between
restarts or across separate serverless invocations in production." This is the same
"works with zero config, degrades gracefully" philosophy as D-002, applied to
persistence rather than data sources.

## D-010 — 15-minute staleness window on the home page's digest read
**Verified.** `src/lib/aggregate.ts` comment: cron only runs once a day, so without a
staleness check "a digest built first thing in the morning ... would sit stale and
unchanged until the next day's cron run." `STALE_MS = 15 * 60 * 1000` was chosen as the
balance point; no explicit reasoning given for exactly 15 minutes vs. some other value
(inferred: short enough to feel "live" during a visit, long enough not to trigger a full
8-source rebuild on every page load).

## D-011 — No authentication anywhere in the app
**Inferred.** Never stated as an explicit decision anywhere, but consistent throughout:
no login, no session, no per-user data, and `SETUP.md` frames the whole app as
"a one-click personal briefing site." Reasonable inference: this is intentionally a
single-user personal tool, not a multi-tenant product, so auth was never in scope.

## D-012 — `CRON_SECRET` check is optional/skippable rather than mandatory
**Inferred** from the code (`src/app/api/cron/route.ts`: `if (secret) { ... }` — the
whole auth block is skipped when the env var is unset). No comment explains *why* it's
optional rather than required; most likely explanation (inferred): so the route still
works during initial local development before any secret is configured, consistent with
the "works without full config" philosophy (D-002/D-009) — but unlike those cases, this
one has a real security cost in production if never tightened. See SECURITY.md and
TASKS.md DB-003.

## D-013 — Digest sections fetched in parallel via `Promise.all`, not sequential
**Verified.** `src/lib/aggregate.ts` comment: "Fetches every source in parallel. Each
source already catches its own errors ... so one flaky API never breaks the rest of the
digest." (News's own internal 3 sub-requests are the one exception, sequential by
necessity per D-004's rate-limit constraint — that's a decision *within* one source, not
a contradiction of this one.)

## D-014 — Chat context is a compact text summary, not the raw digest JSON
**Verified.** `src/app/api/chat/route.ts` comment: "Trim the digest down to a compact
summary so it's cheap to include as chat context instead of dumping the full raw JSON
on every turn."

## D-015 — No test framework was set up
**Inferred.** No test files, no test dependency in `package.json`, no test script. No
comment anywhere explains this as a deliberate choice; most likely explanation
(inferred): this is an early-stage personal project where manual verification via
`npm run dev` was sufficient so far, not a considered rejection of testing.

## D-016 — Chat migrated from direct Anthropic API to a self-hosted OpenAI-compatible
platform
**Verified.** Commit `173c9ac` ("Switch chat feature from Anthropic to self-hosted
goat-ai-platform") and SESSION_LOG.md's Session 2 entry: `src/app/api/chat/route.ts`
was changed from `@anthropic-ai/sdk`'s `messages.create()` (model `"claude-opus-4-8"`)
to the `openai` SDK's `chat.completions.create()` against `https://api.gariyuuu.com/v1`
(model `"Yuu no Sekai"`), explicitly "to stop paying for direct Anthropic API access."
The env var was renamed `ANTHROPIC_API_KEY` → `AI_PLATFORM_API_KEY`. Verified live via a
real `npm run dev` + `curl POST /api/chat` request (HTTP 200, real reply). Every other
digest section/source, the Redis store, and the cron route were explicitly untouched by
this change (see CLAUDE.md's "DO NOT CHANGE WITHOUT REVIEW" list).

## D-017 — Third-party `thinking-orbs` package for the chat loading indicator, not a
hand-built spinner
**Inferred.** Commit `9b0e424` ("feat(chat): add animated thinking indicator to chat
widget") added the `thinking-orbs` `^0.3.1` dependency and used its `<ThinkingOrb>`
component in `src/components/ChatWidget.tsx`, rather than building a custom CSS/SVG spinner in-house
(this app has zero other icon/animation libraries — see UI_SYSTEM.md's "Icons"
section). No comment explains the choice; reasonable inference: a small, purpose-built
component was faster to drop in than hand-rolling animation for one loading state.

## D-018 — Standard Next.js `next/og` for Open Graph images, not a static asset
**Verified** (from the code shape, not a comment). `src/app/opengraph-image.tsx` and
`src/app/archive/[date]/opengraph-image.tsx` (both added commit `7240b1c`) use
`next/og`'s `ImageResponse` to generate OG images at request time from JSX, rather than
shipping a static PNG. This lets the per-date archive OG image exist without needing a
generated-image pipeline — one React component covers every date.

## Template lineage
`daily-brief` is the template original for the "briefing" app family — `anibrief`,
`market-brief`, and `dramabrief` (siblings under `~/Projects/`) structurally reuse this
repo's `Section<T>`/graceful-degradation pattern, per-source file layout, and
Redis-or-in-memory store design (see ARCHITECTURE.md's "Template lineage" section for
detail and caveats).
