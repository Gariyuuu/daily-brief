import { ReactNode } from "react";

/**
 * THE BRIEF TEMPLATE — one entry in a feed.
 *
 * Shared by daily-brief (articles), market-brief (stories) and dramabrief
 * (episodes/news). The skeleton is fixed: optional thumbnail, title, a meta
 * row of source and time, and a right-hand slot for a delta or badge.
 *
 * The whole row is the link target via `.feed-card-link`'s ::after overlay,
 * so the anchor wraps only the title -- which keeps the accessible name short
 * and lets a badge or delta inside the row stay separately selectable.
 */
export function FeedItem({
  href,
  title,
  thumbnail,
  source,
  time,
  trailing,
}: {
  href: string;
  title: string;
  thumbnail?: string | null;
  source?: string;
  time?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <article className="feed-card group flex-row items-start gap-3 border-transparent bg-transparent p-2 hover:bg-foreground/[.03]">
      {thumbnail !== undefined &&
        (thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-14 w-20 shrink-0 rounded-lg bg-foreground/5 object-cover"
          />
        ) : (
          // A placeholder of the same size, so a feed with mixed thumbnails
          // keeps one left edge instead of a ragged one.
          <div className="h-14 w-20 shrink-0 rounded-lg bg-foreground/5" aria-hidden="true" />
        ))}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="feed-card-title text-sm">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="feed-card-link decoration-from-font underline-offset-2 group-hover:underline"
          >
            {title}
          </a>
        </h3>
        {(source || time) && (
          <div className="feed-card-meta">
            {source && <span className="truncate">{source}</span>}
            {source && time && <span aria-hidden="true">·</span>}
            {time}
          </div>
        )}
      </div>

      {trailing && <div className="shrink-0 self-center">{trailing}</div>}
    </article>
  );
}
