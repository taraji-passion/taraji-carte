"use client";

import { useMemo, useState } from "react";
import { H2, Panel, Screen, StaffOnly, useT } from "@/components/ui";
import { CountUp } from "@/components/fx";
import { num, tnd } from "@/lib/format";

interface Inputs {
  base: number;
  or: number;
  platine: number;
  priceBase: number;
  voyageur: number;
  plus: number;
  diaspora: number;
  virtualPerMatch: number;
  matches: number;
  piggies: number;
}

type Scenario = "prudent" | "central" | "ambitieux";

const SCENARIOS: Record<Scenario, Inputs> = {
  prudent: { base: 8000, or: 1500, platine: 150, priceBase: 40, voyageur: 1000, plus: 200, diaspora: 300, virtualPerMatch: 1500, matches: 15, piggies: 2000 },
  central: { base: 15000, or: 4000, platine: 600, priceBase: 50, voyageur: 3000, plus: 700, diaspora: 1300, virtualPerMatch: 4000, matches: 18, piggies: 6000 },
  ambitieux: { base: 40000, or: 15000, platine: 2500, priceBase: 60, voyageur: 7000, plus: 2000, diaspora: 3000, virtualPerMatch: 10000, matches: 20, piggies: 15000 },
};

// Hypothèses de calcul (à valider avec le club et les partenaires)
const H = {
  priceOr: 200,
  pricePlatine: 680,
  paymentFees: 0.03, // frais du partenaire de paiement
  passFees: { voyageur: 2, plus: 4, diaspora: 3 }, // TND par mois
  solidarityShare: 0.1, // 10 % des frais vers le fonds solidaire
  travelRate: 0.35, // part des abonnés qui voyagent chaque année
  travelMargin: 60, // TND reversés au club par voyageur (marge agence)
  avgVirtual: 21, // prix moyen d'une place virtuelle
  piggyFee: 1.5, // TND par mois et par famille (1 TND par tirelire, plafond 3)
  piggyOfferCommission: 24, // TND par tirelire et par an (commission sur offres groupées)
  avgCreditMonths: 6, // durée moyenne d'accumulation du crédit
};

function compute(i: Inputs) {
  const cards = (i.base * i.priceBase + i.or * H.priceOr + i.platine * H.pricePlatine) * (1 - H.paymentFees);
  const passSubs = i.voyageur + i.plus + i.diaspora;
  const passFees = (i.voyageur * H.passFees.voyageur + i.plus * H.passFees.plus + i.diaspora * H.passFees.diaspora) * 12 * (1 - H.solidarityShare);
  const travel = passSubs * H.travelRate * H.travelMargin;
  const virtual = i.virtualPerMatch * i.matches * H.avgVirtual * (1 - H.paymentFees);
  const piggies = i.piggies * (H.piggyFee * 12 + H.piggyOfferCommission);
  const total = cards + passFees + travel + virtual + piggies;
  const credit = (i.voyageur * 23 + i.plus * 46 + i.diaspora * 28) * H.avgCreditMonths;
  const solidarityFund = (i.voyageur * H.passFees.voyageur + i.plus * H.passFees.plus + i.diaspora * H.passFees.diaspora) * 12 * H.solidarityShare;
  return {
    total,
    credit,
    solidarityFund,
    cardsCount: i.base + i.or + i.platine,
    passSubs,
    parts: [
      { label: "Cartes Supporter", value: cards, color: "#B5121B" },
      { label: "Pass Voyageur (frais)", value: passFees, color: "#F2B705" },
      { label: "Voyages (marge agence)", value: travel, color: "#8e0e15" },
      { label: "Places virtuelles", value: virtual, color: "#c99700" },
      { label: "Tirelires Famille", value: piggies, color: "#5c4a4a" },
    ],
  };
}

function Slider({ label, value, min, max, step, onChange, unit = "" }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <strong>
          {num(value)}
          {unit}
        </strong>
      </div>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default function SimulateurPage() {
  const t = useT();
  const [scenario, setScenario] = useState<Scenario | null>("central");
  const [inputs, setInputs] = useState<Inputs>(SCENARIOS.central);
  const r = useMemo(() => compute(inputs), [inputs]);
  const all = useMemo(() => (Object.keys(SCENARIOS) as Scenario[]).map((k) => ({ k, total: compute(SCENARIOS[k]).total })), []);
  const maxAll = Math.max(...all.map((a) => a.total), r.total);

  const set = (k: keyof Inputs) => (v: number) => {
    setInputs((prev) => ({ ...prev, [k]: v }));
    setScenario(null);
  };

  return (
    <StaffOnly>
    <Screen title={t("simulator")} icon="📊" subtitle="Revenus annuels estimés en TND">
      <div className="sticky top-[60px] z-30 -mx-4 bg-or px-4 py-2 text-center text-xs font-bold text-sombre shadow">
        ⚠️ {t("hypotheses")} — estimations indicatives, données fictives
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(SCENARIOS) as Scenario[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setScenario(k);
              setInputs(SCENARIOS[k]);
            }}
            className={`min-h-12 rounded-xl font-bold ring-2 ${scenario === k ? "bg-sang text-white ring-sang" : "bg-white ring-black/10"}`}
          >
            {t(k === "ambitieux" ? "ambitious" : k)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 md:order-2">
          <Panel className="bg-sombre text-creme ring-0">
            <div className="text-xs text-or">{t("annualRevenue")}</div>
            <div className="text-4xl font-black text-or">
              <CountUp value={r.total} format={(n) => tnd(n)} duration={600} />
            </div>
            <div className="mt-1 text-xs text-creme/70">
              {num(r.cardsCount)} cartes · {num(r.passSubs)} abonnés au Pass · {num(inputs.virtualPerMatch * inputs.matches)} places virtuelles par an
            </div>
            <div className="mt-4 flex h-4 overflow-hidden rounded-full">
              {r.parts.map((p) => (
                <div key={p.label} style={{ width: `${(p.value / r.total) * 100}%`, background: p.color }} title={p.label} />
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {r.parts.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm ring-1 ring-white/30" style={{ background: p.color }} />
                    {p.label}
                  </span>
                  <span className="font-semibold">{tnd(p.value)}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <H2>Comparaison des scénarios</H2>
            <div className="space-y-2">
              {all.map((a) => (
                <div key={a.k} className="text-sm">
                  <div className="flex justify-between">
                    <span>{t(a.k === "ambitieux" ? "ambitious" : a.k)}</span>
                    <strong>{tnd(a.total)}</strong>
                  </div>
                  <div className="h-2.5 rounded-full bg-sombre/10">
                    <div className="h-2.5 rounded-full bg-sang" style={{ width: `${(a.total / maxAll) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <H2>À ne pas compter comme revenu</H2>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Crédit voyage détenu par les supporters</span>
                <strong>{tnd(r.credit)}</strong>
              </li>
              <li className="flex justify-between">
                <span>Fonds solidaire (10 % des frais)</span>
                <strong>{tnd(r.solidarityFund)}</strong>
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-sombre/50">Le crédit appartient aux supporters et reste sur leur compte MyTaraji (Zitouna Payment), sans rémunération.</p>
          </Panel>
        </div>

        <Panel className="md:order-1">
          <H2>Curseurs</H2>
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase text-sang">Cartes par niveau</div>
            <Slider label="Cartes Base" value={inputs.base} min={0} max={60000} step={500} onChange={set("base")} />
            <Slider label="Prix Base" value={inputs.priceBase} min={35} max={70} step={5} onChange={set("priceBase")} unit=" TND" />
            <Slider label="Cartes Or (200 TND)" value={inputs.or} min={0} max={20000} step={250} onChange={set("or")} />
            <Slider label="Cartes Platine (680 TND)" value={inputs.platine} min={0} max={3000} step={50} onChange={set("platine")} />
            <div className="pt-2 text-xs font-bold uppercase text-sang">Abonnés au Pass</div>
            <Slider label="Voyageur (25 TND/mois)" value={inputs.voyageur} min={0} max={10000} step={100} onChange={set("voyageur")} />
            <Slider label="Voyageur+ (50 TND/mois)" value={inputs.plus} min={0} max={3000} step={50} onChange={set("plus")} />
            <Slider label="Diaspora (31 TND/mois)" value={inputs.diaspora} min={0} max={5000} step={100} onChange={set("diaspora")} />
            <div className="pt-2 text-xs font-bold uppercase text-sang">Billets et tirelires</div>
            <Slider label="Places virtuelles par match" value={inputs.virtualPerMatch} min={0} max={20000} step={250} onChange={set("virtualPerMatch")} />
            <Slider label="Matchs à domicile par an" value={inputs.matches} min={5} max={25} step={1} onChange={set("matches")} />
            <Slider label="Tirelires actives (familles)" value={inputs.piggies} min={0} max={30000} step={500} onChange={set("piggies")} />
          </div>
        </Panel>
      </div>

      <Panel>
        <H2>{t("hypotheses")}</H2>
        <ul className="grid gap-1 text-xs text-sombre/70 md:grid-cols-2">
          <li>• Frais du partenaire de paiement : {H.paymentFees * 100} % (cartes, billets)</li>
          <li>• Frais du Pass : 2 / 4 / 3 TND par mois, dont 10 % au fonds solidaire</li>
          <li>• {H.travelRate * 100} % des abonnés voyagent chaque année ; {H.travelMargin} TND reversés au club par voyageur</li>
          <li>• Prix moyen d'une place virtuelle : {H.avgVirtual} TND (17 à 34 TND)</li>
          <li>• Tirelires : {H.piggyFee} TND de frais par mois et {H.piggyOfferCommission} TND de commission par an</li>
          <li>• Crédit moyen détenu : {H.avgCreditMonths} mois de versements</li>
          <li>• Hors coûts d'exploitation, de développement et de marketing</li>
          <li>• Cibles du PRD : 20 000 cartes en année 1, 60 000 à maturité ; 5 000 abonnés au Pass en 2027</li>
        </ul>
      </Panel>
    </Screen>
    </StaffOnly>
  );
}
