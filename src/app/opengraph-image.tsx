import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b0c0f",
          padding: "80px",
          color: "#f5f4f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, letterSpacing: -1 }}>
          🗞️&nbsp;Daily Brief
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9a988f", maxWidth: 860, marginTop: 24 }}>
          Weather, news, sports, stocks, crypto, and tech — one briefing, refreshed every day.
        </div>
      </div>
    ),
    { ...size }
  );
}
