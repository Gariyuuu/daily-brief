# FILE_MAP.md

Practical map of every file that matters for future work. Paths are relative to
`/Users/gariyuu/Projects/daily-brief`.

## Core data layer

| File | Purpose | Calls | Called by | Edit risk |
|---|---|---|---|---|
| `src/lib/types.ts` | `Digest`, `Section<T>`, `Ok<T>`, `Unavailable` shapes; `missingKey()`/`fetchFailed()` helpers | nothing | every source file, every component, `src/lib/aggregate.ts` | **High** — changing this ripples into every source and component |
| `src/lib/aggregate.ts` | `buildDigest()` fans out to all 8 sources in parallel; `isStale()` (15-min window) | all 8 `src/lib/sources/*.ts` | `src/app/page.tsx`, `src/app/archive/[date]/page.tsx` is read-only (doesn't call this), `/api/digest`, `/api/cron` | Medium — touches every route that builds a digest |
| `src/lib/store.ts` | Redis (Upstash) persistence + in-memory fallback; exports `saveDigest`, `getDigest`, `listDates`, `archiveIsPersistent` | `@upstash/redis` | `src/app/page.tsx`, `src/app/archive/page.tsx`, `src/app/archive/[date]/page.tsx`, `/api/digest`, `/api/cron`, `/api/chat` | **High** — Redis key names (`daily-brief:digest:{date}`, `daily-brief:dates`) are load-bearing for any already-archived production data |
| `src/lib/utils/dates.ts` | Home-timezone date helpers: `todayISO()`, `formatLocalTime()`, `homeLocalDate()`, `utcDateOffset()` | `process.env.BRIEF_TIMEZONE` | almost everything (pages, `src/lib/sources/sports.ts`, `src/lib/sources/extra.ts`) | Medium — timezone bugs here affect "today" boundaries everywhere |

## Data sources (`src/lib/sources/`)

| File | External API | Key needed | Notable quirks (read before editing) | Edit risk |
|---|---|---|---|---|
| `src/lib/sources/weather.ts` | Open-Meteo | none | WMO code → emoji/description lookup table; uses `BRIEF_CITY`/`BRIEF_LAT`/`BRIEF_LON` | Low |
| `src/lib/sources/news.ts` | GNews.io | `GNEWS_API_KEY` | 3 sequential requests with 1100ms sleeps between (free-tier rate limit ~1/sec) — parallelizing this will start failing | Medium |
| `src/lib/sources/sports.ts` | ESPN unofficial scoreboard API | none | 8 hardcoded leagues; complex `shortDetail`/`detail` fallback logic per-league (documented in comments); filters events to "today" in the home timezone via `homeLocalDate()` | Medium-High |
| `src/lib/sources/stocks.ts` | Financial Modeling Prep (`/stable` endpoints) | `FMP_API_KEY` | Free tier only allows one symbol per `/quote` call (batching is premium-gated); AI watchlist deliberately capped at 12 names to conserve daily request quota — do not casually expand this list | Medium |
| `src/lib/sources/music.ts` | Spotify (Client Credentials flow) | `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` | Uses `search?q=tag:new` because Spotify retired `browse/new-releases` for dev-mode apps (Nov 2024); `limit` is capped at 10 in dev mode despite the documented max of 50 | Medium |
| `src/lib/sources/crypto.ts` | CoinGecko | none | Curated 20-coin watchlist (not raw market-cap order) to avoid stablecoins/obscure tokens dominating the list | Low |
| `src/lib/sources/tech.ts` | Hacker News (Firebase REST) | none | Fetches top 20 story IDs then 20 individual item requests in parallel | Low |
| `src/lib/sources/extra.ts` | ZenQuotes + Wikipedia "on this day" | none | Two independent try/catch blocks — either source can fail without failing the whole section; date read from `todayISO()`, not server UTC clock | Low |

## API routes (`src/app/api/`)

| File | Route | Purpose | Auth | Edit risk |
|---|---|---|---|---|
| `digest/route.ts` | `GET /api/digest?date=`, `POST /api/digest` | GET reads (rebuilds if today + stale/missing); POST force-rebuilds today | none | Medium — this is the "Refresh Now" backend |
| `cron/route.ts` | `GET /api/cron` | Scheduled daily rebuild, triggered by Vercel Cron | Bearer `CRON_SECRET`, **optional** (skipped if unset) | **High** — auth gap here is a real security concern, see SECURITY.md |
| `src/app/api/chat/route.ts` | `POST /api/chat` | Self-hosted-platform-backed Q&A over a day's digest | none (relies on `AI_PLATFORM_API_KEY` presence) | Medium — costs real usage per call against the self-hosted platform, no rate limit |

## Pages (`src/app/`)

| File | Route | Purpose | Edit risk |
|---|---|---|---|
| `page.tsx` | `/` | Today's digest; self-healing rebuild if missing/stale | Medium |
| `layout.tsx` | (root, wraps everything) | Header/nav, font loading, mounts `<ChatWidget>` globally | Low-Medium (touches every page) |
| `src/app/archive/page.tsx` | `/archive` | List of archived dates + persistence warning banner | Low |
| `src/app/archive/[date]/page.tsx` | `/archive/YYYY-MM-DD` | One archived digest, read-only, 404s if not found | Low |
| `src/app/globals.css` | (imported by layout) | Tailwind v4 entry, light/dark CSS variables | Low |
| `src/app/opengraph-image.tsx` | `/opengraph-image` | Home page OG image, generated via `next/og`'s `ImageResponse` (added commit `7240b1c`) | Low |
| `archive/[date]/opengraph-image.tsx` | `/archive/[date]/opengraph-image` | Per-date OG image, same technique | Low |
| `src/app/robots.ts` | `/robots.txt` | Disallows `/api/`, points at `sitemap.xml`; reads `NEXT_PUBLIC_SITE_URL` | Low |
| `src/app/sitemap.ts` | `/sitemap.xml` | Lists `/` and `/archive`; reads `NEXT_PUBLIC_SITE_URL` | Low |

## Components (`src/components/`)

| File | Purpose | Edit risk |
|---|---|---|
| `src/components/SectionCard.tsx` | Shared card chrome (`<SectionCard>`) + `<Unavailable>` fallback renderer used by all 8 sections | **High** — shared by every section component |
| `src/components/DigestView.tsx` | Lays out all 8 section components in the grid | Low |
| `src/components/WeatherCard.tsx`, `src/components/NewsList.tsx`, `src/components/SportsScores.tsx`, `src/components/StockMovers.tsx`, `src/components/MusicReleases.tsx`, `src/components/CryptoTicker.tsx`, `src/components/TechNews.tsx`, `src/components/ExtraCard.tsx` | One presentational component per digest section | Low each |
| `src/components/RefreshButton.tsx` | Client component, `POST /api/digest` + `router.refresh()` | Low |
| `src/components/ChatWidget.tsx` | Client component, floating chat UI, derives "context date" from the URL, `POST /api/chat`; loading state uses `<ThinkingOrb>` from the `thinking-orbs` package (added commit `9b0e424`) | Medium |

## Config / infra files

| File | Purpose | Edit risk |
|---|---|---|
| `vercel.json` | Defines the Vercel Cron job (`/api/cron`, `0 12 * * *`) | **High** — must stay in sync with the deployed Vercel project's registered cron |
| `.env.example` | Documents every env var — **currently holds live-looking values, not placeholders; do not read/reproduce its values** | High-risk to read carelessly; low-risk to edit (just don't leak the old values) |
| `next.config.ts` | Default, empty `NextConfig` — no custom config | Low |
| `tsconfig.json` | Strict TypeScript, `@/*` path alias → `src/*` | Medium |
| `eslint.config.mjs` | Flat config, `eslint-config-next` core-web-vitals + typescript | Low |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin only | Low |
| `package.json` | Scripts (`dev`, `build`, `start`, `lint`), dependencies | Medium |
| `.vercel/project.json` | Local Vercel project link (project name `daily-brief`) | Low (not app code) |
| `AGENTS.md` | Warns that the pinned Next.js version may differ from AI training data; imported by `CLAUDE.md` | Keep intact |

## Where to make common changes

- **Add a new digest section**: add a data shape to `src/lib/types.ts`'s `Digest`
  interface, a new `src/lib/sources/yourSource.ts` returning `Section<YourData>`, wire
  it into `buildDigest()` in `src/lib/aggregate.ts`, add a presentational component in
  `src/components/` using `<SectionCard>`/`<Unavailable>`, and add it to
  `src/components/DigestView.tsx`'s grid.
- **Change which cities/leagues/watchlists are tracked**: edit the relevant constant at
  the top of the matching `src/lib/sources/*.ts` file (e.g. `LEAGUES` in `src/lib/sources/sports.ts`,
  `AI_WATCHLIST`/`INDEX_SYMBOLS` in `src/lib/sources/stocks.ts`, `WATCHLIST` in `src/lib/sources/crypto.ts`).
- **Change the digest staleness window**: `STALE_MS` constant in `src/lib/aggregate.ts`.
- **Change the cron schedule**: edit `vercel.json`'s `crons[0].schedule`, then confirm
  the change is reflected in the deployed Vercel project (redeploy required).
- **Change the chat model or system prompt**: `src/app/api/chat/route.ts` — model ID and
  `system` string are both inline in the `client.chat.completions.create()` call.
- **Change the home timezone**: set `BRIEF_TIMEZONE` env var (no code change needed;
  defaults to `"America/New_York"` in `src/lib/utils/dates.ts`).
- **Change the theme colors**: `src/app/globals.css`'s `:root` and
  `@media (prefers-color-scheme: dark)` CSS variables.
- **Add authentication**: currently none exists anywhere — this would be new
  architecture, not a small edit; touch `src/app/layout.tsx`/middleware and every API
  route deliberately, and update CLAUDE.md's "Authentication and authorization" section.
