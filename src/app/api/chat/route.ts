import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDigest } from "@/lib/store";
import { Digest } from "@/lib/types";
import { todayISO } from "@/lib/utils/dates";

// Trim the digest down to a compact summary so it's cheap to include as
// chat context instead of dumping the full raw JSON on every turn.
function summarizeDigest(digest: Digest): string {
  const lines: string[] = [`Daily brief for ${digest.date} (generated ${digest.generatedAt}):`];

  if (digest.weather.ok) {
    lines.push(
      `Weather in ${digest.weather.city}: ${digest.weather.current.tempF}°F, ${digest.weather.current.description}.`
    );
  }
  if (digest.news.ok) {
    const headlines = [...digest.news.topUS, ...digest.news.politics, ...digest.news.world]
      .slice(0, 12)
      .map((a) => `- ${a.title} (${a.source})`);
    lines.push("Top news headlines:", ...headlines);
  }
  if (digest.sports.ok) {
    const games = digest.sports.games
      .slice(0, 10)
      .map((g) => `- [${g.league}] ${g.awayTeam} @ ${g.homeTeam}: ${g.awayScore ?? "-"}-${g.homeScore ?? "-"} (${g.status})`);
    lines.push("Sports:", ...games);
  }
  if (digest.stocks.ok) {
    const idx = digest.stocks.indices.map((q) => `${q.name} ${q.price} (${q.changePercent.toFixed(2)}%)`);
    const gainers = digest.stocks.gainers.slice(0, 5).map((m) => `${m.symbol} +${m.changePercent.toFixed(2)}%`);
    const losers = digest.stocks.losers.slice(0, 5).map((m) => `${m.symbol} ${m.changePercent.toFixed(2)}%`);
    lines.push(`Indices: ${idx.join(", ")}`, `Top gainers: ${gainers.join(", ")}`, `Top losers: ${losers.join(", ")}`);
  }
  if (digest.music.ok) {
    const releases = digest.music.releases.slice(0, 8).map((r) => `- ${r.title} by ${r.artists}`);
    lines.push("New music releases:", ...releases);
  }
  if (digest.crypto.ok) {
    const coins = digest.crypto.coins.map((c) => `${c.symbol} $${c.price} (${c.changePercent24h.toFixed(2)}%)`);
    lines.push(`Crypto: ${coins.join(", ")}`, `Trending: ${digest.crypto.trending.join(", ")}`);
  }
  if (digest.tech.ok) {
    const stories = digest.tech.stories.slice(0, 8).map((s) => `- ${s.title} (${s.score} pts)`);
    lines.push("Tech / Hacker News:", ...stories);
  }
  if (digest.extra.ok) {
    if (digest.extra.quote) lines.push(`Quote of the day: "${digest.extra.quote.text}" — ${digest.extra.quote.author}`);
    if (digest.extra.onThisDay.length) {
      lines.push("On this day:", ...digest.extra.onThisDay.map((e) => `- ${e.year}: ${e.text}`));
    }
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const messages: Array<{ role: "user" | "assistant"; content: string }> = body.messages ?? [];
  const date: string = body.date ?? todayISO();

  if (messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const digest = await getDigest(date);
  const context = digest
    ? summarizeDigest(digest)
    : `No digest has been generated yet for ${date}.`;

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system:
      "You are the assistant embedded in Daily Brief, a personal daily-information dashboard. " +
      "Answer the user's questions about today's (or the requested day's) news, weather, sports, " +
      "stocks, music, and crypto using the digest context below. You may also use your general " +
      "knowledge for anything the digest doesn't cover. Keep answers concise and conversational.\n\n" +
      context,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");

  return NextResponse.json({ reply: textBlock?.text ?? "" });
}
