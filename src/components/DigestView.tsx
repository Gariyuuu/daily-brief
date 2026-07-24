import { Digest } from "@/lib/types";
import { WeatherCard } from "./WeatherCard";
import { NewsList } from "./NewsList";
import { SportsScores } from "./SportsScores";
import { StockMovers } from "./StockMovers";
import { MusicReleases } from "./MusicReleases";
import { CryptoTicker } from "./CryptoTicker";
import { TechNews } from "./TechNews";
import { ExtraCard } from "./ExtraCard";

export function DigestView({ digest }: { digest: Digest }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <WeatherCard weather={digest.weather} />
      </div>
      <div className="md:col-span-2">
        <StockMovers stocks={digest.stocks} />
      </div>
      <NewsList news={digest.news} />
      <SportsScores sports={digest.sports} />
      <MusicReleases music={digest.music} />
      <CryptoTicker crypto={digest.crypto} />
      <div className="md:col-span-2">
        <TechNews tech={digest.tech} />
      </div>
      <div className="md:col-span-2">
        <ExtraCard extra={digest.extra} />
      </div>
    </div>
  );
}
