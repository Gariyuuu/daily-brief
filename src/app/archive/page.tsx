import Link from "next/link";
import { listDates, archiveIsPersistent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const dates = await listDates();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Archive</h1>
      {!archiveIsPersistent && (
        <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
          ⚙️ Set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN to persist the archive across
          deploys — right now it only lives in memory for this running process.
        </p>
      )}
      {dates.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">
          No past days yet — check back tomorrow, or hit Refresh on today&apos;s brief.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 dark:divide-white/10 rounded-2xl border border-input overflow-hidden">
          {dates.map((date) => (
            <li key={date}>
              <Link
                href={`/archive/${date}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
              >
                <span className="font-medium">
                  {new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-black/40 dark:text-white/40">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
