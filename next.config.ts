import type { NextConfig } from "next";

// Pour GitHub Pages (site de projet), lancer le build avec :
//   NEXT_PUBLIC_BASE_PATH=/taraji-carte npm run build
// Sans variable, l'app est servie à la racine (local, Netlify, Vercel, serve).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
