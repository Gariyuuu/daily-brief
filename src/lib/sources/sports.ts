import { GameScore, Section, SportsData, fetchFailed } from "@/lib/types";
import { homeLocalDate, todayISO } from "@/lib/utils/dates";

// ESPN's public scoreboard API (unofficial, no key needed) — it's the exact
// same data espn.com renders from, which is why using it here keeps this in
// sync with what you'd see visiting ESPN directly, live status included.
// MLB/WNBA/MLS are in-season through the US summer; the rest naturally
// contribute zero games whenever their season is off, since every event is
// filtered down to today below.
const LEAGUES: Array<{ path: string; name: string }> = [
  { path: "baseball/mlb", name: "MLB" },
  { path: "basketball/wnba", name: "WNBA" },
  { path: "soccer/usa.1", name: "MLS" },
  { path: "basketball/nba", name: "NBA" },
  { path: "football/nfl", name: "NFL" },
  { path: "hockey/nhl", name: "NHL" },
  { path: "soccer/eng.1", name: "English Premier League" },
  { path: "soccer/uefa.champions", name: "UEFA Champions League" },
];

const MAX_GAMES = 40;

async function fetchLeagueEvents(path: string): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.events ?? []) as Array<Record<string, unknown>>;
}

export async function getSports(): Promise<Section<SportsData>> {
  const home = todayISO();

  try {
    const results = await Promise.allSettled(
      LEAGUES.map(async ({ path, name }) => ({ name, events: await fetchLeagueEvents(path) }))
    );

    const games: GameScore[] = [];
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const { name, events } = r.value;

      for (const e of events) {
        const date = e.date as string | undefined;
        if (!date || homeLocalDate(date) !== home) continue;

        const comp = (e.competitions as Array<Record<string, unknown>> | undefined)?.[0];
        if (!comp) continue;
        const competitors = (comp.competitors as Array<Record<string, unknown>>) ?? [];
        const home_ = competitors.find((c) => c.homeAway === "home");
        const away = competitors.find((c) => c.homeAway === "away");
        if (!home_ || !away) continue;

        const statusType =
          ((comp.status as Record<string, unknown>)?.type as Record<string, unknown>) ?? {};
        const state = (statusType.state as "pre" | "in" | "post") ?? "pre";

        // Finished/scheduled events link via "summary"; in-progress ones use
        // "gamecast" instead — either points at the same real game page.
        const links = (e.links as Array<Record<string, unknown>>) ?? [];
        const summaryLink = links.find((l) => {
          const rel = (l.rel as string[]) ?? [];
          return rel.includes("summary") || rel.includes("gamecast");
        });

        games.push({
          league: name,
          homeTeam: String(((home_.team as Record<string, unknown>)?.shortDisplayName) ?? "?"),
          awayTeam: String(((away.team as Record<string, unknown>)?.shortDisplayName) ?? "?"),
          homeScore: state === "pre" ? null : (home_.score as string) ?? null,
          awayScore: state === "pre" ? null : (away.score as string) ?? null,
          // Which of shortDetail/detail actually holds the useful scheduled
          // time is inconsistent between leagues (MLB puts it in shortDetail
          // and leaves detail as "Scheduled"; MLS does the opposite) — so
          // prefer whichever one isn't just the literal word "Scheduled".
          status: String(
            state !== "pre"
              ? statusType.shortDetail ?? statusType.description ?? "Final"
              : statusType.shortDetail !== "Scheduled"
                ? statusType.shortDetail ?? "Scheduled"
                : statusType.detail ?? "Scheduled"
          ),
          state,
          date: home,
          link: String(summaryLink?.href ?? "https://www.espn.com"),
        });
      }
    }

    // Live games first, then today's upcoming, then today's finals — so
    // whatever's actually in progress right now surfaces at the top.
    const priority: Record<string, number> = { in: 0, pre: 1, post: 2 };
    games.sort((a, b) => (priority[a.state] ?? 1) - (priority[b.state] ?? 1));

    return { ok: true, games: games.slice(0, MAX_GAMES) };
  } catch (err) {
    return fetchFailed(`Sports fetch error: ${(err as Error).message}`);
  }
}
