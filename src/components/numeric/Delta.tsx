export type DeltaDirection = "up" | "down" | "flat";

export function directionOf(value: number, invert = false): DeltaDirection {
  if (value === 0 || Number.isNaN(value)) return "flat";
  const up = value > 0;
  return (invert ? !up : up) ? "up" : "down";
}

/**
 * A signed change. Colour is never the only cue -- the `.delta` class in the
 * numerics layer emits ▲/▼/– through ::before, using the CSS alt-text form so
 * assistive tech reads the number and its label rather than the glyph.
 */
export function Delta({
  value,
  format,
  invert = false,
  cue,
  chip = false,
  srLabel,
  className = "",
}: {
  value: number;
  format?: (v: number) => string;
  invert?: boolean;
  cue?: "sign" | "none";
  chip?: boolean;
  srLabel?: string;
  className?: string;
}) {
  const dir = directionOf(value, invert);
  const shown = format ? format(value) : `${value > 0 ? "+" : ""}${value}`;
  const spoken = srLabel ?? `${dir === "up" ? "up" : dir === "down" ? "down" : "no change,"} ${shown}`;

  return (
    <span className={`delta ${chip ? "delta-chip" : ""} ${className}`.trim()} data-dir={dir} data-cue={cue}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{spoken}</span>
    </span>
  );
}
