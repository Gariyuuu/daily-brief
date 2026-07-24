import { Section, WeatherData } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function WeatherCard({ weather }: { weather: Section<WeatherData> }) {
  return (
    <SectionCard title="Weather" icon="🌤️">
      {!weather.ok ? (
        <Unavailable section={weather} />
      ) : (
        <div>
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none">{weather.current.emoji}</span>
            <div>
              <p className="text-3xl font-bold">{weather.current.tempF}°F</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                {weather.city} · Feels like {weather.current.feelsLikeF}°F ·{" "}
                {weather.current.description}
              </p>
              <p className="text-xs text-black/50 dark:text-white/50">
                Humidity {weather.current.humidity}% · Wind {weather.current.windMph} mph
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 text-center">
            {weather.daily.map((d) => (
              <div key={d.date} className="rounded-lg bg-black/5 dark:bg-white/5 p-2">
                <p className="text-xs text-black/50 dark:text-white/50">
                  {new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </p>
                <p className="text-xl">{d.emoji}</p>
                <p className="text-xs">
                  {d.highF}° / {d.lowF}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
