import { ImageResponse } from "next/og";

// Icône générée au build : écusson sang et or (bandes verticales) avec « EST »
export function renderIcon(size: number, maskable = false) {
  const pad = maskable ? Math.round(size * 0.12) : 0;
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", background: "#1C1414", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: size - pad * 2,
            height: size - pad * 2,
            display: "flex",
            borderRadius: maskable ? 0 : size * 0.22,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ flex: 1, background: "#B5121B" }} />
          <div style={{ flex: 1, background: "#F2B705" }} />
          <div style={{ flex: 1, background: "#B5121B" }} />
          <div style={{ flex: 1, background: "#F2B705" }} />
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#FBF6EC", fontSize: size * 0.3, fontWeight: 900, letterSpacing: -size * 0.01,
              textShadow: `0 ${size * 0.01}px ${size * 0.03}px rgba(0,0,0,0.6)`,
            }}
          >
            EST
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
