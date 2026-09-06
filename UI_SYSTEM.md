# UI_SYSTEM.md

## Layout

Single root layout (`src/app/layout.tsx`): a sticky, blurred header (`Daily Brief`
brand link + "Today"/"Archive" nav), a centered `max-w-5xl` main content area, and a
globally-mounted `<ChatWidget>` floating over everything. No sidebar, no footer. Content
pages (`/`, `/archive`, `/archive/[date]`) render inside `<main>` and don't manage their
own header/nav.

## Navigation

Two links only, both in the header (`src/app/layout.tsx`): `Today` (`/`) and `Archive`
(`/archive`). Archive detail pages (`/archive/[date]`) add a "← Back to archive" link
above their content (`src/app/archive/[date]/page.tsx`) but don't add anything to the
global header. All navigation uses Next.js `<Link>` — no client-side router library
beyond Next's own.

## Page structure

- **`/` (Home)**: title ("Today's Brief") + generated-at timestamp + `<RefreshButton>`
  in a flex header row, then `<DigestView>` below (`src/app/page.tsx`).
- **`/archive`**: title, an optional amber persistence-warning banner, then either an
  empty-state message or a divided list of date links (`src/app/archive/page.tsx`).
- **`/archive/[date]`**: back-link, formatted date title, generated-at timestamp, then
  the same `<DigestView>` component as the home page (`src/app/archive/[date]/page.tsx`).

## Reusable components

| Component | File | Role |
|---|---|---|
| `<SectionCard>` | `src/components/SectionCard.tsx` | Shared card shell (rounded-2xl, subtle border/background, icon + title header) used by every one of the 8 digest sections |
| `<Unavailable>` | `src/components/SectionCard.tsx` | Renders a friendly "⚙️ connect your key" or "⚠️ fetch failed" message inside a `<SectionCard>` when a section's `Section<T>` is `{ ok: false }` |
| `<DigestView>` | `src/components/DigestView.tsx` | Grid layout wiring all 8 section components together |
| `<RefreshButton>` | `src/components/RefreshButton.tsx` | Client component, pill button, loading state |
| `<ChatWidget>` | `src/components/ChatWidget.tsx` | Client component, floating action button that expands into a chat panel |

Every digest section component (`WeatherCard`, `NewsList`, `SportsScores`,
`StockMovers`, `MusicReleases`, `CryptoTicker`, `TechNews`, `ExtraCard`) follows the same
internal pattern: check `section.ok`, render `<Unavailable>` if false, otherwise render
the real content inside a `<SectionCard title="..." icon="...">`.

## Theme system

`src/app/globals.css`: Tailwind v4's CSS-first config (`@import "tailwindcss"` +
`@theme inline`), two CSS custom properties (`--background`, `--foreground`) with a
light default (`#ffffff` / `#171717`) overridden inside
`@media (prefers-color-scheme: dark)` (`#0a0a0a` / `#ededed`). **No manual light/dark
toggle exists** — the theme follows the OS/browser preference only. Every component
pairs each color utility with a `dark:` variant inline (e.g.
`text-black/50 dark:text-white/50`) rather than relying solely on the CSS variables for
non-background/foreground colors.

## Colors / typography / spacing

- **Fonts**: Geist Sans (`--font-geist-sans`) for body text, Geist Mono
  (`--font-geist-mono`) available but not visibly used outside the font variable
  definition (`src/app/layout.tsx`); loaded via `next/font/google`.
- **Body font stack fallback**: `Arial, Helvetica, sans-serif` (`src/app/globals.css`), applied
  underneath the Geist variable-based Tailwind font config.
- **Accent colors**: emerald (`text-emerald-600`/`emerald-400`) for positive price
  changes, red (`text-red-600`/`red-400`) for negative changes and live-game
  indicators, amber (`text-amber-700`/`amber-400`) for the archive persistence warning
  — all standard Tailwind palette shades, no custom color tokens defined.
  No dedicated design-token file exists (no `tailwind.config.ts` with custom
  colors — Tailwind v4 uses the CSS-first `@theme` block in `src/app/globals.css`, which only
  defines `background`/`foreground`/font variables, nothing else).
- **Spacing/radii**: consistently `rounded-2xl` for cards, `rounded-full` for buttons
  and pills, `rounded-lg` for smaller inline elements (thumbnails, mover pills);
  spacing is standard Tailwind scale, no custom spacing tokens.

## Responsive rules

- `<DigestView>`'s grid: `grid-cols-1` on mobile, `md:grid-cols-2` at the `md` breakpoint,
  with Weather, Markets, Tech, and Extra sections spanning both columns
  (`md:col-span-2`) while News/Sports/Music/Crypto sit side by side.
- `<StockMovers>`'s mover columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
- `<ChatWidget>`'s panel: `w-[min(24rem,calc(100vw-2.5rem))]` /
  `h-[min(32rem,calc(100vh-6rem))]` — explicitly caps itself to fit small viewports
  without overflowing.
- No dedicated mobile navigation pattern (hamburger menu, etc.) — the 2-link nav fits
  inline at all widths.

## Animation

Mostly minimal: `transition` + `hover:opacity-90` on buttons (`RefreshButton`,
`ChatWidget`'s send button and toggle bubble), `group-hover:underline` on article/
release links. No page-transition animation, no skeleton loaders. **Correction
(2026-08-17):** one animated component now exists — `src/components/ChatWidget.tsx`'s "Thinking…"
loading bubble gained a `<ThinkingOrb>` (from the `thinking-orbs` `^0.3.1` package,
added commit `9b0e424`, 2026-08-15) alongside the text. Every other loading state is
still text-only ("Refreshing…").

## Icons

Emoji only, inline in JSX — no icon library (no lucide-react, no heroicons, etc.)
anywhere in `package.json` or `src/`. Each `<SectionCard>` takes an `icon` prop as a
literal emoji string (🌤️ weather, 📰 news, 🏆 sports, 📈 markets, 🎵 music, 🪙 crypto,
💻 tech, ✨ extra). Favicon: `src/app/favicon.ico` + `src/app/icon.svg` (custom,
"newspaper branding" per the git commit that added it — the header brand link itself
also uses a 🗞️ emoji).

## Assets

`public/` contains only the unmodified `create-next-app` default SVGs (`file.svg`,
`globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — **none of these are referenced
anywhere in `src/`** (verified: no imports of `/file.svg` etc. found in any component
or page). They appear to be scaffold leftovers, not actively used assets.

## Modals / forms / loading / empty / error states

- **Modals**: none — `<ChatWidget>`'s panel is a fixed-position overlay, not a true
  modal (no backdrop, no focus trap, page behind it remains interactive).
- **Forms**: one — `<ChatWidget>`'s message input (`<form onSubmit>`), a single text
  input + submit button, no client-side validation beyond `text.trim()` non-empty check.
- **Loading states**: `<RefreshButton>` swaps its label to "Refreshing…" and disables
  itself; `<ChatWidget>` shows a "Thinking…" bubble with an animated `<ThinkingOrb>`
  while awaiting a reply (see "Animation" above). No loading
  state exists for the initial page load itself (server-rendered, so the whole page
  simply doesn't respond until the digest is ready — no `loading.tsx` file found in
  `src/app/`).
- **Empty states**: "No games found for today." (`SportsScores`), "No past days yet…"
  (`/archive`), the pre-first-message hint text (`ChatWidget`).
- **Error states**: per-section `<Unavailable>` (⚙️ missing key / ⚠️ fetch failed);
  `RefreshButton` uses a blocking `alert()`; `ChatWidget` shows an inline ⚠️-prefixed
  assistant bubble; `/archive/[date]` calls Next's `notFound()` (renders the default
  Next.js 404 page — no custom `not-found.tsx` file exists in `src/app/`).

## Accessibility

- `aria-label`s present on the chat toggle button ("Open chat"/"Close chat") and the
  `<SectionCard>` icon spans use `aria-hidden` (decorative emoji correctly hidden from
  screen readers).
- Article/release thumbnail `<img>` tags use empty `alt=""` (decorative) in
  `src/components/NewsList.tsx` and `src/components/CryptoTicker.tsx`; `src/components/MusicReleases.tsx` uses `alt={r.title}`
  (informative) — inconsistent but each choice is individually reasonable given context.
- No explicit focus-trap/keyboard-navigation handling in `<ChatWidget>`'s panel beyond
  what native `<input>`/`<button>`/`<form>` elements provide for free.
- No skip-to-content link, no explicit heading-level audit performed in this review
  beyond noting each page/section uses a single `<h1>`/`<h2>`/`<h3>` hierarchy
  consistently (page title → section title → sub-group title).
- Color contrast not independently measured in this audit (would require rendering the
  app, which was not done).

## The W9 numerics family layer (added 2026-09-05)

**Source of truth:** `~/Projects/.design-system/families/numerics.css` (v1.0).
**Vendored here as** ``src/app/design-system/numerics.css``, imported from ``src/app/globals.css`` immediately after
`master.css`. The copy is byte-identical to the source apart from a two-line header.
**Do not patch the vendored copy** — fix the source and re-vendor, exactly as with
`MASTER.css`.

### What it is

A *family* layer, sitting between `MASTER.css` and per-project overrides:

```
MASTER.css  ->  families/numerics.css  ->  overrides/<project>.css  ->  this repo's globals.css
```

MASTER holds what all 115 portfolio repos need. A family layer holds what one kind of
surface needs and no one else does. "Green means up" is meaningless in a 3D world or a
narrative game; tabular numerals are wrong for prose. Twelve numbers-first repos share
this one (see `~/Projects/OVERHAUL-GROUPS.md` group W9).

### What it provides

| Class | Use |
|---|---|
| `.num` | tabular figures on any element |
| `.num-col` | right-aligned tabular column — **apply to the `<th>` and the `<td>`** |
| `.num-mono` | monospaced identifier column (ticker, order id) with a slashed zero |
| `.num-display` | a headline figure |
| `.delta[data-dir="up\|down\|flat"]` | a signed change (see the rule below) |
| `.delta-chip` | the same, as a filled pill |
| `.spark` / `.spark-line` / `.spark-area` / `.spark-dot` | one sparkline stroke spec |
| `.feed-card` + `-meta` / `-title` / `-body` / `-foot` / `-link` | the shared feed entry |
| `.freshness[data-state="live\|stale\|offline\|loading"]` + `.freshness-dot` | refresh state |
| `.no-data` + `.no-data-title` / `.no-data-body` | a surface with a known shape and nothing in it |
| `.is-stale`, `.num-flash`, `.num-ghost` | stale region, value-change flash, ghost row |

### The rule this layer exists to enforce

**A signed number never states its direction in colour alone.** Red/green is the most
common colour-vision collision (deuteranopia, ~6% of men) and every surface in this
family is one where a sign is the point. `.delta` emits ▲/▼/– from `::before`, so a
call site *cannot* forget it. If a surface genuinely cannot carry the glyph, use
`data-cue="sign"` (explicit +/−) — still redundant, still non-colour. `data-cue="none"`
exists only for values that already print their own sign, and using it is a decision to
be justified, not a default.

`content` is deliberately declared **twice** on `.delta::before`. The second is the
CSS alt-text form (`content: "▲" / ""`), which marks the glyph decorative so assistive
tech reads the number rather than "black up-pointing triangle" — but it is only
understood by Chrome 77+, Firefox 118+, Safari 17.4+. In an older engine that whole
declaration is invalid and the glyph would vanish, taking the accessible cue with it.
The plain declaration is the fallback. Do not "clean up" the duplicate.

### Dark mode is opt-in by selector

Dark values attach only to `.dark`, `[data-theme="dark"]` and `[data-scheme="dark"]` —
never to `prefers-color-scheme`, because a light-only app on a dark-OS machine would
otherwise inherit the dark ramp on a white background and fail contrast everywhere.
**This repo has no theme class** — its palette follows the OS through
`prefers-color-scheme`. `<html>` therefore carries `data-numerics-auto`, the family
layer's explicit opt-in to OS following. Removing it would leave the light delta
colours on a near-black card.

### Contrast

Every family token clears **4.5:1 as text** on the MASTER surface stack in both ramps
(light: up 4.67, down 5.13, flat 5.03, warn 4.54; dark: 8.04 / 5.28 / 5.69 / 7.45).
Re-measure after any re-tint with `python3 ~/Projects/.design-system/tools/contrast.py <ink> <surface>`.

### Surface tokens (added in the same pass)

This app previously had no `--card`, `--border` or `--muted-foreground`; its surfaces
were written inline as Tailwind alpha utilities (`bg-black/[.02]`, `text-black/50`),
which the family classes cannot read. They are now named in `:root` and the
`prefers-color-scheme: dark` block, and exposed through `@theme inline`.

**`--muted-foreground` was a real accessibility fix, not a rename.** `text-black/50`
composites to `#808080` on white — **3.95:1**, under the 4.5:1 minimum for the body
text it carried. The opaque replacement measures 5.28:1 light / 7.63:1 dark.

### The brief template

`daily-brief`, `market-brief` and `dramabrief` are **one template in three verticals**,
and are kept consistent with each other on purpose. The shared shapes live in:

- `src/components/SectionCard.tsx` — panel chrome (`LucideIcon` + optional `meta` slot)
  and `Unavailable`, which distinguishes "no API key" from "upstream failed" rather
  than showing one warning for both.
- `src/components/FeedItem.tsx` — the feed-entry skeleton.
- the family layer's `.feed-card*` and `.freshness` classes.

Changing any of those shapes means changing them in all three repos.

### Icons

`lucide-react` was added here (this repo had no icon library and used emoji as
interface icons). `src/components/WeatherIcon.tsx` maps the **WMO code** — which is
already stored in the digest — to a Lucide icon, so archived digests render the same
way as today's. The source's `emoji` field is deliberately left untouched.
