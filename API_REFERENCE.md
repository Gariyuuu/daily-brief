# API_REFERENCE.md

All three routes below are Next.js App Router route handlers under `src/app/api/`.
No route requires a request body larger than a small JSON object; no route returns
paginated results. No example below contains a real secret — placeholders are used
throughout.

---

## `GET /api/digest`

- **Source file**: `src/app/api/digest/route.ts`
- **Purpose**: return the stored digest for a given date; if the date is today and
  nothing has been stored yet (or the stored snapshot is older than 15 minutes),
  rebuilds it from all 8 live sources first.
- **Auth/authz**: none.
- **Query params**: `date` (optional, `YYYY-MM-DD`; defaults to today in the configured
  home timezone via `todayISO()`).
- **Request body**: none.
- **Response (200)**: full `Digest` JSON object —
  ```json
  {
    "date": "2026-08-06",
    "generatedAt": "2026-08-06T12:00:00.000Z",
    "weather": { "ok": true, "city": "New York", "current": { "...": "..." }, "daily": [] },
    "news": { "ok": false, "reason": "missing_key", "message": "Set GNEWS_API_KEY to enable this section. ..." },
    "sports": { "ok": true, "games": [] },
    "stocks": { "ok": true, "indices": [], "gainers": [], "losers": [], "actives": [], "aiWatchlist": [] },
    "music": { "ok": true, "releases": [] },
    "crypto": { "ok": true, "coins": [], "trending": [] },
    "tech": { "ok": true, "stories": [] },
    "extra": { "ok": true, "quote": null, "onThisDay": [] }
  }
  ```
- **Response (404)**: `{ "error": "No digest found for that date" }` — only possible for
  a non-today date that was never archived.
- **Validation**: none beyond the implicit date-string format expected by `getDigest`/
  `buildDigest` (an invalid date string is not explicitly rejected — it would just fail
  to match any stored key and, if it happens to equal `todayISO()`, trigger a rebuild;
  otherwise fall through to 404).
- **Side effects**: may write to the store (`saveDigest`) when rebuilding today's digest.
- **DB ops**: `getDigest(date)` (read), possibly `saveDigest(digest)` (write) via
  `src/lib/store.ts`.
- **External calls**: possibly all 8 source APIs (only when rebuilding).
- **Errors**: no explicit try/catch around `buildDigest()`/`saveDigest()` in this
  handler — an unexpected throw (e.g. Redis unreachable) surfaces as Next.js's default
  unhandled-error response, not a controlled JSON error.

---

## `POST /api/digest`

- **Source file**: `src/app/api/digest/route.ts`
- **Purpose**: force-rebuild today's digest from live sources regardless of staleness
  ("Refresh Now" button's backend).
- **Auth/authz**: none.
- **Params**: none.
- **Request body**: none required/read.
- **Response (200)**: full `Digest` JSON object (same shape as the GET response above),
  always for today's date.
- **Validation**: none.
- **Side effects**: always rebuilds and overwrites today's stored digest, regardless of
  how recently it was last built.
- **DB ops**: `saveDigest(digest)` (write, unconditional).
- **External calls**: all 8 source APIs, every time this is called.
- **Errors**: same gap as GET — no top-level try/catch.
- **Notes**: no rate limiting — can be called as fast as a client wants, each call
  burning GNews/FMP/Spotify free-tier request quota.

---

## `GET /api/cron`

- **Source file**: `src/app/api/cron/route.ts`
- **Purpose**: scheduled daily digest rebuild, triggered by Vercel Cron
  (`vercel.json`, `0 12 * * *` UTC).
- **Auth/authz**: **optional** bearer-token check against `process.env.CRON_SECRET`.
  If `CRON_SECRET` is set, the request must include `Authorization: Bearer <CRON_SECRET>`
  (Vercel sends this automatically for cron-triggered invocations once the env var is
  configured) or the route returns 401. **If `CRON_SECRET` is unset, the check is
  skipped entirely and the route is unauthenticated.**
- **Params**: none.
- **Request body**: none.
- **Response (200)**: `{ "ok": true, "date": "2026-08-06" }`
- **Response (401)**: `{ "error": "Unauthorized" }` (only reachable when `CRON_SECRET`
  is set and the header is missing/wrong).
- **Validation**: none beyond the auth header check.
- **Side effects**: always rebuilds and overwrites today's stored digest.
- **DB ops**: `saveDigest(digest)` (write, unconditional).
- **External calls**: all 8 source APIs, every invocation.
- **Errors**: same gap as `/api/digest` — no top-level try/catch around
  `buildDigest()`/`saveDigest()`.

---

## `POST /api/chat`

- **Source file**: `src/app/api/chat/route.ts`
- **Purpose**: answer a user's question about a given day's digest (or general
  knowledge) using a self-hosted OpenAI-compatible platform.
- **Auth/authz**: none (relies solely on `AI_PLATFORM_API_KEY` being configured
  server-side; no per-request auth of the caller).
- **Request body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "What's the weather like today?" }
    ],
    "date": "2026-08-06"
  }
  ```
  `messages`: array of `{ role: "user" | "assistant", content: string }`, required
  (defaults to `[]` if omitted, which then fails the length check below).
  `date`: optional `YYYY-MM-DD`, defaults to `todayISO()`.
- **Response (200)**: `{ "reply": "It's 72°F and partly cloudy in New York." }`
- **Response (400)**: `{ "error": "messages is required" }` when `messages` is empty.
- **Response (500)**: `{ "error": "AI_PLATFORM_API_KEY is not configured on the server." }`
  when the key is missing.
- **Validation**: only checks `messages.length > 0`; no schema validation of message
  shape/roles beyond TypeScript's compile-time typing (no runtime library like Zod is
  used anywhere in the repo).
- **Side effects**: none written to the store — this route only reads (`getDigest`),
  never writes.
- **DB ops**: `getDigest(date)` (read-only) to build chat context; falls back to
  `"No digest has been generated yet for {date}."` context string if nothing is stored.
- **External calls**: self-hosted OpenAI-compatible platform via the `openai` SDK
  `^7.4.0` (`client.chat.completions.create(...)`, `baseURL:
  "https://api.gariyuuu.com/v1"`), model `"Yuu no Sekai"` (hardcoded), `max_tokens: 1024`,
  plus a platform-specific `reasoning: { enabled: false }` param (cast via
  `@ts-expect-error` since it isn't in the `openai` package's types) to suppress the
  underlying Qwen3 model's verbose thinking mode. No streaming. Migrated off Anthropic's
  Messages API in commit `173c9ac` (2026-08-06) — see DECISIONS.md D-016.
- **Errors**: no top-level try/catch around the platform call itself — a thrown SDK
  error (invalid API key, invalid model ID, rate limit, etc.) is not explicitly caught
  in this route and would surface as an unhandled 500, not a friendly JSON error (the
  400/500 cases above are the only explicitly-handled error paths).
- **Notes**: no rate limiting — each call costs real usage against the self-hosted
  platform with no cap; no conversation-length limit (`messages` sent through exactly as
  received from the client, full history each turn).
