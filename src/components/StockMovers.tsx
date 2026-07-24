import { Mover, Quote, Section, StocksData } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

function Change({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

function yahooFinanceUrl(symbol: string): string {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;
}

function MoverRow({ mover }: { mover: Mover }) {
  return (
    <a
      href={yahooFinanceUrl(mover.symbol)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between text-sm py-1 hover:underline"
    >
      <span className="font-medium">{mover.symbol}</span>
      <span className="text-black/50 dark:text-white/50 truncate mx-2 flex-1">{mover.name}</span>
      <Change value={mover.changePercent} />
    </a>
  );
}

function MoverColumn({ title, movers }: { title: string; movers: Mover[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
        {title}
      </h3>
      <div className="max-h-80 overflow-y-auto pr-1">
        {movers.map((m) => (
          <MoverRow key={m.symbol} mover={m} />
        ))}
      </div>
    </div>
  );
}

export function StockMovers({ stocks }: { stocks: Section<StocksData> }) {
  return (
    <SectionCard title="Markets" icon="📈">
      {!stocks.ok ? (
        <Unavailable section={stocks} />
      ) : (
        <div>
          <div className="flex flex-wrap gap-4 mb-4">
            {stocks.indices.map((q: Quote) => (
              <a
                key={q.symbol}
                href={yahooFinanceUrl(q.symbol)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                <p className="text-xs text-black/50 dark:text-white/50">{q.name}</p>
                <p className="font-semibold">
                  {q.price.toLocaleString()} <Change value={q.changePercent} />
                </p>
              </a>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MoverColumn title="🤖 AI Watchlist" movers={stocks.aiWatchlist} />
            <MoverColumn title="Most Active" movers={stocks.actives} />
            <MoverColumn title="Top Gainers" movers={stocks.gainers} />
            <MoverColumn title="Top Losers" movers={stocks.losers} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
