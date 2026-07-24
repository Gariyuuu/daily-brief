import { Section, TechData, TechStory, fetchFailed } from "@/lib/types";

// Hacker News' Firebase-backed API is free and keyless.
const BASE = "https://hacker-news.firebaseio.com/v0";

export async function getTech(): Promise<Section<TechData>> {
  try {
    const idsRes = await fetch(`${BASE}/topstories.json`, { next: { revalidate: 0 } });
    if (!idsRes.ok) throw new Error(`HN topstories returned ${idsRes.status}`);
    const ids = (await idsRes.json()) as number[];

    const items = await Promise.all(
      ids.slice(0, 20).map(async (id) => {
        const res = await fetch(`${BASE}/item/${id}.json`, { next: { revalidate: 0 } });
        if (!res.ok) return null;
        return (await res.json()) as Record<string, unknown>;
      })
    );

    const stories: TechStory[] = items
      .filter((i): i is Record<string, unknown> => i !== null)
      .map((i) => ({
        title: String(i.title ?? ""),
        url: String(i.url ?? `https://news.ycombinator.com/item?id=${i.id}`),
        score: Number(i.score ?? 0),
        comments: Number(i.descendants ?? 0),
        by: String(i.by ?? "unknown"),
      }));

    return { ok: true, stories };
  } catch (err) {
    return fetchFailed(`Tech news fetch error: ${(err as Error).message}`);
  }
}
