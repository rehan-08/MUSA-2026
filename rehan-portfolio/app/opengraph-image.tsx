import { ImageResponse } from "next/og";

export const alt = "Rehan Mhate — AI, Data & Software Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#080808",
          color: "#F5F5F5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#5CFFA0" }}>REHAN MHATE</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 120, fontWeight: 700, lineHeight: 0.95, letterSpacing: -4 }}>
          <span>BUILDING</span>
          <span>INTELLIGENT</span>
          <span>
            SYSTEMS<span style={{ color: "#5CFFA0" }}>.</span>
          </span>
        </div>
        <div style={{ fontSize: 26, color: "#A1A1A1" }}>AI/ML · Data · Full-Stack · Geospatial · IoT — Mumbai, India</div>
      </div>
    ),
    size,
  );
}
