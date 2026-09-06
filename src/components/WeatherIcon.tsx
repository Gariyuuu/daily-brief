import {
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  CloudSun,
  Snowflake,
  Sun,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

/**
 * WMO weather code -> Lucide icon.
 *
 * The source already returns an emoji per code and the app rendered it
 * directly. Emoji are the wrong tool for a condition glyph: they are a
 * different typeface on every platform, they cannot take the interface's
 * colour or stroke weight, they do not scale with the type ramp, and screen
 * readers announce them by their unicode name ("sun behind small cloud").
 *
 * The emoji field is left untouched in `src/lib/sources/weather.ts` -- it is
 * part of the stored digest shape and archived digests still carry it.
 * This maps the CODE, which is also stored, so historical digests render the
 * same way as today's.
 */
const ICONS: Record<number, LucideIcon> = {
  0: Sun,
  1: CloudSun,
  2: CloudSun,
  3: Cloudy,
  45: CloudFog,
  48: CloudFog,
  51: CloudDrizzle,
  53: CloudDrizzle,
  55: CloudRain,
  56: CloudRain,
  57: CloudRain,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  66: CloudRain,
  67: CloudRain,
  71: CloudSnow,
  73: Snowflake,
  75: Snowflake,
  77: Snowflake,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
};

export function WeatherIcon({
  code,
  className,
  label,
}: {
  code: number;
  className?: string;
  /** Omit for a decorative glyph that already sits next to its description. */
  label?: string;
}) {
  const Icon = ICONS[code] ?? Thermometer;
  return (
    <Icon
      className={className}
      strokeWidth={1.75}
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
