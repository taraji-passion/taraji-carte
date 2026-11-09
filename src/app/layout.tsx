import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Carte Supporter Taraji — démo",
  description: "Démo de la Carte Supporter de l'Espérance Sportive de Tunis : Pass Voyageur, billets virtuels, tirelires famille. Données fictives.",
  appleWebApp: { capable: true, title: "Taraji", statusBarStyle: "black-translucent" },
  icons: {
    icon: `${base}/icon-192.png`,
    apple: `${base}/apple-icon.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1414",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
