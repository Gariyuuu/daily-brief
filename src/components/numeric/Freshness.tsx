"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function relative(from: Date, now: number) {
  const diff = Math.max(0, now - from.getTime());
  if (diff < MINUTE) return "just now";
  const mins = Math.round(diff / MINUTE);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / MINUTE);

export type FreshnessState = "live" | "stale" | "offline" | "loading";

/**
 * "Updated 4 min ago" with a state dot.
 *
 * The timestamp is the point: a green dot alone claims a feed is healthy
 * without saying how recently it proved it. The server has no "now", so the
 * relative string is client-only -- useSyncExternalStore's server snapshot is
 * null and the absolute date renders until mount.
 *
 * daily-brief rebuilds a digest when it is more than 15 minutes old, so the
 * default stale threshold matches isStale() rather than being a separate
 * opinion about freshness.
 */
export function Freshness({
  at,
  staleAfterMinutes = 15,
  state,
  label = "Updated",
  className = "",
}: {
  at: Date | string | number | null;
  staleAfterMinutes?: number;
  state?: FreshnessState;
  label?: string;
  className?: string;
}) {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  const now = minute == null ? null : minute * MINUTE;
  const date = at == null ? null : at instanceof Date ? at : new Date(at);

  if (!date || Number.isNaN(date.getTime())) {
    return (
      <span className={`freshness ${className}`.trim()} data-state={state ?? "offline"}>
        <span className="freshness-dot" />
        <span>No data yet</span>
      </span>
    );
  }

  const ageMin = now == null ? 0 : Math.max(0, now - date.getTime()) / MINUTE;
  const derived: FreshnessState =
    ageMin > staleAfterMinutes * 4 ? "offline" : ageMin > staleAfterMinutes ? "stale" : "live";
  const resolved = state ?? derived;

  return (
    <span className={`freshness ${className}`.trim()} data-state={resolved}>
      <span className="freshness-dot" />
      <span>
        {label}{" "}
        <time dateTime={date.toISOString()} title={date.toLocaleString()} suppressHydrationWarning>
          {now == null ? date.toLocaleDateString() : relative(date, now)}
        </time>
      </span>
    </span>
  );
}
