import { Mover, Quote, Section, StocksData, fetchFailed, missingKey } from "@/lib/types";

// FMP's legacy /api/v3 endpoints were retired, and the current "stable" API's
// free tier only accepts one symbol per quote request (batched/comma-separated
// symbols return a premium error) — so each index is fetched individually.
const BASE = "https://financialmodelingprep.com/stable";
const MOVERS_LIMIT = 25;
const INDEX_SYMBOLS: Array<{ symbol: string; name: string }> = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^IXIC", name: "Nasdaq" },
];

// AI-adjacent names (chipmakers, hyperscalers, pure-play AI software) worth
// watching regardless of whether they cracked today's gainers/losers list.
// /stable/quote gates several of these behind a "premium" error even though
// they're ordinary large/mid-caps — /stable/profile returns the same price
// and change data without that restriction.
//
// Kept to 12 rather than a longer list on purpose: each name costs one
// individual FMP request (batching is premium-gated), and FMP's free tier
// caps total requests/day — a 25-name list burns through that budget in a
// handful of rebuilds, which is exactly what emptied out this section
// earlier today. 12 fits comfortably within many more rebuilds/day.
const AI_WATCHLIST = [
  "NVDA", "AMD", "MSFT", "GOOGL", "META", "AMZN",
  "AAPL", "AVGO", "TSM", "PLTR", "ORCL", "TSLA",
];

function mapMovers(items: unknown[], limit = MOVERS_LIMIT): Mover[] {
  return (items as Array<Record<string, unknown>>).slice(0, limit).map((m) => ({
    symbol: String(m.symbol ?? ""),
    name: String(m.name ?? m.symbol ?? ""),
    price: Number(m.price ?? 0),
    changePercent: Number(m.changesPercentage ?? 0),
  }));
}

async function fetchAiWatchlist(key: string): Promise<Mover[]> {
  const results = await Promise.allSettled(
    AI_WATCHLIST.map(async (symbol) => {
      const res = await fetch(`${BASE}/profile?symbol=${symbol}&apikey=${key}`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) return null;
      const [p] = (await res.json()) as Array<Record<string, unknown>>;
      if (!p) return null;
      return {
        symbol: String(p.symbol ?? symbol),
        name: String(p.companyName ?? symbol),
        price: Number(p.price ?? 0),
        changePercent: Number(p.changePercentage ?? 0),
      } satisfies Mover;
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Mover | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((m): m is Mover => m !== null);
}

export async function getStocks(): Promise<Section<StocksData>> {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    return missingKey(
      "FMP_API_KEY",
      "Free key at https://site.financialmodelingprep.com/developer/docs (free tier)."
    );
  }

  try {
    const [indexResults, gainersRes, losersRes, activesRes, aiWatchlist] = await Promise.all([
      Promise.all(
        INDEX_SYMBOLS.map(({ symbol }) =>
          fetch(`${BASE}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${key}`, {
            next: { revalidate: 0 },
          })
        )
      ),
      fetch(`${BASE}/biggest-gainers?apikey=${key}`, { next: { revalidate: 0 } }),
      fetch(`${BASE}/biggest-losers?apikey=${key}`, { next: { revalidate: 0 } }),
      fetch(`${BASE}/most-actives?apikey=${key}`, { next: { revalidate: 0 } }),
      fetchAiWatchlist(key),
    ]);

    const indices: Quote[] = [];
    for (let i = 0; i < indexResults.length; i++) {
      const res = indexResults[i];
      if (!res.ok) continue;
      const [q] = (await res.json()) as Array<Record<string, unknown>>;
      if (!q) continue;
      indices.push({
        symbol: String(q.symbol ?? ""),
        name: INDEX_SYMBOLS[i].name,
        price: Number(q.price ?? 0),
        changePercent: Number(q.changePercentage ?? q.changesPercentage ?? 0),
      });
    }
    if (indices.length === 0) throw new Error("FMP quote returned no index data");

    const gainers = gainersRes.ok ? mapMovers(await gainersRes.json()) : [];
    const losers = losersRes.ok ? mapMovers(await losersRes.json()) : [];
    const actives = activesRes.ok ? mapMovers(await activesRes.json()) : [];

    return { ok: true, indices, gainers, losers, actives, aiWatchlist };
  } catch (err) {
    return fetchFailed(`Stocks fetch error: ${(err as Error).message}`);
  }
}
