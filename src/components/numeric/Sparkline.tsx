/**
 * A sparkline, not a chart: no axes, no legend, no tooltip. Stroke spec lives
 * in the numerics layer (`.spark-line`) so every sparkline across the family
 * is the same weight and the same direction colours.
 */
export function Sparkline({
  values,
  width = 96,
  height = 24,
  label,
  invert = false,
  showDot = true,
  className = "",
}: {
  values: number[];
  width?: number;
  height?: number;
  label: string;
  invert?: boolean;
  showDot?: boolean;
  className?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series has zero range; dividing by it puts every point at NaN.
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pad = 1.5; // half the stroke, so the line is not clipped at the edges
  const usable = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = pad + usable - ((v - min) / range) * usable;
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  const net = values[values.length - 1] - values[0];
  const dir = net === 0 ? "flat" : (invert ? net < 0 : net > 0) ? "up" : "down";
  const [lastX, lastY] = pts[pts.length - 1];

  return (
    <svg
      className={`spark ${className}`.trim()}
      data-dir={dir}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <path className="spark-area" d={area} />
      <path className="spark-line" d={line} />
      {showDot && <circle className="spark-dot" cx={lastX} cy={lastY} r={2.5} />}
    </svg>
  );
}
