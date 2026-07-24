import { ExtraData, Section, fetchFailed } from "@/lib/types";
import { todayISO } from "@/lib/utils/dates";

// Both sources are free and keyless: ZenQuotes for a daily quote, and
// Wikipedia's official "On this day" REST feed for historical events.
export async function getExtra(): Promise<Section<ExtraData>> {
  // getMonth()/getDate() would read the server's UTC clock — use the home
  // timezone's calendar date instead so "on this day" matches the reader's
  // actual day, not whatever day it already is in UTC.
  const [, mm, dd] = todayISO().split("-");

  let quote: ExtraData["quote"] = null;
  let onThisDay: ExtraData["onThisDay"] = [];

  try {
    const quoteRes = await fetch("https://zenquotes.io/api/today", { next: { revalidate: 0 } });
    if (quoteRes.ok) {
      const json = await quoteRes.json();
      const first = json?.[0];
      if (first) quote = { text: String(first.q ?? ""), author: String(first.a ?? "") };
    }
  } catch {
    // Non-fatal: the extras section can still show "on this day" alone.
  }

  try {
    const otdRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`,
      { headers: { "User-Agent": "daily-brief personal app" }, next: { revalidate: 0 } }
    );
    if (otdRes.ok) {
      const json = await otdRes.json();
      onThisDay = ((json.selected ?? []) as Array<Record<string, unknown>>)
        .slice(0, 5)
        .map((e) => ({
          text: String(e.text ?? ""),
          year: String(e.year ?? ""),
          thumbnail:
            ((e.pages as Array<Record<string, unknown>>)?.[0]?.thumbnail as Record<string, unknown>)
              ?.source as string | null ?? null,
        }));
    }
  } catch {
    // Non-fatal.
  }

  if (!quote && onThisDay.length === 0) {
    return fetchFailed("Both quote and on-this-day sources failed.");
  }

  return { ok: true, quote, onThisDay };
}
