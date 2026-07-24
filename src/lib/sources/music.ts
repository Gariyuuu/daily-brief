import { MusicData, Release, Section, fetchFailed, missingKey } from "@/lib/types";

// Spotify's client-credentials flow needs a free developer app
// (https://developer.spotify.com/dashboard -> Create app) but no user login,
// since "New Releases" is public catalog data.
async function getSpotifyToken(clientId: string, clientSecret: string): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Spotify auth returned ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

export async function getMusic(): Promise<Section<MusicData>> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return missingKey(
      "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET",
      "Free app at https://developer.spotify.com/dashboard (Client Credentials flow, no card needed)."
    );
  }

  try {
    const token = await getSpotifyToken(clientId, clientSecret);
    // Spotify retired the "browse/new-releases" endpoint for apps in
    // Development Mode (Nov 2024) — `tag:new` search returns albums released
    // in roughly the last two weeks and stays available on the free tier,
    // but that mode caps `limit` at 10 (the documented max of 50 doesn't
    // apply here and returns "Invalid limit").
    const res = await fetch(
      "https://api.spotify.com/v1/search?q=tag:new&type=album&market=US&limit=10",
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error(`Spotify search returned ${res.status}`);
    const json = await res.json();
    const items = json.albums?.items ?? [];

    const releases: Release[] = (items as Array<Record<string, unknown>>)
      .map((a) => ({
        title: String(a.name ?? ""),
        artists: ((a.artists as Array<Record<string, unknown>>) ?? [])
          .map((ar) => String(ar.name ?? ""))
          .join(", "),
        releaseDate: String(a.release_date ?? ""),
        image: ((a.images as Array<Record<string, unknown>>)?.[0]?.url as string) ?? null,
        url: String((a.external_urls as Record<string, unknown>)?.spotify ?? ""),
      }))
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

    return { ok: true, releases };
  } catch (err) {
    return fetchFailed(`Music fetch error: ${(err as Error).message}`);
  }
}
