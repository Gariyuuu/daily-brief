import { ImageResponse } from "next/og";
import { getDigest, listDates } from "@/lib/store";
import type { Digest } from "@/lib/types";

const SECTION_KEYS: (keyof Pick<
  Digest,
  "weather" | "news" | "sports" | "stocks" | "music" | "crypto" | "tech" | "extra"
>)[] = ["weather", "news", "sports", "stocks", "music", "crypto", "tech", "extra"];

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Without this, Next statically optimizes this dynamic-segment image route to a
// single paramless fallback at build time and every real date 404s (confirmed
// bug, see vantage-chess this session). listDates() only covers what's archived
// as of build time; dynamicParams defaults to true, so a date archived later by
// the daily cron (before the next redeploy) should still render on demand — see
// TASKS.md for a note to verify this against a real post-deploy cron-added date.
export async function generateStaticParams() {
  const dates = await listDates();
  return dates.map((date) => ({ date }));
}

const SECTION_LABELS: Record<string, string> = {
  weather: "Weather",
  news: "News",
  sports: "Sports",
  stocks: "Stocks",
  music: "Music",
  crypto: "Crypto",
  tech: "Tech",
  extra: "Extra",
};

export default async function OpengraphImage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const digest = await getDigest(date);

  const liveSections = digest
    ? SECTION_KEYS.filter((key) => digest[key].ok).map((key) => SECTION_LABELS[key])
    : [];

  const formatted = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b0c0f",
          padding: "80px",
          color: "#f5f4f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#9a988f" }}>🗞️ Daily Brief — Archive</div>
        <div style={{ display: "flex", fontSize: 54, fontWeight: 700, marginTop: 16, letterSpacing: -1 }}>
          {formatted}
        </div>
        {liveSections.length > 0 && (
          <div style={{ display: "flex", fontSize: 26, color: "#9a988f", marginTop: 28 }}>
            {liveSections.join(" · ")}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
