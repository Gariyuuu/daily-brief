import { NextRequest, NextResponse } from "next/server";
import { buildDigest } from "@/lib/aggregate";
import { saveDigest } from "@/lib/store";

// Triggered daily by Vercel Cron (see vercel.json). Vercel automatically
// sends "Authorization: Bearer $CRON_SECRET" on cron-triggered requests
// once CRON_SECRET is set as a project env var, so this checks it matches.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const digest = await buildDigest();
  await saveDigest(digest);
  return NextResponse.json({ ok: true, date: digest.date });
}
