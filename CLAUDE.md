@AGENTS.md

# CLAUDE.md — Operating Manual for Daily Brief

> The `@AGENTS.md` line above is a real Claude Code import — it pulls in a warning that
> this repo's pinned Next.js version (16.2.11, a pre-release/canary line) may differ from
> your training data. Read `node_modules/next/dist/docs/` before changing any Next.js
> API usage. Keep that import at the top of this file.

This file was rebuilt from a full repository audit on 2026-08-06. Every claim below was
checked against the actual code, config, and git history at that time. The previous
CLAUDE.md contained only the `@AGENTS.md` import and no project documentation.

## Project identity

**Daily Brief** is a personal, single-user daily-briefing web app: one page that
aggregates weather, US/world/politics news, sports scores, stock movers, new music
releases, crypto prices, tech news (Hacker News), a daily quote, and a Wikipedia
"on this day" section into one digest per calendar day. Every digest is archived by
date. A floating chat widget lets the user ask an Anthropic Claude model questions
about the current (or an archived) day's digest.

It is explicitly designed to work with **zero configured API keys** — weather, crypto,
tech news, and the quote/on-this-day section use free keyless public APIs. Sections
that need a key (news, stocks, music, chat) render a "connect your key" message instead
of crashing when that key is absent. This graceful-degradation pattern is the core
design idea of the codebase — see `src/lib/types.ts`'s `Section<T>` type.

- Repo root: `/Users/gariyuu/Projects/daily-brief`
- GitHub: `https://github.com/Gariyuuu/daily-brief` (origin remote, confirmed via `git remote -v`)
- Local Vercel link: project name `daily-brief` (see `.vercel/project.json`) — whether it
  is currently deployed/live was **not verified** in this audit (no live URL recorded
  anywhere in the repo's docs; see PROJECT_STATE.md and DEPLOYMENT.md).

## Current status

Actively-developed personal project, 3 commits total, working tree **clean** as of this
audit (see PROJECT_STATE.md for exact git state). All eight digest sections, the
archive, the chat widget, and the cron endpoint are wired end-to-end and build/typecheck
clean. No automated tests exist. See FEATURES.md for a per-feature status table.

## Technology stack

Versions below are copied verbatim from `package.json` / `package-lock.json` — do not
assume newer or older versions without re-checking.

- **Framework**: Next.js `16.2.11` (App Router, Turbopack build — `next build` output
  confirms "▲ Next.js 16.2.11 (Turbopack)"). This is a notably new/major version; see the
  `AGENTS.md` warning above.
- **React**: `19.2.4`, **react-dom**: `19.2.4`
- **Language**: TypeScript `^5` (strict mode on — `tsconfig.json` has `"strict": true`)
- **Styling**: Tailwind CSS `^4` via `@tailwindcss/postcss` (no `tailwind.config` file —
  Tailwind v4's CSS-first config lives in `src/app/globals.css`)
- **Fonts**: `next/font/google` — Geist Sans + Geist Mono (`src/app/layout.tsx`)
- **LLM SDK**: `@anthropic-ai/sdk` `^0.112.5` (used only in `src/app/api/chat/route.ts`)
- **KV store**: `@upstash/redis` `^1.38.0` (used only in `src/lib/store.ts`)
- **Date utils**: `date-fns` `^4.4.0` (declared in `package.json`; not actually imported
  anywhere in `src/` at time of audit — all date logic in `src/lib/utils/dates.ts` uses
  native `Date`/`Intl` instead — see "Known issues")
- **Lint**: ESLint `^9` with `eslint-config-next` `16.2.11` (flat config, `eslint.config.mjs`)
- **Node/npm used for this audit**: `node -v` → v26.3.0, `npm -v` → 11.16.0 (not pinned by
  the repo — no `.nvmrc` / `engines` field found)
- **Package manager**: npm (`package-lock.json` present; no `pnpm-lock.yaml` or `yarn.lock`)

## Essential commands

Run all commands from the repo root: `/Users/gariyuu/Projects/daily-brief`.

```bash
npm install       # install dependencies
npm run dev       # start Next.js dev server (Turbopack) on http://localhost:3000
npm run build     # production build (verified clean during this audit)
npm run start     # run the production build
npm run lint      # eslint . (verified clean during this audit, exit code 0)
npx tsc --noEmit  # typecheck (verified clean during this audit, exit code 0)
```

There is **no test script** in `package.json` and no test framework/files anywhere in
the repo — see TESTING.md.

## Repository structure

```
daily-brief/
├── src/
│   ├── app/
│   │   ├── page.tsx                # "/" — today's digest (server component)
│   │   ├── layout.tsx              # root layout, header/nav, mounts <ChatWidget/>
│   │   ├── globals.css             # Tailwind v4 entry + CSS theme vars
│   │   ├── favicon.ico, icon.svg   # branding assets
│   │   ├── archive/
│   │   │   ├── page.tsx            # "/archive" — list of past dates
│   │   │   └── [date]/page.tsx     # "/archive/YYYY-MM-DD" — one past digest
│   │   └── api/
│   │       ├── digest/route.ts     # GET (read/rebuild-if-stale) + POST (force refresh)
│   │       ├── cron/route.ts       # GET, Vercel-Cron-triggered daily rebuild
│   │       └── chat/route.ts       # POST, Anthropic-backed Q&A over the digest
│   ├── components/                 # one presentational component per digest section
│   │   ├── SectionCard.tsx         # shared card chrome + <Unavailable/> fallback UI
│   │   ├── DigestView.tsx          # lays out all section components in a grid
│   │   ├── WeatherCard.tsx, NewsList.tsx, SportsScores.tsx, StockMovers.tsx,
│   │   │   MusicReleases.tsx, CryptoTicker.tsx, TechNews.tsx, ExtraCard.tsx
│   │   ├── RefreshButton.tsx       # client component, calls POST /api/digest
│   │   └── ChatWidget.tsx          # client component, floating chat over /api/chat
│   └── lib/
│       ├── types.ts                # Digest shape + Section<T> ok/unavailable union
│       ├── aggregate.ts            # buildDigest() — fan-out to all 8 sources; isStale()
│       ├── store.ts                # Upstash Redis persistence + in-memory fallback
│       ├── sources/                # one file per external data source (see below)
│       │   ├── weather.ts (Open-Meteo), news.ts (GNews), sports.ts (ESPN),
│       │   │   stocks.ts (Financial Modeling Prep), music.ts (Spotify),
│       │   │   crypto.ts (CoinGecko), tech.ts (Hacker News),
│       │   │   extra.ts (ZenQuotes + Wikipedia)
│       └── utils/dates.ts          # home-timezone-aware date helpers
├── public/                         # unmodified create-next-app default SVGs
├── vercel.json                     # Vercel Cron schedule for /api/cron
├── .env.example                    # documents every env var (see "Known issues" —
│                                    # currently holds live-looking key values, not
│                                    # placeholders; not committed to git)
├── AGENTS.md                       # Next.js version warning, imported by this file
├── README.md                       # unmodified create-next-app boilerplate
├── SETUP.md                        # human-facing setup/deploy guide (accurate, see below)
└── (this audit's 17 docs, listed in HANDOFF.md)
```

## Architecture summary

Server-rendered Next.js App Router app, no client-side routing framework beyond Next's
own `<Link>`. Two dynamic server pages (`/` and `/archive/[date]`) each read a `Digest`
object (either from the Redis/in-memory store or freshly built) and hand it to
`<DigestView>`, which fans it out to one presentational component per section. Every
section component receives a `Section<T>` — a discriminated union of `{ ok: true, ...data }`
or `{ ok: false, reason, message }` — and renders either real data or a
`<Unavailable/>` fallback, so one broken/unconfigured source never breaks the page.

`buildDigest()` (`src/lib/aggregate.ts`) is the single aggregation entry point, called
from three places: the home page on a stale/missing digest, `POST /api/digest` (the
"Refresh Now" button), and `GET /api/cron` (the scheduled job). It fans out to all 8
`src/lib/sources/*.ts` fetchers in parallel via `Promise.all`; each fetcher independently
catches its own errors and never throws out of `buildDigest`. See ARCHITECTURE.md for the
full request-lifecycle diagram.

## Coding conventions

**Verified from the code** (i.e., consistently followed throughout `src/`):
- Every external data source lives in its own `src/lib/sources/*.ts` file and exports one
  async function returning `Section<SomeData>` — never throws to its caller.
- Missing-key vs. fetch-failure are distinguished via `missingKey()` / `fetchFailed()`
  helpers in `src/lib/types.ts`, so the UI can show a different message/icon for each.
- All external `fetch()` calls pass `{ next: { revalidate: 0 } }` to opt out of Next's
  data cache (every digest section is meant to be freshly fetched, not cached across
  requests).
- Components are named exports (`export function X`), except `ChatWidget` and
  `RefreshButton`, which are client components using `"use client"` and default/named
  export respectively — `ChatWidget` is a default export, everything else in
  `components/` is a named export (inconsistency, low-risk, not worth changing without
  asking first).
- Tailwind utility classes inline in JSX; no CSS Modules, no styled-components, no
  component library.
- Comments in source files consistently explain **why**, not what (e.g. why GNews calls
  are sequential with a sleep, why Spotify uses `tag:new` search instead of the retired
  new-releases endpoint) — preserve this style when editing.

**Recommended, not currently enforced by tooling:**
- No Prettier config found; formatting is whatever the author's editor did. Don't
  introduce a formatter pass without checking with the user first (would touch every file).
- No pre-commit hooks / CI config found (no `.github/workflows`, no husky). Lint/typecheck
  are manual (`npm run lint`, `npx tsc --noEmit`).

## UI and design system

See UI_SYSTEM.md for full detail. Summary: Tailwind v4, CSS-variable-based light/dark
theme (`src/app/globals.css`, driven by `prefers-color-scheme`, no manual toggle), Geist
font family, a single reusable `<SectionCard>` shell (`src/components/SectionCard.tsx`)
used by all 8 digest sections, sticky header with `Today` / `Archive` nav
(`src/app/layout.tsx`), and a floating chat bubble (`ChatWidget.tsx`) mounted globally in
the root layout.

## Environment setup

Copy `.env.example` to `.env.local` for local dev (per SETUP.md). **Do not copy real
values out of the on-disk `.env.example` into any documentation, chat, or commit** — see
"Known issues" below; that file currently holds what appear to be live key material
rather than placeholders.

| Variable | Purpose | Required? | Client/Server | Format | Safe placeholder |
|---|---|---|---|---|---|
| `BRIEF_CITY` | Display name for the weather section's city | Optional (defaults to `"New York"`) | Server | Free text | `"New York"` |
| `BRIEF_LAT` | Latitude for Open-Meteo weather query | Optional (defaults to `40.7128`) | Server | Decimal degrees | `40.7128` |
| `BRIEF_LON` | Longitude for Open-Meteo weather query | Optional (defaults to `-74.006`) | Server | Decimal degrees | `-74.0060` |
| `BRIEF_TIMEZONE` | IANA timezone used for "today" boundaries, "generated at" formatting, and sports-date bucketing | Optional (defaults to `"America/New_York"`) | Server | IANA TZ string | `"America/Los_Angeles"` |
| `GNEWS_API_KEY` | Enables News & Politics section (GNews.io) | Optional — section shows "connect your key" without it | Server only | opaque string | `your_gnews_api_key` |
| `FMP_API_KEY` | Enables Markets section (Financial Modeling Prep) | Optional | Server only | opaque string | `your_fmp_api_key` |
| `SPOTIFY_CLIENT_ID` | Spotify Client Credentials flow (New Music section) | Optional (both ID and secret required together) | Server only | opaque string | `your_spotify_client_id` |
| `SPOTIFY_CLIENT_SECRET` | Spotify Client Credentials flow | Optional | Server only | opaque string | `your_spotify_client_secret` |
| `THESPORTSDB_KEY` | Declared in `.env.example`/SETUP.md but **not read anywhere in `src/`** — sports actually uses ESPN's keyless public API (`src/lib/sources/sports.ts`). Dead/stale config. | N/A — unused | — | — | leave unset |
| `ANTHROPIC_API_KEY` | Powers the chat widget (`POST /api/chat`) | Optional — chat returns a 500 JSON error without it | Server only | `sk-ant-...` | `sk-ant-api03-placeholder` |
| `UPSTASH_REDIS_REST_URL` | Redis REST endpoint for persistent archive | Optional — falls back to in-memory (non-persistent) store | Server only | HTTPS URL | `https://example.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST auth token | Optional (required together with the URL above) | Server only | opaque string | `your_upstash_token` |
| `CRON_SECRET` | Bearer-token check on `GET /api/cron` | Optional but strongly recommended in production — **if unset, `/api/cron` has no auth check at all** | Server only | any random string | `openssl rand -hex 32` output |

No `NEXT_PUBLIC_*` variables exist anywhere in the codebase — nothing is intentionally
exposed to the client bundle.

## Database summary

No relational/SQL database. Persistence is a Redis key-value store (Upstash, REST API)
accessed only through `src/lib/store.ts`, with an automatic in-memory `Map`/`Set`
fallback when Upstash env vars are absent (non-persistent — lost on every serverless
cold start / restart). See DATABASE.md for the two keys used and their shapes.

## Authentication and authorization

**There is none.** No login, no session, no user accounts, no roles. This is a
single-user personal app by design (per SETUP.md's framing). The only access control
anywhere in the app is the optional `CRON_SECRET` bearer-token check on
`GET /api/cron` — and that check is skipped entirely if `CRON_SECRET` is unset. See
SECURITY.md.

## API and integrations

Three internal API routes (`/api/digest`, `/api/cron`, `/api/chat`) and eight outbound
external integrations (Open-Meteo, GNews, ESPN, Financial Modeling Prep, Spotify,
CoinGecko, Hacker News/Firebase, ZenQuotes + Wikipedia), plus Anthropic Claude for chat
and Upstash Redis for storage. Full request/response shapes are in API_REFERENCE.md;
per-source detail is in FEATURES.md.

## Testing and verification

No test framework, no test files, no CI workflow found anywhere in the repo. Verified
manually during this audit (all clean, see TESTING.md for exact commands/output):
`npx tsc --noEmit` (exit 0), `npm run lint` (exit 0, `eslint .`), `npm run build`
(succeeded, Turbopack, all routes compiled). No dev server was started and no real
database/deploy was touched, per this audit's constraints.

## Deployment

Vercel, inferred from `vercel.json` (defines a Cron job) and `.vercel/project.json`
(a linked project named `daily-brief`). `vercel.json`'s only content is:
```json
{ "crons": [{ "path": "/api/cron", "schedule": "0 12 * * *" }] }
```
i.e., a single daily cron hitting `/api/cron` at 12:00 UTC. Whether the project is
currently live, and whether `CRON_SECRET` and the other secrets are actually set in
Vercel's production environment, was **not verified** in this audit (would require
Vercel dashboard/CLI access outside this task's scope). See DEPLOYMENT.md.

## DO NOT CHANGE WITHOUT REVIEW

- `src/lib/types.ts`'s `Section<T>` / `Unavailable` / `Ok<T>` shapes — every source file
  and every UI component depends on this exact discriminated-union contract.
- `src/lib/store.ts`'s Redis key names (`daily-brief:digest:{date}`, `daily-brief:dates`)
  — changing them silently orphans any already-archived digests in production Redis.
- `vercel.json`'s cron schedule/path — changing the path without updating the deployed
  Vercel project's cron config will silently stop the daily digest from being built.
- The `CRON_SECRET` bearer-token check in `src/app/api/cron/route.ts` — do not weaken or
  remove it; if anything, it should be made mandatory (see SECURITY.md).
- `.env.example` — **do not read its current values into chat, commits, or docs.** It
  currently contains what look like live key material instead of placeholders (see
  "Known issues"). If asked to fix it, replace every value with an obvious placeholder
  and flag the finding to the user rather than silently rotating/deleting anything.
- Any of the 8 `src/lib/sources/*.ts` files' external endpoint URLs/params — several
  have hard-won workarounds documented in comments (GNews rate-limit spacing, FMP's
  per-symbol-only free tier, Spotify's retired new-releases endpoint, ESPN's
  inconsistent `shortDetail`/`detail` fields). Read the comment above the code before
  "simplifying" it.

## Known issues

1. **`.env.example` contains live-looking secret values instead of placeholders**
   (GNews, FMP, Spotify client ID/secret, and what appears to be a real
   `sk-ant-api03-...` Anthropic key, plus real Upstash REST URL/token). The file is
   correctly excluded from git by `.gitignore`'s `.env*` rule and `git ls-files` /
   `git log --all -- .env.local` confirm neither `.env.example` nor `.env.local` has
   ever been committed — so nothing has leaked to git history. But the values on disk
   should be treated as compromised/should-be-rotated, and the file should hold
   placeholders, not real keys, going forward. **No document in this audit reproduces
   these real values.**
2. **`GET /api/cron` has no authentication if `CRON_SECRET` is unset.** Anyone who
   knows the URL can trigger a full digest rebuild (burning GNews/FMP/Spotify free-tier
   quota) with no rate limiting anywhere in the app.
3. **`THESPORTSDB_KEY`** is documented in `.env.example` and `SETUP.md` but is dead
   config — `src/lib/sources/sports.ts` uses ESPN's unofficial public API instead and
   never reads this variable. Either the sports source was swapped after the docs were
   written, or the env var was added speculatively and never wired up.
4. **`date-fns` is an unused dependency** — declared in `package.json` but no import of
   it exists anywhere in `src/`. Not urgent, just dead weight.
5. **Chat model ID `claude-opus-4-8`** (`src/app/api/chat/route.ts` line ~82) does not
   match a model ID format recognizable from this agent's training data as of its
   knowledge cutoff (Jan 2026). Given the app's own git history postdates that cutoff,
   this may simply be a newer real model — **verify against Anthropic's current model
   list before assuming it's a typo**, and confirm chat actually works end-to-end
   (unverified in this audit — no `ANTHROPIC_API_KEY` value was invoked/tested).
6. **Archive is not persistent unless Upstash env vars are set.** Without them, the
   `/archive` page will visibly warn the user (`src/app/archive/page.tsx`) and all
   history is lost on every cold start — expected/documented behavior, not a bug, but
   worth knowing before assuming "the archive is broken."
7. **No rate limiting anywhere** — `POST /api/digest` (Refresh Now) and `POST /api/chat`
   can both be called as fast as a client wants, with no debounce/lock beyond the
   15-minute `isStale()` staleness window on the GET path.
8. **No automated tests** of any kind exist for any route, source, or component.

## AI working instructions

1. Read `CLAUDE.md` (this file), `PROJECT_STATE.md`, and `TASKS.md` fully before making
   any change.
2. Also read `AGENTS.md` (imported at the top of this file) — this repo's pinned
   Next.js version may not match your training data.
3. Never invent a fact about this repo — verify every claim against the actual file
   before writing it down anywhere (docs, commit messages, or chat).
4. Never read real values out of `.env.local` or `.env.example` into chat output,
   commit messages, or any file you write. Reference variable **names**, not values.
5. Treat `.env.example`'s current on-disk values as already-compromised; do not extend
   the pattern by adding more real secrets to any file.
6. Do not touch authentication/authorization — there isn't any, and adding it is a
   product decision, not something to do incidentally while working on something else.
7. Do not change the Redis key names in `src/lib/store.ts` without a migration plan —
   doing so orphans production archive data.
8. Do not change `vercel.json`'s cron schedule/path without confirming the deployed
   Vercel project's cron config is updated to match.
9. Do not weaken the `CRON_SECRET` check in `src/app/api/cron/route.ts`; if anything,
   flag to the user that making it mandatory (reject when unset, not just skip the
   check) would close a real gap.
10. Preserve the "why" comments in `src/lib/sources/*.ts` — they encode non-obvious
    upstream API quirks (rate limits, retired endpoints, inconsistent fields). Read them
    before changing the surrounding code.
11. Keep the `Section<T>` (`ok: true | false`) contract intact across every source file
    and every component — it is the entire error-handling strategy of this app.
12. Run `npx tsc --noEmit` and `npm run lint` after any code change and before
    considering a task done; both were verified clean at the start of this audit.
13. Do not start a long-running dev server, touch the production Upstash database, or
    deploy, unless the user explicitly asks for that specific action.
14. Do not commit, push, or run destructive git operations unless the user explicitly
    asks.
15. After any meaningful task, update `PROJECT_STATE.md`, `TASKS.md`,
    `SESSION_LOG.md`, and (if an architectural choice was made) `DECISIONS.md` — do not
    let these drift from the actual repo state.
16. If you find a contradiction between two doc files, or between a doc and the code,
    fix it immediately rather than adding a third, different answer.
17. Flag any newly-discovered secret-like value to the user before writing anything
    that might expose it, rather than silently omitting or silently including it.
18. When in doubt about scope (e.g., "should I also fix the `THESPORTSDB_KEY` dead
    config"), ask, or leave it documented as a known issue rather than changing
    behavior unprompted.

**Before starting any task:** read CLAUDE.md, PROJECT_STATE.md, and TASKS.md.
**After finishing any task:** update PROJECT_STATE.md, TASKS.md, SESSION_LOG.md, and
DECISIONS.md (if applicable), and re-verify (`tsc --noEmit`, `npm run lint`, and
`npm run build` when the change touches routes/build config).
**Always:** never expose secrets in code, commits, or docs; never casually touch
authentication/authorization (none exists — adding it is a deliberate decision), the
digest data schema (`src/lib/types.ts`), the Redis key scheme, the deployment/cron
config, or anything payment-related (there is no payment integration in this app).
