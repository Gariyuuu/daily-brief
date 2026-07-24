# Daily Brief — Setup & Deploy

A one-click personal briefing site: weather, US/world/politics news, sports scores,
stock movers, new music releases, crypto, tech news, a daily quote, and an on-site
Claude-powered chatbot to ask questions about any day's brief. Every past day is saved
to an archive.

The site works immediately with **zero API keys** for weather, crypto, tech news, and
the quote/on-this-day section (all keyless public APIs). The remaining sections show a
"connect your key" message until you add the relevant key. Add keys whenever you're
ready — no rebuild needed, just redeploy after adding env vars.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Weather/crypto/tech/quote sections work right away.

## 2. Get API keys (add as many or as few as you want)

| Section | Service | Get a key | Cost |
|---|---|---|---|
| News & Politics | GNews.io | https://gnews.io/register | Free, 100 req/day, no card |
| Stocks & Movers | Financial Modeling Prep | https://site.financialmodelingprep.com/developer/docs | Free tier |
| Music Releases | Spotify Developer Dashboard | https://developer.spotify.com/dashboard → Create app | Free — use Client ID + Client Secret (Client Credentials flow, no user login) |
| Sports (optional, higher limits) | TheSportsDB | https://www.thesportsdb.com/api.php | Free (shared key "3" works out of the box) |
| Chatbot | Anthropic Console | https://console.anthropic.com/settings/keys | Pay-as-you-go, cheap for personal use |
| Archive persistence | Upstash | https://console.upstash.com → Create database → REST API tab | Free tier |

Copy `.env.example` to `.env.local` and fill in whichever keys you have:

```bash
cp .env.example .env.local
```

## 3. Deploy to Vercel

```bash
npm install -g vercel   # if you don't have it
vercel login
vercel                  # first deploy, follow the prompts
```

Then add every env var from `.env.local` to the project:

```bash
vercel env add GNEWS_API_KEY production
vercel env add FMP_API_KEY production
vercel env add SPOTIFY_CLIENT_ID production
vercel env add SPOTIFY_CLIENT_SECRET production
vercel env add ANTHROPIC_API_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add CRON_SECRET production   # any random string, e.g. `openssl rand -hex 32`
vercel --prod            # redeploy so the new env vars take effect
```

(Repeat with `preview`/`development` targets if you want them there too, or just pick
`production` when prompted for "all".)

## 4. How the daily digest works

- `vercel.json` schedules `/api/cron` once a day (`0 12 * * *` UTC — edit to taste).
  Vercel automatically sends `Authorization: Bearer $CRON_SECRET`, which the route
  checks before rebuilding the digest and saving it to the archive.
- The **"Refresh Now"** button on the home page calls the same aggregation logic
  on demand, in case you want the latest data before the scheduled run.
- Every digest that gets built (whether by cron or the button) is saved to Upstash
  Redis keyed by date, which is what powers `/archive`.

## 5. The chatbot

The floating 💬 button calls `/api/chat`, which sends Claude (`claude-opus-4-8`) a
compact summary of the day's digest as context, plus your question. It works for
questions about today's specific weather/news/scores, and falls back to Claude's
general knowledge for anything else. Requires `ANTHROPIC_API_KEY`.

## Ideas for later

- Push notifications when the daily digest is ready
- More sources: podcasts, TV/movie releases, air quality index, moon phase
- Per-user saved cities/watchlists/teams instead of one fixed config
- Streaming chat responses instead of a single request/response
