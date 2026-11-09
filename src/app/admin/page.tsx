"use client";

import { FOUNDER_SEATS, useAppState } from "@/lib/store";
import { H2, Panel, Screen, StaffOnly, Stat, useT } from "@/components/ui";
import { num, tnd } from "@/lib/format";

export default function DashboardPage() {
  const s = useAppState();
  const t = useT();
  // Données agrégées fictives + actions de la démo
  const cards = { base: 12840, or: 4920, platine: 672 };
  const cardsTotal = cards.base + cards.or + cards.platine + 1;
  const passSubs = s.founderSeatsTaken + 1260 + (s.pass.plan ? 1 : 0);
  const creditPool = 412600 + s.pass.credit;
  const totalBooked = s.trips.reduce((a, b) => a + b.booked, 0);
  const virtualTickets = 8412 + s.tickets.filter((x) => x.mine).length;
  const piggies = 2140 + s.piggies.length;
  const monthly = [1200, 2900, 3400, 2100, 1800, 1650, 2300, 1900, 2600, 1500, 1200, 1900];

  return (
    <StaffOnly allowPresident>
      <Screen title={t("dashboard")} icon="📈" subtitle="Indicateurs de la communauté (fictifs)">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Cartes actives" value={num(cardsTotal)} sub="objectif an 1 : 20 000" />
          <Stat label="Abonnés au Pass" value={num(passSubs)} sub={`Fondateurs ${num(s.founderSeatsTaken)} / ${num(FOUNDER_SEATS)}`} />
          <Stat label="Crédit voyage cumulé" value={tnd(creditPool)} sub="détenu par les supporters" />
          <Stat label="Réservations voyages" value={num(totalBooked)} sub={`${s.trips.filter((x) => x.status === "publie").length} voyages ouverts`} />
          <Stat label="Places virtuelles (dernier match)" value={num(virtualTickets)} sub="21 pays" />
          <Stat label="Places solidaires" value={num(s.solidarityCount)} />
          <Stat label="Tirelires actives" value={num(piggies)} />
          <Stat label="Diaspora" value="29 %" sub="des cartes (objectif ≥ 25 %)" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <H2>Cartes par niveau</H2>
            {(
              [
                ["Base", cards.base, "bg-sombre"],
                ["Or", cards.or, "bg-sang"],
                ["Platine", cards.platine, "bg-or"],
              ] as const
            ).map(([l, n, c]) => (
              <div key={l} className="mb-2 text-sm">
                <div className="flex justify-between">
                  <span>{l}</span>
                  <strong>{num(n)}</strong>
                </div>
                <div className="h-2.5 rounded-full bg-sombre/10">
                  <div className={`h-2.5 rounded-full ${c}`} style={{ width: `${(n / cards.base) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-3 flex gap-2 text-xs">
              <span className="flex-1 rounded-lg bg-creme p-2 text-center">
                🇹🇳 Tunisie <strong>71 %</strong>
              </span>
              <span className="flex-1 rounded-lg bg-creme p-2 text-center">
                🌍 Diaspora <strong>29 %</strong>
              </span>
            </div>
          </Panel>
          <Panel>
            <H2>Nouvelles cartes par mois (2027, simulé)</H2>
            <div className="flex h-36 items-end gap-1">
              {monthly.map((v, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div className="w-full rounded-t bg-sang" style={{ height: `${(v / 3400) * 100}%` }} title={`${v}`} />
                  <span className="text-[9px] text-sombre/50">{"JFMAMJJASOND"[i]}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-sombre/50">Pic en février : ouverture des 2 000 Pass Fondateur.</p>
          </Panel>
        </div>
        {s.adminLog.length > 0 && (
          <Panel>
            <H2>Journal des actions</H2>
            <ul className="space-y-1 text-xs text-sombre/70">
              {s.adminLog.slice(0, 10).map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </Panel>
        )}
      </Screen>
    </StaffOnly>
  );
}
