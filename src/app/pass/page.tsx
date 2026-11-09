"use client";

import { useState } from "react";
import { actions, ACCOUNT_CAP, FOUNDER_SEATS, PASS_PLANS, useAppState, type PassPlan, type Trip } from "@/lib/store";
import { askPayment, Badge, Button, H2, Notice, Panel, Progress, Stat, toast, useT } from "@/components/ui";
import { pct, tnd } from "@/lib/format";

type Recap = { trip: Trip; creditUsed: number; complement: number; pointsUsed: number };

export default function PassPage() {
  const s = useAppState();
  const t = useT();
  const [plan, setPlan] = useState<PassPlan>(s.persona.diaspora ? "diaspora" : "voyageur");
  const [founder, setFounder] = useState(true);
  const [charter, setCharter] = useState<Record<string, boolean>>({});
  const [usePoints, setUsePoints] = useState(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [showAll, setShowAll] = useState(false);

  const seatsLeft = FOUNDER_SEATS - s.founderSeatsTaken;
  const myBookings = s.bookings.filter((b) => b.traveler === s.persona.name);

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

  async function book(trip: Trip) {
    const pointsValue = usePoints ? Math.min(Math.floor(s.points.balance / 10), Math.floor(trip.price * 0.1)) : 0;
    const remaining = trip.price - pointsValue;
    const creditUsed = Math.min(s.pass.credit, remaining);
    const complement = remaining - creditUsed;
    if (complement > 0) {
      const ok = await askPayment(`Complément pour ${trip.destination}`, complement, [
        `Prix du voyage officiel : ${tnd(trip.price)}`,
        `Crédit voyage utilisé : ${tnd(creditUsed)}`,
        pointsValue > 0 ? `Points Bâtisseur : −${tnd(pointsValue)}` : "Sans Points Bâtisseur",
      ]);
      if (!ok) return;
    }
    const r = actions.bookTrip(trip.id, usePoints);
    if (r) {
      setRecap({ trip, ...r });
      toast("Réservation confirmée !");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">{t("passTitle")}</h1>
        {s.pass.founder && <Badge>Fondateur 108</Badge>}
      </div>

      {/* Compteur Fondateurs */}
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
        </p>
      </Panel>

      {recap && (
        <Panel className="ring-2 ring-emerald-500">
          <H2 right={<button className="text-xs text-sombre/50" onClick={() => setRecap(null)}>Fermer</button>}>✅ Réservation confirmée</H2>
          <div className="text-sm">
            <div className="font-semibold">{recap.trip.event}</div>
            <div className="text-sombre/70">{recap.trip.destination} · {recap.trip.dates}</div>
            <ul className="mt-2 space-y-1">
              <li>Prix officiel : <strong>{tnd(recap.trip.price)}</strong> <span className="text-sombre/50">(prix public moyen {tnd(recap.trip.publicPrice)})</span></li>
              <li>Payé avec le crédit : <strong>{tnd(recap.creditUsed)}</strong></li>
              {recap.pointsUsed > 0 && <li>Points Bâtisseur utilisés : <strong>{recap.pointsUsed}</strong></li>}
              <li>Complément payé : <strong>{tnd(recap.complement)}</strong></li>
              <li>Économie : <strong className="text-emerald-700">{tnd(recap.trip.publicPrice - recap.trip.price)}</strong></li>
            </ul>
            <p className="mt-2 text-xs text-sombre/60">Billet, programme, aide pour le visa, chef de groupe et groupe de discussion : envoyés 10 jours avant le départ.</p>
          </div>
        </Panel>
      )}

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
                    <div className="text-[11px] text-sombre/60">{p.credit} crédit + {p.fee} frais</div>
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
        </>
      )}

      {/* Catalogue */}
      <Panel>
        <H2>{t("catalog")}</H2>
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="h-5 w-5 accent-sang" />
          Utiliser mes Points Bâtisseur ({s.points.balance} pts, 10 pts = 1 TND, max 10 %)
        </label>
        <div className="space-y-3">
          {s.trips.map((trip) => {
            const full = trip.booked >= trip.quota;
            const already = myBookings.some((b) => b.tripId === trip.id && b.status === "confirmee");
            const cancelled = trip.status === "annule";
            return (
              <div key={trip.id} className={`rounded-xl p-3 ring-1 ring-black/10 ${cancelled ? "bg-sombre/5 opacity-70" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-sang">{trip.competition}</div>
                    <div className="font-bold">{trip.destination}</div>
                    <div className="text-xs text-sombre/70">{trip.event}</div>
                    <div className="text-xs text-sombre/60">{trip.dates}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-lg font-extrabold">{tnd(trip.price)}</div>
                    <div className="text-xs text-sombre/50 line-through">{tnd(trip.publicPrice)}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={pct(trip.booked, trip.quota)} color="bg-sang" label="Places réservées" />
                  <div className="mt-1 text-[11px] text-sombre/60">{trip.booked} / {trip.quota} places · vol, hôtel, transferts et billet de match</div>
                </div>
                {cancelled ? (
                  <div className="mt-2"><Badge tone="sang">Annulé — EST éliminée, crédit reporté</Badge></div>
                ) : already ? (
                  <div className="mt-2"><Badge tone="vert">Réservé ✓</Badge></div>
                ) : (
                  <>
                    <label className="mt-2 flex items-center gap-2 text-xs">
                      <input type="checkbox" className="h-4 w-4 accent-sang" checked={!!charter[trip.id]} onChange={(e) => setCharter({ ...charter, [trip.id]: e.target.checked })} />
                      J'accepte la charte du voyageur (toute violence entraîne l'exclusion)
                    </label>
                    <Button className="mt-2 w-full" disabled={full || !charter[trip.id]} onClick={() => book(trip)}>
                      {full ? "Complet — liste d'attente" : `${t("book")} · crédit ${tnd(Math.min(s.pass.credit, trip.price))}`}
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-sombre/60">
          Attribution des places (règle publique) : 1) formule Voyageur+, 2) ancienneté dans le Pass, 3) Points Bâtisseur.
        </p>
      </Panel>

      {/* Scénario élimination */}
      <Panel>
        <H2>{t("eliminated")}</H2>
        <p className="text-sm text-sombre/70">Simule une élimination en quart de finale : le voyage au Caire est annulé et le crédit utilisé est reporté.</p>
        <Button
          variant={s.eliminated ? "ghost" : "dark"}
          className="mt-3 w-full"
          onClick={() => {
            actions.setEliminated(!s.eliminated);
            toast(s.eliminated ? "L'EST est qualifiée" : "Crédit reporté");
          }}
        >
          {s.eliminated ? "↩︎ Revenir au scénario qualifié" : "❌ L'EST est éliminée"}
        </Button>
        {s.eliminated && (
          <div className="mt-3 rounded-xl bg-creme p-3 text-sm">
            <div className="font-semibold">Ton crédit reste disponible pour :</div>
            <ul className="mt-1 list-inside list-disc text-sombre/80">
              <li>Pack supporters CAN 2027 (Kenya, Ouganda, Tanzanie)</li>
              <li>Coupe du monde des clubs 2029 et Coupe du monde 2030</li>
              <li>Le Taraji Store</li>
            </ul>
          </div>
        )}
      </Panel>

      {s.pass.plan && (
        <>
          <Panel>
            <H2 right={s.pass.movements.length > 5 && <button className="text-xs text-sang" onClick={() => setShowAll(!showAll)}>{showAll ? "Réduire" : "Tout voir"}</button>}>{t("history")}</H2>
            <ul className="divide-y divide-black/5 text-sm">
              {(showAll ? s.pass.movements : s.pass.movements.slice(0, 5)).map((m) => (
                <li key={m.id} className="flex justify-between gap-2 py-2">
                  <div>
                    <div>{m.label}</div>
                    <div className="text-[11px] text-sombre/50">{m.date}</div>
                  </div>
                  <div className={`shrink-0 font-semibold ${m.amount >= 0 ? "text-emerald-700" : "text-sang"}`}>
                    {m.amount >= 0 ? "+" : ""}{tnd(m.amount)}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Voyages réservés" value={String(myBookings.filter((b) => b.status === "confirmee").length)} />
            <Stat label="Fonds solidaire" value="10 %" sub="des frais de service" />
          </div>

          <Panel>
            <H2>Calendrier</H2>
            <ul className="space-y-1 text-sm text-sombre/80">
              <li>⚽ Matchs CAF à l'extérieur (après chaque tirage)</li>
              <li>🌍 CAN 2027 : 19 juin – 17 juillet (Kenya, Ouganda, Tanzanie)</li>
              <li>🏆 Coupe du monde des clubs 2029</li>
              <li>🇲🇦 Coupe du monde 2030 (Maroc, Espagne, Portugal)</li>
            </ul>
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
    </div>
  );
}
