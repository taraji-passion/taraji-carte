"use client";

import Link from "next/link";
import { useState } from "react";
import { actions, ACCOUNT_CAP, FOUNDER_SEATS, PASS_PLANS, useAppState, type PassPlan } from "@/lib/store";
import { askPayment, Badge, Button, H2, Notice, Panel, Progress, Screen, toast, useT } from "@/components/ui";
import { pct, tnd } from "@/lib/format";

export default function PassPage() {
  const s = useAppState();
  const t = useT();
  const [plan, setPlan] = useState<PassPlan>(s.persona.diaspora ? "diaspora" : "voyageur");
  const [founder, setFounder] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const seatsLeft = FOUNDER_SEATS - s.founderSeatsTaken;

  async function subscribe() {
    const p = PASS_PLANS[plan];
    const ok = await askPayment(`Pass ${p.label}`, p.monthly, [
      `${p.credit} TND versés sur ton crédit voyage`,
      `${p.fee} TND de frais de service (10 % financent le fonds solidaire)`,
      "Prélèvement mensuel, sortie possible avec remboursement du crédit non utilisé",
      founder && seatsLeft > 0 ? "Badge « Fondateur 108 » : priorité permanente pour 2029 et 2030" : "Sans option Fondateur",
    ]);
    if (ok) {
      actions.subscribePass(plan, founder);
      toast(`Bienvenue dans le Pass ${p.label} !`);
    }
  }

  return (
    <Screen title={t("passTitle")} icon="💰" subtitle="Épargne voyage : souscription, crédit, objectifs">
      <Panel className="bg-sombre text-creme ring-0">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-or">{t("founders")}</span>
          <span>
            <strong>{s.founderSeatsTaken.toLocaleString("fr-FR")}</strong> / {FOUNDER_SEATS.toLocaleString("fr-FR")}
          </span>
        </div>
        <div className="mt-2">
          <Progress value={pct(s.founderSeatsTaken, FOUNDER_SEATS)} label="Places Fondateur" />
        </div>
        <p className="mt-2 text-xs text-creme/70">
          Plus que {seatsLeft} places « Fondateur 108 » : priorité permanente pour la Coupe du monde des clubs 2029 et la Coupe du monde 2030.
          {s.pass.founder && <span className="ms-1 font-semibold text-or">Tu es Fondateur 108 ✈️</span>}
        </p>
      </Panel>

      {!s.pass.plan ? (
        <Panel>
          <H2>{t("subscribe")}</H2>
          <div className="space-y-2">
            {(Object.keys(PASS_PLANS) as PassPlan[]).map((id) => {
              const p = PASS_PLANS[id];
              return (
                <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-2 ${plan === id ? "bg-sang/5 ring-sang" : "ring-black/10"}`}>
                  <input type="radio" name="plan" checked={plan === id} onChange={() => setPlan(id)} className="accent-sang" />
                  <div className="flex-1">
                    <div className="font-bold">{p.label}</div>
                    <div className="text-xs text-sombre/60">{p.note}</div>
                  </div>
                  <div className="text-end">
                    <div className="font-extrabold">{p.monthly} TND</div>
                    <div className="text-[11px] text-sombre/60">
                      {p.credit} crédit + {p.fee} frais
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={founder} onChange={(e) => setFounder(e.target.checked)} disabled={seatsLeft <= 0} className="h-5 w-5 accent-sang" />
            Devenir Fondateur 108 ({seatsLeft} places restantes)
          </label>
          <div className="mt-3 space-y-2 text-xs text-sombre/70">
            <p>• Le crédit <strong>t'appartient</strong> : il est tenu sur ton compte de paiement MyTaraji (Zitouna Payment), <strong>sans rémunération</strong>.</p>
            <p>• Plafond du compte niveau 1 : {tnd(ACCOUNT_CAP)}.</p>
            <p>• Sortie possible avec remboursement du crédit non utilisé (délai et plafond fixés dans les conditions générales, à valider).</p>
          </div>
          <Button className="mt-4 w-full" onClick={subscribe}>
            {t("subscribe")} — {PASS_PLANS[plan].monthly} TND {t("perMonth")}
          </Button>
        </Panel>
      ) : (
        <>
          <Panel>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-sombre/60">{t("travelCredit")}</div>
                <div className="text-4xl font-black text-sang">{tnd(s.pass.credit)}</div>
                <div className="mt-1 text-xs text-sombre/60">
                  Formule {PASS_PLANS[s.pass.plan].label} · {PASS_PLANS[s.pass.plan].credit} TND de crédit par mois
                </div>
              </div>
              <Badge tone="vert">Actif</Badge>
            </div>
            {s.pass.credit > ACCOUNT_CAP && (
              <div className="mt-3">
                <Notice>⚠️ Ton crédit dépasse le plafond du compte niveau 1 ({tnd(ACCOUNT_CAP)}) : passe au niveau 2 ou réserve un voyage.</Notice>
              </div>
            )}
            <Button
              variant="gold"
              className="mt-4 w-full"
              onClick={() => {
                actions.simulateMonths(6);
                toast("+6 mois simulés");
              }}
            >
              ⏩ {t("simulate6")}
            </Button>
            <Link href="/voyages" className="mt-2 flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold text-sang ring-1 ring-sang/40">
              ✈️ Utiliser mon crédit : {t("catalog")}
            </Link>
          </Panel>

          <Panel>
            <H2>{t("goals")}</H2>
            <div className="space-y-3">
              {s.goals.map((g) => {
                const v = pct(s.pass.credit, g.target);
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{g.label}</span>
                      <span className="text-sombre/70">
                        <strong>{v} %</strong> · {tnd(g.target)}
                      </span>
                    </div>
                    <Progress value={v} color={v >= 100 ? "bg-emerald-500" : "bg-or"} label={g.label} />
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <H2
              right={
                s.pass.movements.length > 5 && (
                  <button className="text-xs text-sang" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Réduire" : "Tout voir"}
                  </button>
                )
              }
            >
              {t("history")}
            </H2>
            <ul className="divide-y divide-black/5 text-sm">
              {(showAll ? s.pass.movements : s.pass.movements.slice(0, 5)).map((m) => (
                <li key={m.id} className="flex justify-between gap-2 py-2">
                  <div>
                    <div>{m.label}</div>
                    <div className="text-[11px] text-sombre/50">{m.date}</div>
                  </div>
                  <div className={`shrink-0 font-semibold ${m.amount >= 0 ? "text-emerald-700" : "text-sang"}`}>
                    {m.amount >= 0 ? "+" : ""}
                    {tnd(m.amount)}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-sombre/50">10 % des frais de service financent le fonds solidaire (places tirées au sort).</p>
          </Panel>

          <button
            className="w-full py-2 text-center text-xs text-sombre/50 underline"
            onClick={() => {
              if (confirm("Quitter le Pass et être remboursé du crédit non utilisé ? (simulation)")) actions.cancelPass();
            }}
          >
            Demander la sortie du Pass (remboursement du crédit)
          </button>
        </>
      )}
    </Screen>
  );
}
