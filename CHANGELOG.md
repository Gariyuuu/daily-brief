# CHANGELOG.md

No CHANGELOG.md existed before the 2026-08-06 documentation audit. The entries below for
the pre-audit period are reconstructed directly from `git log` (not invented) — these are
the repo's only real history. Dates are the actual commit timestamps.

## 2026-09-05 — W9 UI/UX overhaul (numbers-first design pass)

Polish pass via the `/overhaul` skill against group **W9** of
`~/Projects/OVERHAUL-GROUPS.md`. No product architecture, backend logic, schema, auth
or route changes. The group's shared decisions now live in a new portfolio design-system
layer, `~/Projects/.design-system/families/numerics.css` (v1.0), vendored here — see
`UI_SYSTEM.md`. `MASTER.css` itself was not modified.

### Added
- **`lucide-react`** — this repo had no icon library and was using emoji as interface
  icons. This is the only dependency added anywhere in the W9 group.
- Numerics family layer (vendored), with `data-numerics-auto` on `<html>` because this
  app follows the OS rather than carrying a theme class.
- `src/components/FeedItem.tsx` — the feed-entry skeleton shared with `market-brief`
  and `dramabrief`.
- `src/components/WeatherIcon.tsx` — maps the stored WMO code to a Lucide icon, so
  archived digests render identically to today's.
- A `<Freshness>` line in the page header whose 15-minute threshold matches `isStale()`.
- Named surface tokens (`--card`, `--border`, `--muted-foreground`) in both modes.

### Fixed
- **Body text failed contrast.** `text-black/50` composites to `#808080` on white —
  3.95:1, under the 4.5:1 minimum for the source names, timestamps and section subheads
  it carried. The opaque `--muted-foreground` replacement measures 5.28:1 light /
  7.63:1 dark.
- A failed refresh used `window.alert()`; it now reports inline via `role="status"`.
- The "unavailable" state showed one warning for both "no API key" and "upstream
  failed"; those are now visibly different.

### Changed
- All 8 digest sections converted to the shared template: Lucide icons in place of
  emoji throughout, `<Delta>` for market and crypto changes, `FeedItem` for news, and
  the family freshness dot for live games (was a 🔴 emoji plus red text).

## [Unreleased] — 2026-08-17 — Onboard sync (no app code changed)

Re-verified all docs against `main` at `37f84ef` (10 commits total). Found 3 real code
commits had landed since the 2026-08-07 checkpoint without a matching doc update:
`7240b1c`/`e47a545` (2026-08-13/14 — SEO metadata, Open Graph images via `next/og`,
`src/app/robots.ts`, `src/app/sitemap.ts`, and a new client-exposed `NEXT_PUBLIC_SITE_URL` env var) and
`9b0e424`/`37f84ef` (2026-08-15/16 — animated `thinking-orbs` package added to
`ChatWidget`'s "Thinking…" loading state). Corrected the now-false "no `NEXT_PUBLIC_*`
variables exist" claim in `CLAUDE.md`, `ARCHITECTURE.md`, and `SECURITY.md`; added the
4 new files to `FILE_MAP.md`/`ARCHITECTURE.md`; added FEATURES.md entry #13 (SEO
metadata); updated `UI_SYSTEM.md`'s animation/loading-state claims; updated
`DEPLOYMENT.md`/`PROJECT_STATE.md`. New this pass: fetched the production URL
(`https://daily-brief-lovat.vercel.app`) read-only and confirmed it's live with real
digest data — resolving the long-standing "is this deployed?" unknown (though
`CRON_SECRET`/`AI_PLATFORM_API_KEY`/Upstash production config remains unverified). Also
re-confirmed `THESPORTSDB_KEY` and `date-fns` are still unused, and `.env.example`
still holds live-looking GNews/FMP/Spotify/Upstash values (unresolved, TASKS.md
DB-002, now the current task). Re-ran `npx tsc --noEmit`, `npm run lint`, and
`npm run build` — all clean (12 routes, up from 7). No application code was changed.

## [Unreleased] — 2026-08-07 — Documentation checkpoint pass (no app code changed)

A "final transfer checkpoint" doc audit: re-verified all 17 handoff docs against the live
repo/code, `git status`/`git log`/`git fetch origin` (clean, up to date with
`origin/main`, HEAD `173c9ac`), and re-ran `npx tsc --noEmit`/`npm run lint`/
`npm run build` (all clean). Found and fixed several docs that still described the
pre-`173c9ac` Anthropic-based chat implementation (`FEATURES.md`, `ARCHITECTURE.md`,
this file, `API_REFERENCE.md`, `SECURITY.md`, `DEPLOYMENT.md`, `FILE_MAP.md`,
`ROADMAP.md`, `TESTING.md`, `SETUP.md`, `DECISIONS.md`, `HANDOFF.md`) — all now match
`src/app/api/chat/route.ts`'s actual `openai`-SDK-against-self-hosted-platform
implementation. Also corrected `PROJECT_STATE.md`'s "Git state" section, which still
named `0cd8c68`/3-commits-total as latest despite two more commits (`ab7a901`, `173c9ac`)
having landed since. No secrets found in any tracked file; `.env.example`'s live-looking
GNews/FMP/Spotify/Upstash values remain an unresolved, previously-flagged finding (never
committed — see SECURITY.md, TASKS.md DB-002).

## [Unreleased] — 2026-08-06 (commit `173c9ac`) — Switch chat feature off Anthropic

Replaced the direct Anthropic API call (`@anthropic-ai/sdk`, model `"claude-opus-4-8"`)
in `src/app/api/chat/route.ts` with the `openai` SDK pointed at a self-hosted
OpenAI-compatible platform (`https://api.gariyuuu.com/v1`, model `"Yuu no Sekai"`), to
stop paying for direct Anthropic API access. `ANTHROPIC_API_KEY` renamed to
`AI_PLATFORM_API_KEY` in `.env.example`/`.env.local`/`CLAUDE.md`. Verified end-to-end via
a real `npm run dev` + `curl POST /api/chat` call (HTTP 200, real reply). Scope was
explicitly limited to the chat feature — no other section, the aggregation logic, Redis
store, or cron route were touched. See SESSION_LOG.md Session 2 and DECISIONS.md D-016.

## 2026-08-06 (commit `ab7a901`) — Documentation audit (handoff doc build)

This is a **documentation-only** change. No application code, config, or dependency was
modified. Committed as `ab7a901` ("docs: add full handoff documentation system").

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
- No test framework, no CI/CD workflow, no rate limiting anywhere in the app.

**Verification performed:** `npx tsc --noEmit` (clean), `npm run lint` (clean),
`npm run build` (succeeded, all 7 routes compiled). No dev server was started, no
database was touched, nothing was deployed as part of writing these docs.

No product/application behavior was intentionally changed by the 2026-08-06 doc audit
itself (the chat migration above was a separate, later, explicitly-scoped task).

---

## Reconstructed history (from `git log`, prior to this audit)

### 2026-08-06 — `0cd8c68` — Add custom favicon matching the app's newspaper branding
Added `src/app/favicon.ico` and/or `src/app/icon.svg` branding assets (exact diff not
re-derived here beyond the commit message and the files' current presence in the repo).

### 2026-07-24 — `e46139d` — Add digest sources, archive view, and chat widget
The core feature commit: added all 8 `src/lib/sources/*.ts` fetchers, the aggregation/
store layer, the archive pages, and the chat widget (originally Anthropic-backed; later
migrated to a self-hosted platform in commit `173c9ac`, see above) — i.e., this single
commit brought the app from a bare `create-next-app` scaffold to its current
functional shape.

### 2026-07-21 — `717550f` — Initial commit from Create Next App
Repository created via `create-next-app`; unmodified boilerplate (`README.md`,
default Tailwind/ESLint/TypeScript config, default `public/` assets).
