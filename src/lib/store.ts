import { Redis } from "@upstash/redis";
import { Digest } from "@/lib/types";

// Persists each day's digest so the archive survives across deploys and
// serverless cold starts. Requires a free Upstash Redis database
// (https://console.upstash.com -> Create database -> REST API section).
// Without those env vars set, we fall back to an in-memory store so the
// app still runs locally, but the archive won't persist between restarts
// or across separate serverless invocations in production.
const DATES_KEY = "daily-brief:dates";

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

// In-memory fallback (module-level, survives only within one running process).
const memoryStore = new Map<string, Digest>();
const memoryDates = new Set<string>();

export const archiveIsPersistent = hasUpstash;

export async function saveDigest(digest: Digest): Promise<void> {
  if (redis) {
    await redis.set(`daily-brief:digest:${digest.date}`, digest);
    await redis.sadd(DATES_KEY, digest.date);
  } else {
    memoryStore.set(digest.date, digest);
    memoryDates.add(digest.date);
  }
}

export async function getDigest(date: string): Promise<Digest | null> {
  if (redis) {
    const result = await redis.get<Digest>(`daily-brief:digest:${date}`);
    return result ?? null;
  }
  return memoryStore.get(date) ?? null;
}

export async function listDates(): Promise<string[]> {
  let dates: string[];
  if (redis) {
    dates = await redis.smembers(DATES_KEY);
  } else {
    dates = Array.from(memoryDates);
  }
  return dates.sort().reverse();
}
