import { ReactNode } from "react";
import { KeyRound, TriangleAlert, type LucideIcon } from "lucide-react";
import { Section } from "@/lib/types";

/**
 * THE BRIEF TEMPLATE — panel chrome.
 *
 * daily-brief, market-brief and dramabrief are one template in three
 * verticals. This component, `FeedItem`, and the numerics family layer are the
 * shared parts; only the accent and the content differ between the three.
 * Changing the shape here means changing it in all three -- deliberately.
 *
 * Icons are Lucide, sized 16px in a tinted tile. They were emoji before, which
 * render at a different size and baseline on every platform, cannot inherit
 * colour, and get announced by screen readers as their unicode name.
 */
export function SectionCard({
  title,
  icon: Icon,
  meta,
  children,
}: {
  title: string;
  icon: LucideIcon;
  /** Freshness line, item count, or a filter -- the panel's right-hand slot. */
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground/[.06] text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" strokeWidth={2} />
          </span>
          <span className="truncate">{title}</span>
        </h2>
        {meta && <div className="shrink-0">{meta}</div>}
      </div>
      {children}
    </section>
  );
}

/**
 * A section with no data. Deliberately NOT an error state: "you have not
 * connected a key" and "the upstream request failed" are different facts, and
 * a brief that shows the same red warning for both teaches the reader to
 * ignore it. The `.no-data` treatment comes from the numerics layer so a dead
 * feed looks the same in all three briefs.
 */
export function Unavailable({ section }: { section: Section<unknown> }) {
  if (section.ok) return null;
  const missingKey = section.reason === "missing_key";
  const Icon = missingKey ? KeyRound : TriangleAlert;
  return (
    <div className="no-data py-8">
      <span
        className="flex size-9 items-center justify-center rounded-full bg-foreground/[.06]"
        aria-hidden="true"
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <p className="no-data-title">{missingKey ? "Not connected" : "Feed unavailable"}</p>
      <p className="no-data-body">{section.message}</p>
    </div>
  );
}
