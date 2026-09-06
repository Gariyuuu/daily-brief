import { CloudSun, Droplets, Wind } from "lucide-react";
import { Section, WeatherData } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";
import { WeatherIcon } from "./WeatherIcon";

export function WeatherCard({ weather }: { weather: Section<WeatherData> }) {
  return (
    <SectionCard title="Weather" icon={CloudSun}>
      {!weather.ok ? (
        <Unavailable section={weather} />
      ) : (
        <div>
          <div className="flex items-center gap-4">
            <WeatherIcon
              code={weather.current.code}
              className="size-12 shrink-0 text-muted-foreground"
              label={weather.current.description}
            />
            <div className="min-w-0">
              <p className="num-display text-3xl">{weather.current.tempF}°F</p>
              <p className="text-sm">
                {weather.city} · Feels like <span className="num">{weather.current.feelsLikeF}°F</span> ·{" "}
                {weather.current.description}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Droplets className="size-3.5" aria-hidden="true" />
                  <span className="num">{weather.current.humidity}%</span>
                  <span className="sr-only">humidity</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Wind className="size-3.5" aria-hidden="true" />
                  <span className="num">{weather.current.windMph} mph</span>
                  <span className="sr-only">wind</span>
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 text-center">
            {weather.daily.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1 rounded-lg bg-foreground/[.04] p-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </p>
                <WeatherIcon code={d.code} className="size-5 text-muted-foreground" />
                <p className="num text-xs">
                  <span className="font-medium">{d.highF}°</span>
                  <span className="text-muted-foreground"> / {d.lowF}°</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
