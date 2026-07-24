import { NextRequest, NextResponse } from "next/server";
import { buildDigest, isStale } from "@/lib/aggregate";
import { getDigest, saveDigest } from "@/lib/store";
import { todayISO } from "@/lib/utils/dates";

// GET /api/digest?date=YYYY-MM-DD
// Returns the stored digest for that date. If it's today's date and
// nothing has been generated yet (or the stored snapshot has gone stale),
// builds and stores a fresh one on the fly.
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? todayISO();

  let digest = await getDigest(date);
  if (date === todayISO() && (!digest || isStale(digest))) {
    digest = await buildDigest(date);
    await saveDigest(digest);
  }

  if (!digest) {
    return NextResponse.json({ error: "No digest found for that date" }, { status: 404 });
  }
  return NextResponse.json(digest);
}

// POST /api/digest — the "Refresh Now" button. Always rebuilds today
// from live sources and overwrites today's stored snapshot.
export async function POST() {
  const digest = await buildDigest(todayISO());
  await saveDigest(digest);
  return NextResponse.json(digest);
}
