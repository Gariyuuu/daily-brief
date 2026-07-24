// Shared shapes for every section of the daily digest.
// Each section is either the real data, or a small "not ready" object
// explaining why (missing API key vs. upstream failure) so the UI can
// degrade gracefully instead of crashing when one source is unavailable.

export type Unavailable = {
  ok: false;
  reason: "missing_key" | "fetch_failed";
  message: string;
};

export type Ok<T> = { ok: true } & T;
export type Section<T> = Ok<T> | Unavailable;

export interface WeatherData {
  city: string;
  current: {
    tempF: number;
    feelsLikeF: number;
    humidity: number;
    windMph: number;
    code: number;
    description: string;
    emoji: string;
  };
  daily: Array<{
    date: string;
    highF: number;
    lowF: number;
    precipProbability: number;
    code: number;
    description: string;
    emoji: string;
  }>;
}

export interface Article {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

export interface NewsData {
  topUS: Article[];
  world: Article[];
  politics: Article[];
}

export interface GameScore {
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  status: string;
  state: "pre" | "in" | "post";
  date: string;
  link: string;
}

export interface SportsData {
  games: GameScore[];
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface Mover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface StocksData {
  indices: Quote[];
  gainers: Mover[];
  losers: Mover[];
  actives: Mover[];
  aiWatchlist: Mover[];
}

export interface Release {
  title: string;
  artists: string;
  releaseDate: string;
  image: string | null;
  url: string;
}

export interface MusicData {
  releases: Release[];
}

export interface CoinQuote {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent24h: number;
  image: string | null;
}

export interface CryptoData {
  coins: CoinQuote[];
  trending: string[];
}

export interface TechStory {
  title: string;
  url: string;
  score: number;
  comments: number;
  by: string;
}

export interface TechData {
  stories: TechStory[];
}

export interface ExtraData {
  quote: { text: string; author: string } | null;
  onThisDay: Array<{ text: string; year: string; thumbnail: string | null }>;
}

export interface Digest {
  date: string; // YYYY-MM-DD
  generatedAt: string; // ISO timestamp
  weather: Section<WeatherData>;
  news: Section<NewsData>;
  sports: Section<SportsData>;
  stocks: Section<StocksData>;
  music: Section<MusicData>;
  crypto: Section<CryptoData>;
  tech: Section<TechData>;
  extra: Section<ExtraData>;
}

export function missingKey(envVar: string, signupHint: string): Unavailable {
  return {
    ok: false,
    reason: "missing_key",
    message: `Set ${envVar} to enable this section. ${signupHint}`,
  };
}

export function fetchFailed(detail: string): Unavailable {
  return { ok: false, reason: "fetch_failed", message: detail };
}
