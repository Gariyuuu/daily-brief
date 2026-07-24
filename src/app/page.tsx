import { buildDigest, isStale } from "@/lib/aggregate";
import { getDigest, saveDigest } from "@/lib/store";
import { DigestView } from "@/components/DigestView";
import { RefreshButton } from "@/components/RefreshButton";
import { formatLocalTime, todayISO } from "@/lib/utils/dates";

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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Brief</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            {formatLocalTime(digest.generatedAt)}
          </p>
        </div>
        <RefreshButton />
      </div>
      <DigestView digest={digest} />
    </div>
  );
}
