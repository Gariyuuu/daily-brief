import { Sparkles } from "lucide-react";
import { ExtraData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function ExtraCard({ extra }: { extra: Section<ExtraData> }) {
  return (
    <SectionCard title="Quote & On This Day" icon={Sparkles}>
      {!extra.ok ? (
        <Unavailable section={extra} />
      ) : (
        <div>
          {extra.quote && (
            <blockquote className="mb-4 border-l-2 border-border pl-3 text-sm italic leading-relaxed">
              “{extra.quote.text}”
              <footer className="mt-1 text-xs not-italic text-muted-foreground">
                — {extra.quote.author}
              </footer>
            </blockquote>
          )}
          {extra.onThisDay.length > 0 && (
            <ul className="space-y-1">
              {extra.onThisDay.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="num w-10 shrink-0 font-medium tabular-nums">{e.year}</span>
                  <span className="min-w-0">{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionCard>
  );
}
