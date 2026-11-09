import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Icône générée au build : logo officiel de l'EST sur fond sombre
const logo = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/est-logo.png")).toString("base64")}`;

export function renderIcon(size: number, maskable = false) {
  const h = Math.round(size * (maskable ? 0.66 : 0.84));
  const w = Math.round(h * (420 / 512));
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#1C1414" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={w} height={h} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
}
