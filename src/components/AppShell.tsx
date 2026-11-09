"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAppState, useHydrated } from "@/lib/store";
import { BASE_PATH } from "@/lib/format";
import { PaymentModal, Toast, useT } from "./ui";
import type { Key } from "@/lib/i18n";

const ICONS: Record<string, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />,
  plane: <path d="M2.5 19h19M3.5 13.5l3 1 4-2.5-6-4.5 2-1 8 3 4-2a2 2 0 0 1 2 3.4L7 16.5l-3.5-3Z" />,
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7 4 3-1.5 4.5h-5L8 10l4-3Zm0-4v4m9 5-5-2m-1.5 4.5L17 19M9.5 14.5 7 19m1-9-5 2" />
    </>
  ),
  family: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 20a6 6 0 0 1 12 0m1.5-5.5A4.5 4.5 0 0 1 21 19" />,
  profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4" />,
  calc: <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 4h8M8 12h2m4 0h2m-8 4h2m4 0h2" />,
};

const SUPPORTER_TABS: { href: string; key: Key; icon: string }[] = [
  { href: "/", key: "home", icon: "home" },
  { href: "/voyager", key: "navTravel", icon: "plane" },
  { href: "/matchs", key: "navMatches", icon: "ball" },
  { href: "/famille", key: "navFamily", icon: "family" },
  { href: "/profil", key: "account", icon: "profile" },
];

const ADMIN_TABS: { href: string; key: Key; icon: string }[] = [
  { href: "/admin", key: "home", icon: "chart" },
  { href: "/admin/voyages", key: "navTravel", icon: "plane" },
  { href: "/admin/moderation", key: "moderation", icon: "shield" },
  { href: "/admin/simulateur", key: "simulator", icon: "calc" },
  { href: "/profil", key: "account", icon: "profile" },
];

function clean(pathname: string) {
  return pathname.replace(/\/$/, "") || "/";
}

export function AppShell({ children }: { children: ReactNode }) {
  const s = useAppState();
  const hydrated = useHydrated();
  const t = useT();
  const router = useRouter();
  const pathname = clean(usePathname());
  const isLogin = pathname === "/login";
  const role = s.session?.role;
  const isAdminPath = pathname.startsWith("/admin");
  const wrongSpace = (role === "admin" && !isAdminPath && pathname !== "/profil") || (role === "supporter" && isAdminPath);

  useEffect(() => {
    document.documentElement.lang = s.lang;
    document.documentElement.dir = s.lang === "ar" ? "rtl" : "ltr";
  }, [s.lang]);

  // Connexion obligatoire, et chaque espace reste dans ses propres onglets
  useEffect(() => {
    if (!hydrated) return;
    if (!s.session && !isLogin) router.replace("/login");
    else if (s.session && isLogin) router.replace(role === "admin" ? "/admin" : "/");
    else if (wrongSpace) router.replace(role === "admin" ? "/admin" : "/");
  }, [hydrated, s.session, role, isLogin, wrongSpace, router]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).catch(() => {});
    }
  }, []);

  if (isLogin) {
    return (
      <div className="min-h-dvh bg-sombre">
        {hydrated && !s.session ? children : null}
        <Toast />
      </div>
    );
  }

  const allowed = hydrated && !!s.session && !wrongSpace;
  const tabs = role === "admin" ? ADMIN_TABS : SUPPORTER_TABS;

  return (
    <div className="min-h-dvh bg-creme">
      <main className={`mx-auto w-full px-5 pb-32 pt-[calc(env(safe-area-inset-top)+12px)] ${role === "admin" ? "max-w-4xl" : "max-w-md"}`}>{allowed ? children : null}</main>

      {allowed && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sombre/[0.06] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <ul className="mx-auto flex max-w-md">
            {tabs.map((tab) => {
              const active = tab.href === "/" || tab.href === "/admin" ? pathname === tab.href : pathname.startsWith(tab.href) || (tab.href === "/matchs" && pathname === "/mur");
              return (
                <li key={tab.href} className="flex-1">
                  <Link
                    href={tab.href}
                    className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition ${active ? "text-sang" : "text-sombre/40"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[tab.icon]}
                    </svg>
                    {t(tab.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      <PaymentModal />
      <Toast />
    </div>
  );
}
