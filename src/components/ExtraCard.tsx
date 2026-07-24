import { ExtraData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function ExtraCard({ extra }: { extra: Section<ExtraData> }) {
  return (
    <SectionCard title="Quote & On This Day" icon="✨">
      {!extra.ok ? (
        <Unavailable section={extra} />
      ) : (
        <div>
          {extra.quote && (
            <blockquote className="mb-4 text-sm italic">
              “{extra.quote.text}”
              <footer className="not-italic text-xs text-black/50 dark:text-white/50 mt-1">
                — {extra.quote.author}
              </footer>
            </blockquote>
          )}
          {extra.onThisDay.length > 0 && (
            <ul className="space-y-1">
              {extra.onThisDay.map((e, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{e.year}:</span> {e.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionCard>
  );
}
