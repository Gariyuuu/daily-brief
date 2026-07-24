import { notFound } from "next/navigation";
import Link from "next/link";
import { getDigest } from "@/lib/store";
import { DigestView } from "@/components/DigestView";
import { formatLocalTime } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export default async function ArchiveDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const digest = await getDigest(date);

  if (!digest) notFound();

  return (
    <div>
      <div className="mb-5">
        <Link href="/archive" className="text-sm hover:underline">
          ← Back to archive
        </Link>
        <h1 className="text-2xl font-bold mt-1">
          {new Date(date + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Generated {formatLocalTime(digest.generatedAt)}
        </p>
      </div>
      <DigestView digest={digest} />
    </div>
  );
}
