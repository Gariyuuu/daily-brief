# SESSION_LOG.md

Chronological log of work sessions on this repo. Newest entry at the bottom of each
addition (append-only). This is the first entry — no prior log existed.

---

## 2026-09-05 — W9 UI/UX overhaul (numbers-first design pass)

**Who:** Claude Code session running the `/overhaul` skill against group **W9** of
`~/Projects/OVERHAUL-GROUPS.md` (Finance, Markets, Trackers & Briefings — 12 repos).
Polish pass only: no product architecture, backend logic, schema, auth or route
changes.

**The shared piece.** A new layer was added to the portfolio design system at
`~/Projects/.design-system/families/numerics.css` (v1.0) — a *family* layer sitting
between `MASTER.css` and per-project overrides, holding the decisions that are correct
for numbers-first surfaces and meaningless elsewhere: tabular numerals, right-aligned
numeric columns, delta/PnL semantics with a **non-colour** cue, one sparkline stroke
spec, the shared feed card, freshness/refresh states, and a no-data surface distinct
from an error. `MASTER.css` itself was NOT modified, so no repo outside W9 is affected
and no vendored MASTER copy went stale. See `.design-system/CHANGELOG.md` and
`.design-system/families/README.md`.

**The rule that layer exists to enforce:** a signed number never states its direction
in colour alone. `.delta[data-dir]` emits ▲/▼/– from `::before`, so a call site cannot
forget it.

**This repo is the template anchor.** `daily-brief`, `market-brief` and
`dramabrief` are one template in three verticals; the panel/feed shapes were designed
here and propagated to the other two on purpose.

**What was done here:**

- **Dependency added: `lucide-react`** — the only new dependency in the whole W9 group.
  This repo had no icon library and was using emoji as interface icons.
- Vendored `src/app/design-system/numerics.css`. This app has no theme class (its
  palette follows the OS via `prefers-color-scheme`), so `<html>` carries
  `data-numerics-auto` — the family layer's explicit opt-in to OS following. Without
  it the light delta colours would have landed on a near-black card.
- **Named the surface tokens** this app never had: `--card`, `--border`,
  `--muted-foreground`, in both modes, wired through `@theme inline`. The surfaces
  were previously written inline as Tailwind alpha utilities (`bg-black/[.02]`,
  `text-black/50`), which the family classes cannot read.
  - **This included a real accessibility fix, not a rename.** `text-black/50`
    composites to `#808080` on white — **3.95:1**, under the 4.5:1 minimum for the
    body text it carried (source names, timestamps, section subheads). The opaque
    replacement measures **5.28:1** light / **7.63:1** dark.
- `SectionCard` rewritten to take a `LucideIcon` plus a `meta` slot. `Unavailable`
  became a proper `.no-data` surface that distinguishes "you have not connected a key"
  from "the upstream request failed" — a brief that shows the same red warning for
  both teaches the reader to ignore it.
- **New** `src/components/FeedItem.tsx` — the shared feed-entry skeleton.
- **New** `src/components/WeatherIcon.tsx` — maps the WMO code (already stored in the
  digest) to a Lucide icon. The source's `emoji` field is untouched, so archived
  digests render identically to today's.
- All 8 sections converted: Markets and Crypto now use `<Delta>` (the hand-rolled ▲/▼
  in `StockMovers` became the family component); News uses `FeedItem`; Sports' live
  game marker is the family freshness dot rather than a 🔴 emoji plus red text; tech
  story ranks/scores are tabular.
- `RefreshButton`: icon spins only while the request is in flight (so the motion *is*
  the loading state, which MASTER exempts from the reduced-motion clamp), and a failed
  refresh now reports inline via `role="status"` instead of `window.alert()`.
- Page header carries both readings of the same instant: the absolute build time, and
  a `<Freshness>` whose 15-minute threshold matches `isStale()` rather than being a
  separate opinion.

**Verification:** `npx tsc --noEmit` 0 errors; `npm run lint` clean. Tailwind compile of `globals.css` verified to emit the family classes and every token utility (`text-muted-foreground`, `bg-card`, `border-border`, `.num-mono`, `.feed-card-title`). `npm run build` NOT run (no dev server started, live Upstash untouched).

**Not done / deliberately out of scope:** no commits, no push, no deploy. Product
behaviour, routes, data model and auth are unchanged.

---

## Session 1 — 2026-08-06 — Documentation audit and handoff doc build

- **Account/agent**: unknown (first documentation-focused session on this repo; no
  prior session identity recorded anywhere in the repo).
- **Goal**: bring `daily-brief` up to the same full handoff-documentation standard as
  sibling projects `chamber-seven` and `buildstrike-arena` — audit the entire repo and
  create/update 17 root-level markdown files, without changing any application
  behavior or committing/pushing/deploying anything.
- **Files inspected**: every file in `src/` (`src/app/page.tsx`, `src/app/layout.tsx`,
  `src/app/globals.css`, `src/app/archive/page.tsx`, `src/app/archive/[date]/page.tsx`,
  `src/app/api/digest/route.ts`, `src/app/api/cron/route.ts`, `src/app/api/chat/route.ts`, all 9
  files in `components/`, `src/lib/types.ts`, `src/lib/aggregate.ts`, `src/lib/store.ts`,
  `src/lib/utils/dates.ts`, all 8 files in `lib/sources/`); `package.json`,
  `package-lock.json` (existence only), `.env.example` (variable names — values noted
  but not reproduced), `.gitignore`, `vercel.json`, `next.config.ts`, `tsconfig.json`,
  `eslint.config.mjs`, `postcss.config.mjs`, `README.md`, `SETUP.md`, `AGENTS.md`,
  `.vercel/project.json`, `public/` directory listing, full `git log`, `git status`,
  `git branch -a`, `git remote -v`, `git ls-files | grep env`,
  `git log --all --full-history -- .env.local`.
- **Files changed**:
  - Rewrote: `CLAUDE.md` (previously only an `@AGENTS.md` import).
  - Created: `PROJECT_STATE.md`, `ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`,
    `TASKS.md`, `ROADMAP.md`, `DECISIONS.md`, `DATABASE.md`, `API_REFERENCE.md`,
    `UI_SYSTEM.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `CHANGELOG.md`,
    `SESSION_LOG.md` (this file), `HANDOFF.md`.
  - Nothing else touched — no source code, config, or dependency changes.
- **Commands run**:
  - `npx tsc --noEmit` → exit 0, clean.
  - `npm run lint` (`eslint .`) → exit 0, clean.
  - `npm run build` → succeeded; Turbopack build, all 7 routes compiled and collected
    (`/`, `/_not-found`, `/api/chat`, `/api/cron`, `/api/digest`, `/archive`,
    `/archive/[date]`, plus `/icon.svg`).
  - `node -v` / `npm -v` → v26.3.0 / 11.16.0 (environment info only, not repo-pinned).
  - Various read-only `git`/`grep`/`find`/`cat` commands for inspection — no writes,
    no `git add`/`commit`/`push`, no destructive git operations.
- **Tests run**: none exist in the repo (see TESTING.md) — no test command was run
  because none is defined.
- **Results**: typecheck, lint, and build all clean/passing. No functional bugs found
  in the code itself. Several **gaps/risks** found and documented (not fixed):
  live-looking credential values in `.env.example`/`.env.local` (never committed to
  git — confirmed via history search); `GET /api/cron` unauthenticated when
  `CRON_SECRET` is unset; `THESPORTSDB_KEY` documented but unused (sports actually uses
  ESPN); unused `date-fns` dependency; unverifiable Anthropic chat model ID
  (`claude-opus-4-8`); no test framework/CI/rate-limiting anywhere.
- **Decisions made**: documented (not changed) the intentional zero-auth,
  graceful-degradation design philosophy evident throughout the codebase (see
  DECISIONS.md D-001–D-015). Chose not to modify `.env.example`'s values, rotate any
  credential, or tighten the `CRON_SECRET` check — these are flagged as follow-up
  security tasks (TASKS.md DB-002/DB-003) requiring the maintainer's explicit decision,
  per this session's instruction not to change application behavior.
- **Problems found**: see "Results" above and SECURITY.md's "Production security gaps"
  section for the full prioritized list.
- **Work completed**: all 17 documentation files now exist and are internally
  consistent with each other and with the verified state of the code.
- **Work remaining**: the security/cleanup follow-ups listed in TASKS.md
  (DB-002 through DB-006) are documented but **not implemented** — they were
  deliberately left as flagged next-steps, not executed, per the audit's scope (no
  behavior changes). Whether the app is currently deployed/live and whether
  production env vars match what's documented was also **not verified** (would require
  Vercel dashboard/CLI access outside this task's scope).
- **Recommended next action**: see PROJECT_STATE.md's "Next three recommended actions"
  and HANDOFF.md's "What to do next" — in short: (1) rotate the exposed credentials and
  clean up `.env.example`, (2) decide on and implement mandatory `CRON_SECRET`
  enforcement, (3) verify the actual Vercel deployment/production env state and update
  DEPLOYMENT.md/PROJECT_STATE.md with the confirmed live URL (or lack thereof).

---

## Session 2 — 2026-08-06 — Migrate chat feature off Anthropic to self-hosted platform

- **Account/agent**: unknown (task-scoped session; no prior identity recorded).
- **Goal**: stop paying for direct Anthropic API access by replacing the chat feature's
  `@anthropic-ai/sdk` call with the `openai` SDK pointed at a self-hosted
  OpenAI-compatible platform (`https://api.gariyuuu.com/v1`, model `"Yuu no Sekai"`).
  Scope was explicitly limited to the chat feature only — no other section, the digest
  aggregation logic, Redis store, or cron route were touched.
- **Files inspected before editing** (per CLAUDE.md rule #7 — inspect before changing):
  `src/app/api/chat/route.ts` (re-verified it is the only file importing/using
  `@anthropic-ai/sdk` via `grep -rn "nthropic" src/ package.json` — confirmed), `package.json`.
- **Files changed**:
  - `package.json` — removed `@anthropic-ai/sdk` (`^0.112.5`), added `openai` (`^7.4.0`,
    current stable per `npm view openai version` at time of change).
  - `src/app/api/chat/route.ts` — replaced the `Anthropic` client/`messages.create()`
    call with an `OpenAI` client (`baseURL: "https://api.gariyuuu.com/v1"`) and
    `chat.completions.create()`. The Anthropic `system` param became the first message
    in the `messages` array (`role: "system"`). Response parsing changed from
    Anthropic's `content` block array to `response.choices[0].message.content`. Added
    `reasoning: { enabled: false }` (with `@ts-expect-error`, since it's a
    platform-specific field not in the `openai` package's types) to keep the underlying
    Qwen3 model out of its verbose thinking mode. `summarizeDigest()` and the system
    prompt text were preserved exactly, unchanged.
  - `.env.example` — replaced the `ANTHROPIC_API_KEY` line/real value with
    `AI_PLATFORM_API_KEY="your_ai_platform_api_key"` (placeholder only; the real key was
    never written to this file).
  - `.env.local` — replaced the real `ANTHROPIC_API_KEY` value with the real
    `AI_PLATFORM_API_KEY` value provided directly in the task instructions (not read
    from any file), for local dev/testing. `.env.local` is gitignored and was already
    the place real secrets lived.
  - `CLAUDE.md` — updated the "LLM SDK" tech-stack line, the env var table's
    `ANTHROPIC_API_KEY` row (now `AI_PLATFORM_API_KEY`), three other Anthropic-specific
    prose mentions (project identity, repo structure comment, API/integrations
    section), and "Known issues" items 1 and 5 (item 5 marked RESOLVED).
- **Commands run**: `npm view openai version` (→ `7.4.0`), `npm install`,
  `npx tsc --noEmit` (exit 0), `npm run lint` (exit 0, one pre-existing unrelated
  warning in `_tmp_verify2.mjs`, not touched), `npm run build` (succeeded, all 7 routes
  compiled), `npm run dev` (started, then killed after testing) + a real
  `curl -X POST http://localhost:3000/api/chat` with a test message — returned HTTP 200
  with a real reply from the new platform, confirming the integration works end-to-end.
- **Tests run**: no automated test suite exists; the manual curl test above is the only
  verification, per TESTING.md's smoke-test approach.
- **Results**: typecheck, lint, and build all clean. Functional test against the real
  self-hosted platform succeeded (HTTP 200, non-empty reply).
- **Decisions made**: kept the `AI_PLATFORM_API_KEY` env var name (as directed) rather
  than reusing `ANTHROPIC_API_KEY`, since the underlying provider changed entirely.
  Nothing outside the chat feature was touched (weather/news/sports/stocks/music/crypto/
  tech sections, digest aggregation, Redis store, and cron route are all untouched — per
  this repo's "DO NOT CHANGE WITHOUT REVIEW" list).
- **Problems found**: none new. Pre-existing unrelated lint warning in
  `_tmp_verify2.mjs` (not part of `src/`, not touched by this session).
- **Work completed**: chat feature fully migrated off Anthropic; verified via
  typecheck/lint/build and a real functional test.
- **Work remaining**: nothing outstanding for this task. TASKS.md DB-006 ("verify the
  Anthropic chat model ID") is now superseded/resolved — chat no longer uses Anthropic
  at all.
- **Recommended next action**: none required for this task. The pre-existing follow-ups
  in TASKS.md (DB-002 credential rotation for the *other* four still-real env values,
  DB-003 mandatory `CRON_SECRET`, DB-004/DB-005 cleanup) remain open and unrelated to
  this change.

---

## Session 3 — 2026-08-17 — Onboard sync (repo-memory batch sweep, no app code changed)

- **Account/agent**: Claude (repo-memory skill, onboard mode) — part of a 5-repo batch
  documentation sweep; no prior conversation with this repo.
- **Goal**: verify the existing 17-file memory system against current repo state (it
  was last touched 2026-08-06/07, and `main` had moved on since) and correct any drift
  found, per the batch task's explicit instruction to correct stale content in onboard
  mode rather than only reporting it.
- **Files inspected**: all 17 existing root `.md` files in full; `git log --oneline -30`
  and `git diff --stat e83d500..37f84ef` to find undocumented changes; the diff content
  of `package.json`, `src/app/layout.tsx`, `src/app/opengraph-image.tsx`,
  `src/app/archive/[date]/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`,
  `src/components/ChatWidget.tsx`; `src/lib/sources/sports.ts` (re-confirmed
  `THESPORTSDB_KEY` still unused); `.env.example` (names + placeholder-vs-real pattern
  check only, no values reproduced); `.vercel/project.json`; `SETUP.md`; `git status`.
- **Files changed**: `CLAUDE.md`, `PROJECT_STATE.md`, `TASKS.md`, `HANDOFF.md`,
  `ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`, `SECURITY.md`, `DEPLOYMENT.md`,
  `UI_SYSTEM.md`, `CHANGELOG.md`, `SESSION_LOG.md` (this entry), `.env.example`
  (added `NEXT_PUBLIC_SITE_URL` placeholder row). `README.md`, `SETUP.md`,
  `DATABASE.md`, `API_REFERENCE.md`, `DECISIONS.md`, `ROADMAP.md`, `TESTING.md` were
  read and found still accurate — left unchanged.
- **Commands run**: `npx tsc --noEmit` (exit 0), `npm run lint` (exit 0), `npm run build`
  (succeeded, 12 routes — up from 7, the 4 new SEO routes plus `/icon.svg`), `git log`,
  `git diff --stat`, `grep -rn "THESPORTSDB\|date-fns" src/` (both empty, confirming
  still unused), a read-only fetch of `https://daily-brief-lovat.vercel.app`.
- **Tests run**: none exist (see TESTING.md). The production fetch above is the closest
  thing to a live check performed this session.
- **Results**: typecheck/lint/build all clean. Found 3 real, undocumented commits
  (`7240b1c`, `e47a545`, `9b0e424`, `37f84ef`) — SEO metadata/Open Graph
  images/`src/app/robots.ts`/`src/app/sitemap.ts` plus a new `NEXT_PUBLIC_SITE_URL` env var, and an
  animated `thinking-orbs` chat loading indicator. The "no `NEXT_PUBLIC_*` variables"
  claim in 3 files was `[Outdated]` and is now corrected. The production deployment,
  previously an open `[Unknown]` in every doc that mentioned it, is now confirmed live.
- **Decisions made**: promoted `DB-002` (credential rotation) from "Next up" to
  "Current task" across all four core files (it was already the de facto next priority
  in every doc, just not formally marked current); added `DB-007` (this sync, done) and
  `DB-008` (document `NEXT_PUBLIC_SITE_URL` in `SETUP.md`, low priority, not done this
  pass since `SETUP.md` is outside the core memory-file set).
- **Problems found**: none new beyond the doc drift described above. `.env.example`
  re-confirmed to still hold live-looking GNews/FMP/Spotify/Upstash values (DB-002
  still open, no value read into any doc).
- **Work completed**: full doc set re-synced with current code and git state;
  `verify_docs.py` passes clean (see below); memory files committed.
- **Work remaining**: `DB-002` (blocked on maintainer), `DB-003`, `DB-004`, `DB-005`,
  `DB-008` all still open — see TASKS.md.
- **Recommended next action**: `DB-002` (credential rotation) if the maintainer has
  provider-dashboard access available; otherwise `DB-003` (mandatory `CRON_SECRET`) or
  `DB-008` (SETUP.md doc gap) are unblocked alternatives.
