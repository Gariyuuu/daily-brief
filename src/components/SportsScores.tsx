import { Section, SportsData } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function SportsScores({ sports }: { sports: Section<SportsData> }) {
  return (
    <SectionCard title="Sports" icon="🏆">
      {!sports.ok ? (
        <Unavailable section={sports} />
      ) : sports.games.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">No games found for today.</p>
      ) : (
        <div className="space-y-2">
          {sports.games.map((g, i) => (
            <a
              key={`${g.league}-${i}`}
              href={g.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm rounded-lg bg-black/5 dark:bg-white/5 px-3 py-2 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <div>
                <p className="text-xs text-black/50 dark:text-white/50">{g.league}</p>
                <p className="font-medium">
                  {g.awayTeam} @ {g.homeTeam}
                </p>
              </div>
              <div className="text-right">
                {g.state === "pre" ? (
                  <p className="text-xs text-black/50 dark:text-white/50">{g.status}</p>
                ) : (
                  <>
                    <p className="font-semibold">
                      {g.awayScore ?? "-"} : {g.homeScore ?? "-"}
                    </p>
                    <p
                      className={
                        g.state === "in"
                          ? "text-xs font-medium text-red-600 dark:text-red-400"
                          : "text-xs text-black/50 dark:text-white/50"
                      }
                    >
                      {g.state === "in" ? `🔴 ${g.status}` : g.status}
                    </p>
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
