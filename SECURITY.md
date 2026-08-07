# SECURITY.md

Defensive review only — no destructive or intrusive testing was performed (no live
requests were sent to any endpoint with crafted payloads, no attempt to actually
exercise the unauthenticated cron path against a real deployment).

## Auth/authz boundaries

**There is no authentication or authorization anywhere in this application.** Every
page and every API route is publicly reachable by anyone with the URL. This appears to
be an intentional design choice for a single-user personal tool (see CLAUDE.md /
DECISIONS.md D-011), not an oversight — but it means every finding below should be read
in that context: the main residual risk is **cost/quota abuse and data availability**,
not unauthorized access to private user data (there is none stored).

The one exception is `GET /api/cron` (`src/app/api/cron/route.ts`), which checks an
`Authorization: Bearer <CRON_SECRET>` header **only if `CRON_SECRET` is set** as an env
var. If it is unset, the check is skipped entirely and the route is fully open.

## Secret handling

- Secrets read: `GNEWS_API_KEY`, `FMP_API_KEY`, `SPOTIFY_CLIENT_ID`,
  `SPOTIFY_CLIENT_SECRET`, `THESPORTSDB_KEY` (declared but unused), `ANTHROPIC_API_KEY`,
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`. All are read only
  via `process.env.*` inside server-only files (`src/lib/sources/*.ts`,
  `src/lib/store.ts`, `src/app/api/*/route.ts`) — grep confirmed none are referenced
  from any `"use client"` file, and no `NEXT_PUBLIC_*` variable exists anywhere.
- **Finding (High)**: `.env.example` on disk (repo root) currently contains what appear
  to be **live, working credential values** — including a full-format
  `sk-ant-api03-...` string in the `ANTHROPIC_API_KEY` slot, plus GNews, FMP, Spotify,
  and Upstash values — instead of placeholders. `.env.example` is meant to be a
  documentation template, typically safe to commit; this instance is not safe to commit
  in its current state.
  - **Mitigating factor**: `.gitignore` includes a blanket `.env*` rule, and
    `git log --all --full-history -- .env.local` plus `git ls-files | grep -i env`
    both confirm neither `.env.example` nor `.env.local` has ever been committed to this
    repository's git history. Nothing has leaked via git.
  - **Residual risk**: the values still exist in plaintext on disk, were read by this
    audit process (names only were written to any doc — no value was reproduced in any
    file this audit created), and remain exposed to anything else with local filesystem
    access (other tools, backups, sync services, other AI agents run against this
    directory in the future).
  - **Recommendation**: rotate every one of these credentials at its provider, then
    replace `.env.example`'s values with obvious placeholders (e.g.
    `your_gnews_api_key`). See TASKS.md DB-002.
- No secrets appear in any of the 17 documentation files produced by this audit — every
  env var is documented by **name and format only**, with a fabricated safe placeholder
  (see CLAUDE.md's "Environment setup" table).

## Client-exposed vars

None found — no `NEXT_PUBLIC_*` variables exist in the codebase.

## Injection / XSS / CSRF risk

- **XSS**: no `dangerouslySetInnerHTML` usage found anywhere in `src/`. All external
  content (news headlines, quote text, HN story titles, etc.) is rendered through
  React's normal JSX text interpolation, which auto-escapes — no raw HTML from any
  external API is ever injected into the DOM unescaped.
- **SQL/NoSQL injection**: not applicable — no SQL database; the only "queries" are
  Redis `GET`/`SET`/`SADD`/`SMEMBERS` calls with app-controlled keys
  (`daily-brief:digest:{date}`), where `{date}` comes from either `todayISO()`
  (server-computed) or a URL path/query param. The `date` param
  (`/archive/[date]`, `?date=` on `/api/digest`) is passed directly into the Redis key
  without format validation — a request for an arbitrary string as `date` would simply
  look up a key that (almost certainly) doesn't exist and 404/`notFound()`, not cause
  an injection, since Upstash's REST API takes the key as a value, not interpolated
  into a query language.
- **CSRF**: `POST /api/digest` and `POST /api/chat` have no CSRF token and no
  same-origin check. Given there is no authentication anywhere, a CSRF attack couldn't
  escalate privilege (there's nothing to impersonate), but a malicious page could still
  cause a victim's browser to trigger digest rebuilds or chat API calls (cost/quota
  impact on the app owner, not data exposure for the visitor).

## File upload risk

None — no file upload functionality exists anywhere in the app.

## Webhook verification

None — no incoming webhooks exist in the codebase (the "cron" endpoint is a scheduled
GET trigger from Vercel, not a webhook with a payload/signature to verify; its only
protection is the optional bearer token described above).

## Rate limiting

**None anywhere.** No middleware, no per-IP throttling, no request counting. Every
route can be called as fast as a client's network allows:
- `POST /api/digest` — each call fans out to 8 external APIs, several of which have
  hard daily quotas (GNews 100 req/day, FMP free-tier daily cap, Spotify's own
  rate limits).
- `POST /api/chat` — each call is a real, billed Anthropic API request with no cap.
- `GET /api/cron` — when `CRON_SECRET` is unset, this is the most severe combination:
  a fully public endpoint that triggers the same expensive fan-out as Refresh Now.

## Admin access

No admin interface, no elevated-privilege role, no separate admin routes exist anywhere
in the app.

## DB policies

Not applicable in the traditional RLS sense (see DATABASE.md) — Upstash Redis access
control is entirely "possession of `UPSTASH_REDIS_REST_TOKEN`," which only this app's
server code holds (assuming the token itself hasn't leaked — see the `.env.example`
finding above).

## Logging of sensitive data

No structured logging exists anywhere in `src/` (no `console.log`/error-tracking calls
found). This means there is currently no accidental-secret-in-logs risk from application
code, but it also means there is no audit trail if something goes wrong (e.g. no record
of who/what triggered `/api/cron` when unauthenticated).

## Dependency concerns

- `@anthropic-ai/sdk` `^0.112.5`, `@upstash/redis` `^1.38.0`, `next` `16.2.11`, `react`/
  `react-dom` `19.2.4` — all reasonably current at time of audit; no independent CVE
  scan was performed (out of scope for this task — would require `npm audit` or similar
  against live vulnerability databases, not attempted here).
- `next` `16.2.11` is a notably new/major version relative to this agent's training
  data — see `AGENTS.md`'s explicit warning that APIs/conventions may differ; this is a
  process risk (future AI-assisted changes could use outdated patterns) more than a
  security risk per se.

## Production security gaps (summary)

1. **High**: `.env.example`/`.env.local` hold live-looking credentials on disk —
   rotate and replace with placeholders (TASKS.md DB-002).
2. **Medium-High**: `/api/cron` is unauthenticated whenever `CRON_SECRET` is unset in
   the deployment environment — verify it's set in production, and consider making the
   check mandatory rather than optional (TASKS.md DB-003).
3. **Medium**: no rate limiting on any route, especially `/api/chat` (real cost per
   call) and the cron/refresh paths (external API quota consumption).
4. **Low**: no CSRF protection on state-changing POST routes — low impact given no auth
   exists to bypass, but still enables cost-abuse via a cross-site request.
5. **Low**: no top-level error handling in `/api/digest`/`/api/cron` — an unexpected
   failure (e.g. Redis outage) surfaces as a raw framework 500 rather than a controlled
   response; not a confidentiality/integrity issue, but an availability/UX one.

## Recommended fixes (priority order)

1. Rotate every credential found in `.env.example`/`.env.local`; replace the file's
   values with placeholders.
2. Confirm `CRON_SECRET` is set in the production Vercel environment; consider making
   the check reject (not skip) when unset.
3. Add basic rate limiting (even a simple in-memory/IP-based limiter, or Vercel's
   built-in options) to `/api/chat` and `POST /api/digest`.
4. Wrap `buildDigest()`/`saveDigest()` calls in `/api/digest` and `/api/cron` in
   try/catch and return a controlled JSON 500 on failure.
5. (Optional, low priority given the no-auth design) add a same-origin/CSRF check to
   the two POST routes if cost-abuse becomes a practical concern.

No other destructive or exploratory testing was performed against this app during this
audit, per the task's "no destructive testing" constraint.
