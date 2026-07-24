import { Digest } from "@/lib/types";
import { getWeather } from "@/lib/sources/weather";
import { getNews } from "@/lib/sources/news";
import { getSports } from "@/lib/sources/sports";
import { getStocks } from "@/lib/sources/stocks";
import { getMusic } from "@/lib/sources/music";
import { getCrypto } from "@/lib/sources/crypto";
import { getTech } from "@/lib/sources/tech";
import { getExtra } from "@/lib/sources/extra";
import { todayISO } from "@/lib/utils/dates";

// Fetches every source in parallel. Each source already catches its own
// errors and returns a { ok:false, reason, message } shape, so one flaky
// API never breaks the rest of the digest.
export async function buildDigest(date: string = todayISO()): Promise<Digest> {
  const [weather, news, sports, stocks, music, crypto, tech, extra] = await Promise.all([
    getWeather(),
    getNews(),
    getSports(),
    getStocks(),
    getMusic(),
    getCrypto(),
    getTech(),
    getExtra(),
  ]);

  return {
    date,
    generatedAt: new Date().toISOString(),
    weather,
    news,
    sports,
    stocks,
    music,
    crypto,
    tech,
    extra,
  };
}

// The cron in vercel.json only fires once a day, so without this a digest
// built first thing in the morning (before games are played, markets open,
// etc.) would sit stale and unchanged until the next day's cron run. Any
// visit to today's brief that's older than this rebuilds it on the spot.
const STALE_MS = 15 * 60 * 1000; // 15 minutes

export function isStale(digest: Digest): boolean {
  return Date.now() - new Date(digest.generatedAt).getTime() > STALE_MS;
}
