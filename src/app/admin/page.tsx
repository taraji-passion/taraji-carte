"use client";

import { FOUNDER_SEATS, useAppState } from "@/lib/store";
import { Card, PageHeader, Progress, Section, Stat, useT } from "@/components/ui";
import { CountUp } from "@/components/fx";
import { Logo } from "@/components/Logo";
import { num, pct, tnd } from "@/lib/format";

const MONTHLY = [1200, 2900, 3400, 2100, 1800, 1650, 2300, 1900, 2600, 1500, 1200, 1900];

export default function DashboardPage() {
  const s = useAppState();
  const t = useT();
  const cards = { base: 12840, or: 4920, platine: 672 };
  const cardsTotal = cards.base + cards.or + cards.platine + 1;
  const passSubs = s.founderSeatsTaken + 1260 + (s.pass.plan ? 1 : 0);

  return (
    <>
      <PageHeader title={t("dashboard")} subtitle="Espace Admin" right={<Logo size={44} />} />

      <div className="rounded-[28px] bg-sombre p-6 text-white shadow-xl">
        <div className="text-sm text-white/60">Cartes Supporter actives</div>
        <div className="text-5xl font-black">
          <CountUp value={cardsTotal} />
        </div>
        <div className="mt-3 flex justify-between text-xs text-white/60">
          <span>Objectif année 1 : 20 000</span>
          <span>{pct(cardsTotal, 20000)} %</span>
        </div>
        <div className="mt-1">
          <Progress value={pct(cardsTotal, 20000)} label="Objectif cartes" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Abonnés au Pass" value={<CountUp value={passSubs} />} sub={`${num(s.founderSeatsTaken)} / ${num(FOUNDER_SEATS)} Fondateurs`} />
        <Stat label="Crédit voyage" value={<CountUp value={412600 + s.pass.credit} format={(n) => tnd(n)} />} sub="détenu par les supporters" />
        <Stat label="Places virtuelles" value={<CountUp value={8412 + s.tickets.filter((x) => x.mine).length} />} sub="dernier match" />
        <Stat label="Diaspora" value="29 %" sub="des cartes" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Nouvelles cartes par mois">
          <Card>
            <div className="flex h-36 items-end gap-1.5">
              {MONTHLY.map((v, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div className={`w-full rounded-md ${i === 2 ? "bg-sang" : "bg-sang/30"}`} style={{ height: `${(v / 3400) * 100}%` }} />
                  <span className="text-[9px] text-sombre/40">{"JFMAMJJASOND"[i]}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>
        <Section title="Répartition des niveaux">
          <Card>
            <div className="space-y-3">
              {(
                [
                  ["Base", cards.base, "bg-sombre"],
                  ["Or", cards.or, "bg-or"],
                  ["Platine", cards.platine, "bg-sang"],
                ] as const
              ).map(([l, n, c]) => (
                <div key={l}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{l}</span>
                    <strong>{num(n)}</strong>
                  </div>
                  <Progress value={(n / cards.base) * 100} color={c} label={l} />
                </div>
              ))}
            </div>
          </Card>
        </Section>
      </div>
    </>
  );
}
