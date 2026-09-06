import { buildDigest, isStale } from "@/lib/aggregate";
import { getDigest, saveDigest } from "@/lib/store";
import { DigestView } from "@/components/DigestView";
import { RefreshButton } from "@/components/RefreshButton";
import { formatLocalTime, todayISO } from "@/lib/utils/dates";
import { Freshness } from "@/components/numeric/Freshness";

export const dynamic = "force-dynamic";

export default async function Home() {
  const date = todayISO();
  let digest = await getDigest(date);
  if (!digest || isStale(digest)) {
    digest = await buildDigest(date);
    await saveDigest(digest);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Brief</h1>
          {/* Two readings of the same instant, on purpose: the absolute time
              is the record, the relative one answers "is this current?".
              A digest older than 15 minutes is rebuilt on the next load, so
              the freshness threshold matches isStale() rather than guessing. */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="num">{formatLocalTime(digest.generatedAt)}</span>
            <span aria-hidden="true">·</span>
            <Freshness at={digest.generatedAt} label="built" staleAfterMinutes={15} />
          </div>
        </div>
        <RefreshButton />
      </div>
      <DigestView digest={digest} />
    </div>
  );
}
