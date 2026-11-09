"use client";

import { useState } from "react";
import { actions, useAppState, type Trip } from "@/lib/store";
import { askPayment, Badge, Button, H2, Panel, Progress, Screen, toast, useT } from "@/components/ui";
import { confetti } from "@/components/fx";
import { pct, tnd } from "@/lib/format";

type Recap = { trip: Trip; creditUsed: number; complement: number; pointsUsed: number };

export default function VoyagesPage() {
  const s = useAppState();
  const t = useT();
  const [charter, setCharter] = useState<Record<string, boolean>>({});
  const [usePoints, setUsePoints] = useState(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const myBookings = s.bookings.filter((b) => b.traveler === s.persona.name);

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
      confetti(120);
      toast("Réservation confirmée !");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Screen title={t("catalog")} icon="✈️" subtitle={`Crédit disponible : ${tnd(s.pass.credit)}`}>
      {recap && (
        <Panel className="bg-white ring-2 ring-emerald-500">
          <H2
            right={
              <button className="text-xs text-sombre/50" onClick={() => setRecap(null)}>
                Fermer
              </button>
            }
          >
            ✅ Réservation confirmée
          </H2>
          <div className="text-sm">
            <div className="font-semibold">{recap.trip.event}</div>
            <div className="text-sombre/70">
              {recap.trip.destination} · {recap.trip.dates}
            </div>
            <ul className="mt-2 space-y-1">
              <li>
                Prix officiel : <strong>{tnd(recap.trip.price)}</strong> <span className="text-sombre/50">(prix public moyen {tnd(recap.trip.publicPrice)})</span>
              </li>
              <li>
                Payé avec le crédit : <strong>{tnd(recap.creditUsed)}</strong>
              </li>
              {recap.pointsUsed > 0 && (
                <li>
                  Points Bâtisseur utilisés : <strong>{recap.pointsUsed}</strong>
                </li>
              )}
              <li>
                Complément payé : <strong>{tnd(recap.complement)}</strong>
              </li>
              <li>
                Économie : <strong className="text-emerald-700">{tnd(recap.trip.publicPrice - recap.trip.price)}</strong>
              </li>
            </ul>
            <p className="mt-2 text-xs text-sombre/60">Billet, programme, aide pour le visa, chef de groupe et groupe de discussion : envoyés 10 jours avant le départ.</p>
          </div>
        </Panel>
      )}

      <label className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm ring-1 ring-black/5">
        <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="h-5 w-5 accent-sang" />
        Utiliser mes Points Bâtisseur ({s.points.balance} pts, 10 pts = 1 TND, max 10 %)
      </label>

      {s.trips.map((trip) => {
        const full = trip.booked >= trip.quota;
        const already = myBookings.some((b) => b.tripId === trip.id && b.status === "confirmee");
        const cancelled = trip.status === "annule";
        return (
          <Panel key={trip.id} className={cancelled ? "bg-sombre/5 opacity-70" : ""}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold uppercase text-sang">{trip.competition}</div>
                <div className="font-bold">{trip.destination}</div>
                <div className="text-xs text-sombre/70">{trip.event}</div>
                <div className="text-xs text-sombre/60">{trip.dates}</div>
              </div>
              <div className="shrink-0 text-end">
                <div className="text-lg font-extrabold">{tnd(trip.price)}</div>
                <div className="text-xs text-sombre/50 line-through">{tnd(trip.publicPrice)}</div>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={pct(trip.booked, trip.quota)} color="bg-sang" label="Places réservées" />
              <div className="mt-1 text-[11px] text-sombre/60">
                {trip.booked} / {trip.quota} places · vol, hôtel, transferts et billet de match
              </div>
            </div>
            {cancelled ? (
              <div className="mt-2">
                <Badge tone="sang">Annulé — EST éliminée, crédit reporté</Badge>
              </div>
            ) : already ? (
              <div className="mt-2">
                <Badge tone="vert">Réservé ✓</Badge>
              </div>
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
          </Panel>
        );
      })}
      <p className="text-xs text-sombre/60">Attribution des places (règle publique) : 1) formule Voyageur+, 2) ancienneté dans le Pass, 3) Points Bâtisseur.</p>

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

      <Panel>
        <H2>Calendrier</H2>
        <ul className="space-y-1 text-sm text-sombre/80">
          <li>⚽ Matchs CAF à l'extérieur (après chaque tirage)</li>
          <li>🌍 CAN 2027 : 19 juin – 17 juillet (Kenya, Ouganda, Tanzanie)</li>
          <li>🏆 Coupe du monde des clubs 2029</li>
          <li>🇲🇦 Coupe du monde 2030 (Maroc, Espagne, Portugal)</li>
        </ul>
      </Panel>
    </Screen>
  );
}
