import { CoinQuote, CryptoData, Section, fetchFailed } from "@/lib/types";

// CoinGecko's public API is free and keyless. A curated top-20 rather than a
// raw market-cap-desc query, which surfaces stablecoins and obscure wrapped
// tokens ahead of coins people actually recognize.
const WATCHLIST = [
  "bitcoin", "ethereum", "tether", "binancecoin", "solana", "ripple",
  "usd-coin", "dogecoin", "cardano", "tron", "avalanche-2", "chainlink",
  "the-open-network", "shiba-inu", "polkadot", "bitcoin-cash", "litecoin",
  "near", "uniswap", "stellar",
].join(",");

export async function getCrypto(): Promise<Section<CryptoData>> {
  try {
    const [marketsRes, trendingRes] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${WATCHLIST}&order=market_cap_desc&price_change_percentage=24h`,
        { next: { revalidate: 0 } }
      ),
      fetch("https://api.coingecko.com/api/v3/search/trending", { next: { revalidate: 0 } }),
    ]);

    if (!marketsRes.ok) throw new Error(`CoinGecko markets returned ${marketsRes.status}`);

    const marketsJson = (await marketsRes.json()) as Array<Record<string, unknown>>;
    const coins: CoinQuote[] = marketsJson.map((c) => ({
      id: String(c.id ?? ""),
      symbol: String(c.symbol ?? "").toUpperCase(),
      name: String(c.name ?? ""),
      price: Number(c.current_price ?? 0),
      changePercent24h: Number(c.price_change_percentage_24h ?? 0),
      image: (c.image as string) ?? null,
    }));

    let trending: string[] = [];
    if (trendingRes.ok) {
      const trendingJson = await trendingRes.json();
      trending = ((trendingJson.coins ?? []) as Array<Record<string, unknown>>)
        .slice(0, 5)
        .map((t) => String((t.item as Record<string, unknown>)?.name ?? ""));
    }

    return { ok: true, coins, trending };
  } catch (err) {
    return fetchFailed(`Crypto fetch error: ${(err as Error).message}`);
  }
}
