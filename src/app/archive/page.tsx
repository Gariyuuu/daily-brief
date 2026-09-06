import Link from "next/link";
import { ArrowRight, CalendarClock, Database } from "lucide-react";
import { listDates, archiveIsPersistent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const dates = await listDates();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Archive</h1>
      {!archiveIsPersistent && (
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm text-[var(--num-warn)]">
          <Database className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN to persist the archive across
            deploys — right now it only lives in memory for this running process.
          </span>
        </p>
      )}
      {dates.length === 0 ? (
        <div className="no-data">
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground/[.06]" aria-hidden="true">
            <CalendarClock className="size-4" />
          </span>
          <p className="no-data-title">Nothing archived yet</p>
          <p className="no-data-body">
            A brief is filed once per day. Check back tomorrow, or hit Refresh on today&apos;s brief
            to build the first one.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {dates.map((date) => (
            <li key={date}>
              <Link
                href={`/archive/${date}`}
                className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-foreground/[.04]"
              >
                <span className="font-medium">
                  {new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
