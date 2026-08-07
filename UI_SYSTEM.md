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
- **Body font stack fallback**: `Arial, Helvetica, sans-serif` (`globals.css`), applied
  underneath the Geist variable-based Tailwind font config.
- **Accent colors**: emerald (`text-emerald-600`/`emerald-400`) for positive price
  changes, red (`text-red-600`/`red-400`) for negative changes and live-game
  indicators, amber (`text-amber-700`/`amber-400`) for the archive persistence warning
  — all standard Tailwind palette shades, no custom color tokens defined.
  No dedicated design-token file exists (no `tailwind.config.ts` with custom
  colors — Tailwind v4 uses the CSS-first `@theme` block in `globals.css`, which only
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

Minimal: `transition` + `hover:opacity-90` on buttons (`RefreshButton`,
`ChatWidget`'s send button and toggle bubble), `group-hover:underline` on article/
release links. No page-transition animation, no skeleton loaders, no spinner components
— loading states are text-only ("Refreshing…", "Thinking…").

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
  itself; `<ChatWidget>` shows a "Thinking…" bubble while awaiting a reply. No loading
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
  `NewsList.tsx` and `CryptoTicker.tsx`; `MusicReleases.tsx` uses `alt={r.title}`
  (informative) — inconsistent but each choice is individually reasonable given context.
- No explicit focus-trap/keyboard-navigation handling in `<ChatWidget>`'s panel beyond
  what native `<input>`/`<button>`/`<form>` elements provide for free.
- No skip-to-content link, no explicit heading-level audit performed in this review
  beyond noting each page/section uses a single `<h1>`/`<h2>`/`<h3>` hierarchy
  consistently (page title → section title → sub-group title).
- Color contrast not independently measured in this audit (would require rendering the
  app, which was not done).
