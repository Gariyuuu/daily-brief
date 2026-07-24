import { CryptoData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function CryptoTicker({ crypto }: { crypto: Section<CryptoData> }) {
  return (
    <SectionCard title="Crypto" icon="🪙">
      {!crypto.ok ? (
        <Unavailable section={crypto} />
      ) : (
        <div>
          <div className="flex flex-wrap gap-4">
            {crypto.coins.map((c) => {
              const positive = c.changePercent24h >= 0;
              return (
                <a
                  key={c.symbol}
                  href={`https://www.coingecko.com/en/coins/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  {c.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="w-5 h-5 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium">{c.symbol}</p>
                    <p
                      className={
                        positive
                          ? "text-emerald-600 dark:text-emerald-400 text-xs"
                          : "text-red-600 dark:text-red-400 text-xs"
                      }
                    >
                      ${c.price.toLocaleString()} ({positive ? "+" : ""}
                      {c.changePercent24h.toFixed(2)}%)
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
          {crypto.trending.length > 0 && (
            <p className="mt-3 text-xs text-black/50 dark:text-white/50">
              🔥 Trending: {crypto.trending.join(", ")}
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
