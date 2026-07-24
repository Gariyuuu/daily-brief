// Server components render on Vercel's servers (UTC), so a plain
// toLocaleString() shows UTC time regardless of where the reader actually
// is. Format against the configured home timezone instead so "generated at"
// matches the user's actual local clock.
const HOME_TZ = process.env.BRIEF_TIMEZONE || "America/New_York";

export function formatLocalTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: HOME_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// "Today" as a YYYY-MM-DD in the home timezone, not the server's UTC clock —
// otherwise the digest date flips over hours early/late relative to the
// reader's actual evening/midnight.
export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: HOME_TZ });
}

// TheSportsDB (and most sports schedule APIs) bucket games by the UTC
// calendar day of kickoff, not the home timezone's day — an evening game in
// the US already falls on "tomorrow" in UTC. Given a timestamp with no
// timezone suffix (which TheSportsDB returns, but represents UTC), this
// resolves which home-timezone calendar day it actually falls on.
export function homeLocalDate(utcTimestamp: string): string {
  const iso = utcTimestamp.endsWith("Z") ? utcTimestamp : `${utcTimestamp}Z`;
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: HOME_TZ });
}

// UTC calendar date offset by `days` — used to query UTC-bucketed APIs for
// both the UTC "today" and "tomorrow" so a home-timezone evening game
// (UTC-tomorrow) isn't missed.
export function utcDateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
