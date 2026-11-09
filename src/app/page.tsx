"use client";

import Link from "next/link";
import { useState } from "react";
import { actions, PASS_PLANS, useAppState } from "@/lib/store";
import { Card, PageHeader, Progress, Section, Sheet, useT } from "@/components/ui";
import { SupporterCard } from "@/components/SupporterCard";
import { Crest } from "@/components/Crest";
import { CountUp } from "@/components/fx";
import { pct, tnd } from "@/lib/format";

export default function HomePage() {
  const s = useAppState();
  const t = useT();
  const [notifs, setNotifs] = useState(false);
  const unread = s.notifications.filter((n) => !n.read).length;
  const match = s.matches[0];
  const goal = s.goals.find((g) => s.pass.credit < g.target) ?? s.goals[s.goals.length - 1];
  const firstName = s.persona.name.split(" ")[0];

  const actionsList = [
    { href: "/voyager", label: "Voyager", icon: "✈️" },
    { href: "/matchs", label: "Place virtuelle", icon: "🎟️" },
    { href: "/famille", label: "Tirelire", icon: "💰" },
    { href: "/matchs", label: "Offrir", icon: "❤️" },
  ];

  return (
    <>
      <PageHeader
        subtitle={t("hello")}
        title={firstName}
        right={
          <button
            onClick={() => {
              setNotifs(true);
              actions.markNotificationsRead();
            }}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"
            aria-label={t("notifications")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Zm4 11a2 2 0 0 0 4 0" />
            </svg>
            {unread > 0 && <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sang px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
        }
      />

      <SupporterCard />

      {/* Actions rapides */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {actionsList.map((a) => (
          <Link key={a.label} href={a.href} className="flex flex-col items-center gap-1.5">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm transition active:scale-95">{a.icon}</span>
            <span className="text-center text-[11px] font-medium text-sombre/70">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Prochain match */}
      <Section title="Prochain match">
        <Link href="/matchs" className="block overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top,#5a1016,#1C1414_70%)] p-5 text-white shadow-lg">
          <div className="text-center text-[11px] font-semibold uppercase tracking-wider text-or">{match.competition}</div>
          <div className="mt-3 flex items-center justify-around">
            <div className="flex w-24 flex-col items-center gap-1.5">
              <Crest name="EST" />
              <span className="text-xs font-semibold">Espérance</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white/90">VS</div>
              <div className="text-[11px] text-white/60">{match.date}</div>
            </div>
            <div className="flex w-24 flex-col items-center gap-1.5">
              <Crest name={match.opponent} />
              <span className="text-center text-xs font-semibold leading-tight">{match.opponent}</span>
            </div>
          </div>
          <div className="mt-4 flex min-h-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold backdrop-blur">Je serai là, à distance · dès 17 TND</div>
        </Link>
      </Section>

      {/* Pass Voyageur */}
      <Section title={t("passTitle")}>
        {s.pass.plan ? (
          <Card>
            <Link href="/voyager" className="block">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-sombre/50">{t("travelCredit")}</div>
                  <div className="text-3xl font-black">
                    <CountUp value={s.pass.credit} format={(n) => tnd(n)} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">+{PASS_PLANS[s.pass.plan].credit} TND / mois</span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-sombre/60">
                <span>{goal.label}</span>
                <span>{pct(s.pass.credit, goal.target)} %</span>
              </div>
              <div className="mt-1">
                <Progress value={pct(s.pass.credit, goal.target)} label={goal.label} />
              </div>
            </Link>
          </Card>
        ) : (
          <Link href="/voyager" className="flex items-center gap-4 rounded-3xl bg-or p-5 shadow-[0_10px_30px_-12px_rgba(242,183,5,0.9)]">
            <span className="text-4xl">✈️</span>
            <span className="flex-1">
              <span className="block text-lg font-extrabold leading-tight">Le Caire à 750 TND</span>
              <span className="block text-sm text-sombre/70">au lieu de 1 870 TND, en mettant 25 TND de côté par mois</span>
            </span>
            <span className="text-xl rtl:rotate-180">›</span>
          </Link>
        )}
      </Section>

      <Sheet open={notifs} onClose={() => setNotifs(false)} title={t("notifications")}>
        <div className="space-y-2">
          {s.notifications.length === 0 && <p className="text-sm text-sombre/50">Aucune notification.</p>}
          {s.notifications.map((n) => (
            <div key={n.id} className="rounded-2xl bg-white p-3 text-sm">
              <div>{n.text}</div>
              <div className="mt-1 text-[11px] text-sombre/40">{n.date}</div>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}
