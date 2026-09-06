import { Trophy } from "lucide-react";
import { Section, SportsData } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function SportsScores({ sports }: { sports: Section<SportsData> }) {
  return (
    <SectionCard title="Sports" icon={Trophy}>
      {!sports.ok ? (
        <Unavailable section={sports} />
      ) : sports.games.length === 0 ? (
        <p className="text-sm text-muted-foreground">No games found for today.</p>
      ) : (
        <div className="space-y-2">
          {sports.games.map((g, i) => (
            <a
              key={`${g.league}-${i}`}
              href={g.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg bg-foreground/[.04] px-3 py-2 text-sm transition-colors hover:bg-foreground/[.08]"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{g.league}</p>
                <p className="font-medium">
                  {g.awayTeam} @ {g.homeTeam}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {g.state === "pre" ? (
                  <p className="num text-xs text-muted-foreground">{g.status}</p>
                ) : (
                  <>
                    <p className="num font-semibold">
                      {g.awayScore ?? "-"} : {g.homeScore ?? "-"}
                    </p>
                    {/* An in-progress game was marked by a 🔴 emoji plus red
                        text. Both are colour-shaped cues; the freshness dot is
                        the family's live indicator and it carries a label. */}
                    {g.state === "in" ? (
                      <span className="freshness justify-end" data-state="live">
                        <span className="freshness-dot" />
                        <span>{g.status}</span>
                      </span>
                    ) : (
                      <p className="text-xs text-muted-foreground">{g.status}</p>
                    )}
                  </>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
