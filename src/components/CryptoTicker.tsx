import { Bitcoin, Flame } from "lucide-react";
import { CryptoData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";
import { Delta } from "./numeric/Delta";

export function CryptoTicker({ crypto }: { crypto: Section<CryptoData> }) {
  return (
    <SectionCard title="Crypto" icon={Bitcoin}>
      {!crypto.ok ? (
        <Unavailable section={crypto} />
      ) : (
        <div>
          <div className="flex flex-wrap gap-4">
            {crypto.coins.map((c) => (
              <a
                key={c.symbol}
                href={`https://www.coingecko.com/en/coins/${c.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md px-1 py-1 text-sm transition-colors hover:bg-foreground/[.04]"
              >
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" loading="lazy" className="size-5 rounded-full" />
                )}
                <div>
                  <p className="num-mono font-medium">{c.symbol}</p>
                  <p className="num flex items-baseline gap-1.5 text-xs text-muted-foreground">
                    ${c.price.toLocaleString()}
                    <Delta
                      value={c.changePercent24h}
                      format={(v) => `${Math.abs(v).toFixed(2)}%`}
                      srLabel={`${c.symbol}: ${c.changePercent24h >= 0 ? "up" : "down"} ${Math.abs(c.changePercent24h).toFixed(2)} percent in 24 hours`}
                    />
                  </p>
                </div>
              </a>
            ))}
          </div>
          {crypto.trending.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="size-3.5 shrink-0" aria-hidden="true" />
              Trending: {crypto.trending.join(", ")}
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
