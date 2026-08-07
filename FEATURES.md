# FEATURES.md

Status classifications used below: Verified complete / Mostly complete / Partially
implemented / UI only / Backend only / Mocked / Planned / Broken / Deprecated / Unable
to verify. Every feature was checked end-to-end (UI → client logic → server logic →
external API / store) by reading the actual code; runtime behavior against live
external APIs was **not** exercised (no dev server was started, per audit constraints).

## 1. Weather section

- **Purpose**: shows current conditions + 5-day forecast for one configured home city.
- **User flow**: loads automatically as part of the digest on `/` and `/archive/[date]`.
- **Status**: **Mostly complete.** Full flow verified in code (fetch → `Section<T>` →
  `<WeatherCard>` → `<Unavailable>` fallback); never actually invoked against the live
  Open-Meteo API in this audit.
- **Frontend**: `src/components/WeatherCard.tsx`. **Backend**: `src/lib/sources/weather.ts`.
- **DB dependency**: none directly (result gets cached in the digest, which is stored).
- **External integration**: Open-Meteo (`api.open-meteo.com`), keyless.
- **Env vars**: `BRIEF_CITY`, `BRIEF_LAT`, `BRIEF_LON` (all optional, default to New York).
- **Permissions**: none (public).
- **Validation**: none needed (no user input into this path besides env-configured city).
- **Error/loading/empty states**: `fetchFailed()` on non-2xx or thrown error → renders
  `<Unavailable>`. No distinct loading state (server-rendered). No "empty" state
  possible (Open-Meteo always returns data for a valid lat/lon).
- **Edge cases handled**: unknown WMO weather code falls back to "Unknown"/🌡️.
- **Tests**: none.
- **Known issues**: none beyond "never actually invoked live in this audit."

## 2. News & Politics

- **Purpose**: Top US, World, and Politics headlines.
- **Status**: **Mostly complete** (same caveat — code-verified, not live-verified).
- **Frontend**: `src/components/NewsList.tsx`. **Backend**: `src/lib/sources/news.ts`.
- **External integration**: GNews.io v4, 3 sequential category calls with 1100ms sleeps
  between them (documented free-tier rate-limit workaround).
- **Env vars**: `GNEWS_API_KEY` (optional — missing key renders `missingKey()` fallback
  with a signup link baked into the message).
- **Permissions/validation**: none.
- **Error/empty states**: `missingKey()` when unset; `fetchFailed()` on HTTP error or
  thrown exception; `ArticleGroup` silently renders nothing for an empty category array
  (no explicit "no articles" message per sub-section).
- **Edge cases**: article images can be `null` — component renders a placeholder gray
  box instead.
- **Known issues**: none functional; note the sequential-with-sleep design means this
  section alone adds ~2.2s to `buildDigest()`'s critical path whenever it runs (it does
  not block the other 7 sources since `Promise.all` runs them concurrently, but it is
  the slowest single source).

## 3. Sports scores

- **Purpose**: today's games (in progress, upcoming, and finished) across 8 leagues.
- **Status**: **Mostly complete**, with one notable **documentation/code mismatch**:
  `.env.example` and `SETUP.md` describe this section as backed by TheSportsDB
  (`THESPORTSDB_KEY`), but the actual implementation
  (`src/lib/sources/sports.ts`) uses **ESPN's unofficial public scoreboard API** and
  never references `THESPORTSDB_KEY` anywhere. The section works entirely keyless.
- **Frontend**: `src/components/SportsScores.tsx`. **Backend**: `src/lib/sources/sports.ts`.
- **External integration**: `site.api.espn.com` (unofficial, no key), 8 leagues fetched
  in parallel via `Promise.allSettled` (one league failing doesn't drop the others).
- **Env vars used**: none (despite `THESPORTSDB_KEY` being documented elsewhere — see
  "Known issues" in CLAUDE.md).
- **Error/empty states**: `fetchFailed()` on unexpected throw; "No games found for
  today" message when the filtered list is empty (distinct from the missing-key/failed
  states — this is a genuine empty state, not an error).
- **Edge cases handled**: home-timezone date filtering (`homeLocalDate()`) so evening US
  games that fall on "tomorrow" in UTC aren't dropped or double-counted; per-league
  inconsistency in which status field (`shortDetail` vs `detail`) holds the useful
  value; live games sorted to the top.
- **Known issues**: env var / docs mismatch noted above (cosmetic — feature itself works).

## 4. Markets (stocks)

- **Purpose**: 3 major indices, top gainers/losers/most-actives, and a curated 12-stock
  "AI Watchlist."
- **Status**: **Mostly complete.**
- **Frontend**: `src/components/StockMovers.tsx`. **Backend**: `src/lib/sources/stocks.ts`.
- **External integration**: Financial Modeling Prep `/stable` endpoints.
- **Env vars**: `FMP_API_KEY` (optional — `missingKey()` fallback otherwise).
- **Error/empty states**: `missingKey()`; `fetchFailed()` if all 3 indices come back
  empty (`throw new Error("FMP quote returned no index data")` — a genuine hard failure
  path, unlike gainers/losers/actives which degrade to empty arrays on individual
  request failure rather than failing the whole section).
- **Edge cases handled**: FMP's free tier gates batched/multi-symbol quotes behind a
  premium wall, so each index and each AI-watchlist symbol is fetched individually;
  AI watchlist deliberately capped at 12 names to avoid burning the free-tier daily
  request quota (comment in code references this having emptied the section out once
  already — worth treating as a real constraint, not an arbitrary number).
- **Known issues**: none beyond quota fragility (12-name cap is a deliberate mitigation,
  not a bug).

## 5. New Music

- **Purpose**: recent album releases (roughly last 2 weeks).
- **Status**: **Mostly complete.**
- **Frontend**: `src/components/MusicReleases.tsx`. **Backend**: `src/lib/sources/music.ts`.
- **External integration**: Spotify Web API, Client Credentials OAuth flow (app-only,
  no user login).
- **Env vars**: `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` (both required together;
  `missingKey()` fallback if either is absent).
- **Error/empty states**: `missingKey()`; `fetchFailed()` on auth or search failure.
- **Edge cases handled**: Spotify retired the dedicated `browse/new-releases` endpoint
  for dev-mode apps (Nov 2024) — this uses `search?q=tag:new` instead, which is also
  capped at `limit=10` in dev mode (the documented max of 50 errors out) — both
  constraints are explained in code comments.
- **Known issues**: results are capped at 10 releases by the Spotify dev-mode
  limitation, not a choice made by this codebase.

## 6. Crypto

- **Purpose**: 20-coin curated watchlist with 24h change + top 5 trending coins.
- **Status**: **Verified complete** (fully keyless, no missing-key path to worry about;
  code-verified end-to-end).
- **Frontend**: `src/components/CryptoTicker.tsx`. **Backend**: `src/lib/sources/crypto.ts`.
- **External integration**: CoinGecko public API, keyless.
- **Env vars**: none.
- **Error/empty states**: `fetchFailed()` if the markets call fails; trending list
  degrades to empty silently if only the trending call fails (markets data still shown).
- **Known issues**: none found.

## 7. Tech / Hacker News

- **Purpose**: top 20 current Hacker News stories, in two columns of 10.
- **Status**: **Verified complete** (keyless, code-verified end-to-end).
- **Frontend**: `src/components/TechNews.tsx`. **Backend**: `src/lib/sources/tech.ts`.
- **External integration**: Hacker News Firebase REST API, keyless (1 call for top
  story IDs + 20 parallel item calls).
- **Known issues**: none found.

## 8. Quote & On This Day ("Extra")

- **Purpose**: a daily quote (ZenQuotes) + up to 5 "on this day" historical events
  (Wikipedia).
- **Status**: **Verified complete** (keyless, two independent non-fatal try/catches,
  code-verified end-to-end).
- **Frontend**: `src/components/ExtraCard.tsx`. **Backend**: `src/lib/sources/extra.ts`.
- **External integrations**: ZenQuotes (`zenquotes.io`) + Wikipedia REST "on this day"
  feed, both keyless.
- **Error/empty states**: `fetchFailed("Both quote and on-this-day sources failed.")`
  only if **both** sub-sources fail; either one succeeding is enough to show something.
- **Known issues**: none found.

## 9. Archive

- **Purpose**: browse every previously-generated digest by date.
- **Status**: **Mostly complete** — fully wired, but persistence depends on optional
  config (see below).
- **Frontend**: `src/app/archive/page.tsx` (list), `src/app/archive/[date]/page.tsx`
  (detail). **Backend**: `src/lib/store.ts`'s `listDates()`/`getDigest()`.
- **DB dependency**: Upstash Redis if configured; otherwise an in-memory `Map`/`Set`
  that does **not** persist across restarts or serverless cold starts — the archive
  page explicitly warns about this (`archiveIsPersistent` flag, amber banner) rather
  than silently failing.
- **Env vars**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (optional together).
- **Error/empty states**: "No past days yet…" message when `listDates()` is empty;
  `notFound()` (Next.js 404 page) when a specific date has no stored digest.
- **Permissions**: none (public, no per-user scoping — there is only one archive, shared
  by whoever visits the site).
- **Known issues**: none functional; persistence is opt-in by design, not a bug.

## 10. Refresh Now

- **Purpose**: force-rebuild today's digest on demand instead of waiting for staleness.
- **Status**: **Verified complete.**
- **Frontend**: `src/components/RefreshButton.tsx` (client). **Backend**:
  `POST /api/digest` (`src/app/api/digest/route.ts`).
- **Error states**: `alert()` with the error message on non-2xx response or thrown
  error (a plain browser `alert`, not an in-page toast — functional but minimal UX).
- **Loading state**: button label switches to "Refreshing…" and disables itself while
  in flight.
- **Known issues**: uses a blocking `alert()` for errors rather than inline UI; no rate
  limiting, so a user (or bot) could spam this endlessly, each hit burning GNews/FMP/
  Spotify quota.

## 11. Scheduled daily digest build (cron)

- **Purpose**: ensures a digest exists before anyone visits, once a day.
- **Status**: **Mostly complete** — code is correct and complete for what it does, but
  its security posture is a real gap (see below), and whether it is actually registered
  in the production Vercel project was **unable to verify** in this audit.
- **Backend**: `GET /api/cron` (`src/app/api/cron/route.ts`), scheduled via
  `vercel.json`'s `crons[0]` at `0 12 * * *` UTC.
- **Auth**: optional `CRON_SECRET` bearer check — **skipped entirely if unset**, meaning
  the route is publicly callable with no auth in that state.
- **Known issues**: unauthenticated when `CRON_SECRET` unset (see SECURITY.md); no
  retry/alerting if the run fails; production registration state unverified.

## 12. Chat widget

- **Purpose**: ask an LLM questions about the current (or archived) day's digest, or
  general-knowledge questions.
- **Status**: **Verified complete** — fully wired end-to-end in code and functionally
  verified live (2026-08-06, Session 2: `npm run dev` + real `curl POST /api/chat`
  returned HTTP 200 with a real reply from the self-hosted platform).
- **Frontend**: `src/components/ChatWidget.tsx` (client, floating button + panel,
  mounted globally in `src/app/layout.tsx`). **Backend**: `POST /api/chat`
  (`src/app/api/chat/route.ts`).
- **External integration**: self-hosted OpenAI-compatible platform via the `openai` SDK
  `^7.4.0` (`baseURL: "https://api.gariyuuu.com/v1"`), model `"Yuu no Sekai"` (hardcoded,
  `src/app/api/chat/route.ts`). Migrated off `@anthropic-ai/sdk`/Anthropic's API in
  Session 2 (2026-08-06) to cut per-token cost — see CHANGELOG.md and SESSION_LOG.md.
  `reasoning: { enabled: false }` is passed (via `@ts-expect-error`, a platform-specific
  field not in the `openai` package's types) to keep the underlying Qwen3 model out of
  its verbose thinking mode.
- **DB dependency**: reads (does not write) the day's digest from `store.ts` for context.
- **Env vars**: `AI_PLATFORM_API_KEY` (server-only; route returns a 500 JSON error if
  absent, with no client-visible fallback UI beyond the error bubble).
- **Validation**: route checks `messages.length === 0` → 400; does not validate message
  role/content shape beyond a TypeScript-level type (no runtime schema validation, e.g.
  no Zod).
- **Error/loading/empty states**: loading = "Thinking…" bubble; error = an inline
  assistant-style bubble prefixed with ⚠️ showing the caught error message; empty state
  = a hint prompt shown before the first message.
- **Permissions**: none — no rate limiting on a route that costs real usage per call
  against the self-hosted platform.
- **Known issues**: (1) no streaming (single request/response, listed as a "for later"
  idea in `SETUP.md`); (2) no rate limiting; (3) no conversation length cap (a
  long-running chat sends the full history every turn); (4) no top-level try/catch
  around the `openai` client call itself — a thrown SDK error would surface as an
  unhandled 500, not a friendly JSON error (see API_REFERENCE.md).

## Cross-cutting: graceful degradation pattern

- **Status**: **Verified complete.** The `Section<T>` discriminated union
  (`src/lib/types.ts`) plus `<SectionCard>`/`<Unavailable>`
  (`src/components/SectionCard.tsx`) is used identically by all 8 digest sections — this
  is the one architectural pattern most worth preserving carefully in any future change.
