"use client";

import { useMemo, useState } from "react";
import { Card, PageHeader, Section, Segmented, Sheet, Button, useT } from "@/components/ui";
import { CountUp } from "@/components/fx";
import { num, tnd } from "@/lib/format";

interface Inputs {
  base: number;
  or: number;
  platine: number;
  pass: number;
  virtualPerMatch: number;
  piggies: number;
}

type Scenario = "prudent" | "central" | "ambitieux";

const SCENARIOS: Record<Scenario, Inputs> = {
  prudent: { base: 8000, or: 1500, platine: 150, pass: 1500, virtualPerMatch: 1500, piggies: 2000 },
  central: { base: 15000, or: 4000, platine: 600, pass: 5000, virtualPerMatch: 4000, piggies: 6000 },
  ambitieux: { base: 40000, or: 15000, platine: 2500, pass: 12000, virtualPerMatch: 10000, piggies: 15000 },
};

// Hypothèses (à valider avec le club et les partenaires)
const H = { priceBase: 50, priceOr: 200, pricePlatine: 680, fees: 0.03, passFee: 2.5, solidarity: 0.1, travelRate: 0.35, travelMargin: 60, avgVirtual: 21, matches: 18, piggyYear: 42 };

function compute(i: Inputs) {
  const parts = [
    { label: "Cartes Supporter", value: (i.base * H.priceBase + i.or * H.priceOr + i.platine * H.pricePlatine) * (1 - H.fees), color: "#B5121B" },
    { label: "Pass Voyageur", value: i.pass * H.passFee * 12 * (1 - H.solidarity) + i.pass * H.travelRate * H.travelMargin, color: "#F2B705" },
    { label: "Places virtuelles", value: i.virtualPerMatch * H.matches * H.avgVirtual * (1 - H.fees), color: "#1C1414" },
    { label: "Tirelires Famille", value: i.piggies * H.piggyYear, color: "#9a8f8f" },
  ];
  return { parts, total: parts.reduce((a, p) => a + p.value, 0) };
}

const SLIDERS: { k: keyof Inputs; label: string; max: number; step: number }[] = [
  { k: "base", label: "Cartes Base", max: 60000, step: 500 },
  { k: "or", label: "Cartes Or", max: 20000, step: 250 },
  { k: "platine", label: "Cartes Platine", max: 3000, step: 50 },
  { k: "pass", label: "Abonnés au Pass", max: 15000, step: 250 },
  { k: "virtualPerMatch", label: "Places virtuelles par match", max: 20000, step: 250 },
  { k: "piggies", label: "Tirelires actives", max: 30000, step: 500 },
];

export default function SimulateurPage() {
  const t = useT();
  const [scenario, setScenario] = useState<Scenario>("central");
  const [inputs, setInputs] = useState<Inputs>(SCENARIOS.central);
  const [tuning, setTuning] = useState(false);
  const r = useMemo(() => compute(inputs), [inputs]);

  return (
    <>
      <PageHeader title={t("simulator")} subtitle="Revenus annuels estimés" />

      <Segmented
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setInputs(SCENARIOS[v]);
        }}
        items={[
          { id: "prudent", label: t("prudent") },
          { id: "central", label: t("central") },
          { id: "ambitieux", label: t("ambitious") },
        ]}
      />

      <div className="mt-4 rounded-[28px] bg-sombre p-6 text-white shadow-xl">
        <div className="text-sm text-white/60">{t("annualRevenue")}</div>
        <div className="mt-1 text-[40px] font-black leading-none tracking-tight text-or">
          <CountUp value={r.total} format={(n) => tnd(n)} duration={600} />
        </div>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full">
          {r.parts.map((p) => (
            <div key={p.label} style={{ width: `${(p.value / r.total) * 100}%`, background: p.color === "#1C1414" ? "#fbf6ec" : p.color }} />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {r.parts.map((p) => (
            <div key={p.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color === "#1C1414" ? "#fbf6ec" : p.color }} />
                {p.label}
              </span>
              <span className="font-semibold">{tnd(p.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <Button variant="soft" className="mt-4 w-full" onClick={() => setTuning(true)}>
        Ajuster les curseurs
      </Button>

      <Section>
        <Card className="bg-or/15 text-sm">
          <strong>⚠️ {t("hypotheses")}.</strong> Estimations hors coûts. Le crédit voyage (environ {tnd(inputs.pass * 25 * 6)}) appartient aux supporters : ce n'est pas un revenu.
        </Card>
      </Section>

      <Sheet open={tuning} onClose={() => setTuning(false)} title="Curseurs">
        <div className="space-y-4">
          {SLIDERS.map((sl) => (
            <label key={sl.k} className="block">
              <div className="flex justify-between text-sm">
                <span>{sl.label}</span>
                <strong>{num(inputs[sl.k])}</strong>
              </div>
              <input type="range" className="w-full" min={0} max={sl.max} step={sl.step} value={inputs[sl.k]} onChange={(e) => setInputs({ ...inputs, [sl.k]: Number(e.target.value) })} />
            </label>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-sombre p-4 text-center text-white">
          <div className="text-xs text-white/60">Total</div>
          <div className="text-2xl font-black text-or">{tnd(r.total)}</div>
        </div>
      </Sheet>
    </>
  );
}
