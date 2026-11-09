"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { BASE_PATH } from "@/lib/format";
import { PaymentModal, Toast, useT } from "./ui";
import type { Key } from "@/lib/i18n";

const NAV: { href: string; key: Key; icon: ReactNode }[] = [
  {
    href: "/", key: "navCard",
    icon: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11ZM3 9h18M7 15h4" />,
  },
  {
    href: "/pass", key: "navPass",
    icon: <path d="M2.5 19h19M3.5 13.5l3 1 4-2.5-6-4.5 2-1 8 3 4-2a2 2 0 0 1 2 3.4L7 16.5l-3.5-3Z" />,
  },
  {
    href: "/billets", key: "navTickets",
    icon: <path d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7Zm10-1v12" />,
  },
  {
    href: "/famille", key: "navFamily",
    icon: <path d="M5 11a6 6 0 0 1 11.6-2.2H18a2 2 0 0 1 2 2v2a2 2 0 0 1-1.3 1.9L17 18h-2v-1.5h-4V18H9l-1-2.5A6 6 0 0 1 5 11Zm8-6V3M10 9h3" />,
  },
  {
    href: "/plus", key: "navMore",
    icon: <path d="M5 12h.01M12 12h.01M19 12h.01M5 12a1 1 0 1 0 0 .01M12 12a1 1 0 1 0 0 .01M19 12a1 1 0 1 0 0 .01" />,
  },
];

function isActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, "") || "/";
  if (href === "/") return p === "/";
  if (href === "/plus") return ["/plus", "/points", "/simulateur", "/admin"].some((x) => p.startsWith(x));
  return p.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const s = useAppState();
  const hydrated = useHydrated();
  const t = useT();
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = s.notifications.filter((n) => !n.read).length;
  const wide = pathname.startsWith("/admin") || pathname.startsWith("/simulateur");

  useEffect(() => {
    document.documentElement.lang = s.lang;
    document.documentElement.dir = s.lang === "ar" ? "rtl" : "ltr";
  }, [s.lang]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).catch(() => {});
    }
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <header className="sticky top-0 z-40 bg-sombre text-creme shadow-md">
        <div className={`mx-auto flex items-center gap-3 px-4 py-3 ${wide ? "max-w-5xl" : "max-w-md"}`}>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-sang from-50% to-or to-50% text-[11px] font-black text-white ring-2 ring-or">
              EST
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">{t("appName")}</span>
              <span className="block text-[11px] text-or">{t("demo")}</span>
            </span>
          </Link>
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={() => actions.setLang(s.lang === "fr" ? "ar" : "fr")}
              className="min-h-9 rounded-lg px-2 text-xs font-semibold text-or ring-1 ring-or/50"
              aria-label="Changer de langue"
            >
              {t("language")}
            </button>
            <button
              onClick={() => {
                setShowNotifs((v) => !v);
                if (!showNotifs) setTimeout(() => actions.markNotificationsRead(), 1500);
              }}
              className="relative grid h-9 w-9 place-items-center rounded-lg ring-1 ring-creme/20"
              aria-label={t("notifications")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Zm4 11a2 2 0 0 0 4 0" />
              </svg>
              {hydrated && unread > 0 && (
                <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-or px-1 text-[11px] font-bold text-sombre">
                  {unread}
                </span>
              )}
            </button>
          </div>
        </div>
        {showNotifs && (
          <div className="mx-auto max-w-md px-3 pb-3">
            <div className="max-h-80 overflow-y-auto rounded-xl bg-white p-2 text-sombre shadow-lg">
              <div className="flex items-center justify-between px-2 py-1">
                <strong className="text-sm">{t("notifications")}</strong>
                <button className="text-xs text-sang" onClick={() => setShowNotifs(false)}>Fermer</button>
              </div>
              {s.notifications.length === 0 && <p className="p-2 text-sm text-sombre/60">Aucune notification.</p>}
              {s.notifications.map((n) => (
                <div key={n.id} className={`rounded-lg px-2 py-2 text-sm ${n.read ? "" : "bg-or/10"}`}>
                  <div>{n.text}</div>
                  <div className="text-[11px] text-sombre/50">{n.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className={`mx-auto w-full flex-1 px-4 pb-28 pt-4 ${wide ? "max-w-5xl" : "max-w-md"}`}>
        {hydrated ? children : <div className="py-20 text-center text-sombre/50">Chargement…</div>}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? "text-sang" : "text-sombre/50"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  {t(item.key)}
                  <span className={`h-1 w-6 rounded-full ${active ? "bg-or" : "bg-transparent"}`} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <PaymentModal />
      <Toast />
    </div>
  );
}
