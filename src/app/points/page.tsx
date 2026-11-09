"use client";

import { useAppState } from "@/lib/store";
import { H2, Panel, Screen, useT } from "@/components/ui";

const EARN = [
  ["Adhésion à la Carte", "100 pts"],
  ["Ancienneté dans le Pass", "10 pts / mois"],
  ["Voyage officiel", "30 pts"],
  ["Billet solidaire", "20 pts"],
  ["Place virtuelle", "5 pts"],
  ["Parrainage", "50 pts"],
];

export default function PointsPage() {
  const s = useAppState();
  const t = useT();
  return (
    <Screen title={t("points")} icon="🏗️" subtitle="Solde et historique">
      <Panel className="bg-sombre text-creme ring-0">
        <div className="text-xs text-or">Solde</div>
        <div className="text-5xl font-black">{s.points.balance}</div>
        <div className="text-sm text-creme/70">points · 10 points = 1 TND de réduction sur un voyage</div>
      </Panel>
      <Panel>
        <H2>Comment gagner des points</H2>
        <ul className="divide-y divide-black/5 text-sm">
          {EARN.map(([a, b]) => (
            <li key={a} className="flex justify-between py-2">
              <span>{a}</span>
              <strong className="text-sang">{b}</strong>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-sombre/50">Échanges et récompenses en V1. Les points comptent aussi dans l'attribution des places de voyage.</p>
      </Panel>
      <Panel>
        <H2>{t("history")}</H2>
        <ul className="divide-y divide-black/5 text-sm">
          {s.points.movements.map((m) => (
            <li key={m.id} className="flex justify-between gap-2 py-2">
              <div>
                <div>{m.label}</div>
                <div className="text-[11px] text-sombre/50">{m.date}</div>
              </div>
              <strong className={m.amount >= 0 ? "text-emerald-700" : "text-sang"}>
                {m.amount >= 0 ? "+" : ""}
                {m.amount}
              </strong>
            </li>
          ))}
        </ul>
      </Panel>
    </Screen>
  );
}
