import { Activity, Bot, LineChart, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Mover, Quote, Section, StocksData } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";
import { Delta } from "./numeric/Delta";

/** The hand-rolled ▲/▼ became the family's Delta: same glyphs, but the colour
 *  ramp, the tabular figures and the screen-reader phrasing now come from one
 *  place shared by all three briefs. */
function Change({ value, label }: { value: number; label: string }) {
  return (
    <Delta
      value={value}
      format={(v) => `${Math.abs(v).toFixed(2)}%`}
      srLabel={`${label}: ${value >= 0 ? "up" : "down"} ${Math.abs(value).toFixed(2)} percent`}
    />
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
      className="group flex items-center justify-between gap-2 rounded-md px-1 py-1 text-sm transition-colors hover:bg-foreground/[.04]"
    >
      <span className="num-mono shrink-0 font-medium">{mover.symbol}</span>
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{mover.name}</span>
      <Change value={mover.changePercent} label={`${mover.symbol} ${mover.name}`} />
    </a>
  );
}

function MoverColumn({ title, icon: Icon, movers }: { title: string; icon: LucideIcon; movers: Mover[] }) {
  return (
    <div>
      <h3 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
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
    <SectionCard title="Markets" icon={LineChart}>
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
                <p className="text-xs text-muted-foreground">{q.name}</p>
                <p className="num flex items-baseline gap-2 font-semibold">
                  {q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <Change value={q.changePercent} label={q.name} />
                </p>
              </a>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MoverColumn title="AI Watchlist" icon={Bot} movers={stocks.aiWatchlist} />
            <MoverColumn title="Most Active" icon={Activity} movers={stocks.actives} />
            <MoverColumn title="Top Gainers" icon={TrendingUp} movers={stocks.gainers} />
            <MoverColumn title="Top Losers" icon={TrendingDown} movers={stocks.losers} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
