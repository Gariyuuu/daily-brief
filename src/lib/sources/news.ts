import { Article, NewsData, Section, fetchFailed, missingKey } from "@/lib/types";

// GNews.io free tier (https://gnews.io/register, no credit card) allows
// production use, unlike NewsAPI's dev-only free plan, and returns article
// images — which is why it was picked over the alternatives.
const BASE = "https://gnews.io/api/v4";

function mapArticles(items: unknown[]): Article[] {
  return (items as Array<Record<string, unknown>>).map((a) => ({
    title: String(a.title ?? ""),
    description: (a.description as string) ?? null,
    url: String(a.url ?? ""),
    image: (a.image as string) ?? null,
    source: ((a.source as Record<string, unknown>)?.name as string) ?? "Unknown",
    publishedAt: String(a.publishedAt ?? ""),
  }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHeadlines(params: string, key: string): Promise<Article[]> {
  const res = await fetch(`${BASE}/top-headlines?${params}&apikey=${key}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`GNews returned ${res.status}`);
  const json = await res.json();
  return mapArticles(json.articles ?? []);
}

export async function getNews(): Promise<Section<NewsData>> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    return missingKey(
      "GNEWS_API_KEY",
      "Sign up free at https://gnews.io/register (no card needed, 100 req/day)."
    );
  }

  try {
    // GNews's free tier rate-limits requests to roughly 1/sec, so these are
    // fetched one at a time with a spacer delay rather than in parallel.
    const topUS = await fetchHeadlines("category=general&country=us&lang=en&max=8", key);
    await sleep(1100);
    const world = await fetchHeadlines("category=world&lang=en&max=8", key);
    await sleep(1100);
    const politics = await fetchHeadlines("category=nation&country=us&lang=en&max=8", key);
    return { ok: true, topUS, world, politics };
  } catch (err) {
    return fetchFailed(`News fetch error: ${(err as Error).message}`);
  }
}
