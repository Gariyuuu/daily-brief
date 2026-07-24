import { Section, WeatherData, fetchFailed } from "@/lib/types";

// Open-Meteo is free and keyless, so weather works out of the box.
// Set BRIEF_CITY / BRIEF_LAT / BRIEF_LON env vars to point this at your city.
const DEFAULT_CITY = "New York";
const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.006;

// WMO weather codes -> human description + emoji.
const CODES: Record<number, { description: string; emoji: string }> = {
  0: { description: "Clear sky", emoji: "☀️" },
  1: { description: "Mostly clear", emoji: "🌤️" },
  2: { description: "Partly cloudy", emoji: "⛅" },
  3: { description: "Overcast", emoji: "☁️" },
  45: { description: "Fog", emoji: "🌫️" },
  48: { description: "Rime fog", emoji: "🌫️" },
  51: { description: "Light drizzle", emoji: "🌦️" },
  53: { description: "Drizzle", emoji: "🌦️" },
  55: { description: "Heavy drizzle", emoji: "🌧️" },
  56: { description: "Freezing drizzle", emoji: "🌧️" },
  57: { description: "Freezing drizzle", emoji: "🌧️" },
  61: { description: "Light rain", emoji: "🌧️" },
  63: { description: "Rain", emoji: "🌧️" },
  65: { description: "Heavy rain", emoji: "🌧️" },
  66: { description: "Freezing rain", emoji: "🌧️" },
  67: { description: "Freezing rain", emoji: "🌧️" },
  71: { description: "Light snow", emoji: "🌨️" },
  73: { description: "Snow", emoji: "❄️" },
  75: { description: "Heavy snow", emoji: "❄️" },
  77: { description: "Snow grains", emoji: "❄️" },
  80: { description: "Light showers", emoji: "🌦️" },
  81: { description: "Showers", emoji: "🌧️" },
  82: { description: "Violent showers", emoji: "⛈️" },
  85: { description: "Snow showers", emoji: "🌨️" },
  86: { description: "Heavy snow showers", emoji: "🌨️" },
  95: { description: "Thunderstorm", emoji: "⛈️" },
  96: { description: "Thunderstorm w/ hail", emoji: "⛈️" },
  99: { description: "Severe thunderstorm", emoji: "⛈️" },
};

function describe(code: number) {
  return CODES[code] ?? { description: "Unknown", emoji: "🌡️" };
}

export async function getWeather(): Promise<Section<WeatherData>> {
  const city = process.env.BRIEF_CITY || DEFAULT_CITY;
  const lat = Number(process.env.BRIEF_LAT) || DEFAULT_LAT;
  const lon = Number(process.env.BRIEF_LON) || DEFAULT_LON;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=5`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return fetchFailed(`Open-Meteo returned ${res.status}`);
    const json = await res.json();

    const current = json.current;
    const currentInfo = describe(current.weather_code);

    const daily = (json.daily.time as string[]).map((date: string, i: number) => {
      const info = describe(json.daily.weather_code[i]);
      return {
        date,
        highF: Math.round(json.daily.temperature_2m_max[i]),
        lowF: Math.round(json.daily.temperature_2m_min[i]),
        precipProbability: json.daily.precipitation_probability_max[i] ?? 0,
        code: json.daily.weather_code[i],
        description: info.description,
        emoji: info.emoji,
      };
    });

    return {
      ok: true,
      city,
      current: {
        tempF: Math.round(current.temperature_2m),
        feelsLikeF: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windMph: Math.round(current.wind_speed_10m),
        code: current.weather_code,
        description: currentInfo.description,
        emoji: currentInfo.emoji,
      },
      daily,
    };
  } catch (err) {
    return fetchFailed(`Weather fetch error: ${(err as Error).message}`);
  }
}
