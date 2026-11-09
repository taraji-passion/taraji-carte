"use client";

import { useState } from "react";
import { actions, ACCOUNT_CAP, FOUNDER_SEATS, PASS_PLANS, useAppState, type PassPlan, type Trip } from "@/lib/store";
import { askPayment, Badge, Button, Card, List, PageHeader, Progress, Row, Section, Segmented, Sheet, toast, useT } from "@/components/ui";
import { confetti, CountUp } from "@/components/fx";
import { pct, tnd } from "@/lib/format";

function flag(trip: Trip) {
  const d = trip.destination.toLowerCase();
  if (d.includes("égypte")) return "🇪🇬";
  if (d.includes("maroc")) return "🇲🇦";
  if (d.includes("kenya")) return "🇰🇪";
  if (d.includes("algérie")) return "🇩🇿";
  return "🌍";
}

export default function VoyagerPage() {
  const s = useAppState();
  const t = useT();
  const [plan, setPlan] = useState<PassPlan>(s.persona.diaspora ? "diaspora" : "voyageur");
  const [founder, setFounder] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [charter, setCharter] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [booked, setBooked] = useState<{ creditUsed: number; complement: number } | null>(null);
  const [history, setHistory] = useState(false);

  const seatsLeft = FOUNDER_SEATS - s.founderSeatsTaken;
  const trip = s.trips.find((x) => x.id === tripId) ?? null;
  const myBookings = s.bookings.filter((b) => b.traveler === s.persona.name && b.status === "confirmee");
  const p = PASS_PLANS[plan];

  // Calcul de la réservation du voyage ouvert
  const pointsValue = trip && usePoints ? Math.min(Math.floor(s.points.balance / 10), Math.floor(trip.price * 0.1)) : 0;
  const creditUsed = trip ? Math.min(s.pass.credit, trip.price - pointsValue) : 0;
  const complement = trip ? trip.price - pointsValue - creditUsed : 0;

  async function subscribe() {
    const ok = await askPayment(`Pass ${p.label}`, p.monthly, [`${p.credit} TND sur ton crédit voyage`, `${p.fee} TND de frais de service`, "Sans engagement, crédit remboursable"]);
    if (!ok) return;
    actions.subscribePass(plan, founder);
    confetti();
    toast(`Bienvenue dans le Pass ${p.label} !`);
  }

  function openTrip(id: string) {
    setTripId(id);
    setCharter(false);
    setUsePoints(false);
    setBooked(null);
  }

  async function book() {
    if (!trip) return;
    if (complement > 0) {
      const ok = await askPayment(`Complément · ${trip.destination}`, complement, [`Crédit utilisé : ${tnd(creditUsed)}`, pointsValue > 0 ? `Points : −${tnd(pointsValue)}` : "Sans points"]);
      if (!ok) return;
    }
    const r = actions.bookTrip(trip.id, usePoints);
    if (r) {
      setBooked(r);
      confetti(120);
    }
  }

  /* -------------------- Pas encore abonné : écran d'offre -------------------- */
  if (!s.pass.plan) {
    return (
      <>
        <PageHeader title={t("navTravel")} />
        <div className="overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_top_right,#6b0f16,#1C1414_65%)] p-6 text-white shadow-xl">
          <Badge tone="or">Pass Taraji Voyageur</Badge>
          <h2 className="mt-3 text-[26px] font-black leading-tight">
            Suis l'équipe partout,
            <br />
            <span className="text-or">sans te ruiner.</span>
          </h2>
          <p className="mt-2 text-sm text-white/70">Mets de côté chaque mois. Réserve les voyages officiels en un clic.</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-5xl font-black">{p.monthly}</span>
            <span className="text-white/70">TND / mois</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>✓ {p.credit} TND de crédit voyage + {p.fee} TND de frais</li>
            <li>✓ Le Caire : 750 TND au lieu de 1 870 TND</li>
            <li>✓ Ton crédit t'appartient, remboursable</li>
          </ul>
        </div>

        <div className="mt-4">
          <Segmented
            value={plan}
            onChange={setPlan}
            items={[
              { id: "voyageur", label: "Voyageur" },
              { id: "plus", label: "Voyageur+" },
              { id: "diaspora", label: "Diaspora" },
            ]}
          />
        </div>

        <Card className="mt-4">
          <label className="flex items-center gap-3">
            <span className="text-2xl">🏅</span>
            <span className="flex-1">
              <span className="block font-semibold">Devenir Fondateur 108</span>
              <span className="block text-xs text-sombre/50">Plus que {seatsLeft} places · priorité 2029 et 2030</span>
            </span>
            <input type="checkbox" checked={founder} onChange={(e) => setFounder(e.target.checked)} disabled={seatsLeft <= 0} className="h-6 w-6 accent-sang" />
          </label>
          <div className="mt-3">
            <Progress value={pct(s.founderSeatsTaken, FOUNDER_SEATS)} color="bg-sang" label="Places Fondateur" />
          </div>
        </Card>

        <Button className="mt-5 w-full" onClick={subscribe}>
          Rejoindre le Pass · {p.monthly} TND / mois
        </Button>
        <p className="mt-2 text-center text-[11px] text-sombre/40">Crédit tenu sur ton compte MyTaraji, sans rémunération · plafond {tnd(ACCOUNT_CAP)}</p>
      </>
    );
  }

  /* -------------------- Abonné -------------------- */
  return (
    <>
      <PageHeader title={t("navTravel")} right={s.pass.founder ? <Badge tone="or">🏅 Fondateur 108</Badge> : undefined} />

      <div className="rounded-[28px] bg-sombre p-6 text-white shadow-xl">
        <div className="text-sm text-white/60">{t("travelCredit")}</div>
        <div className="mt-1 text-5xl font-black tracking-tight">
          <CountUp value={s.pass.credit} format={(n) => tnd(n)} />
        </div>
        <div className="mt-1 text-sm text-emerald-400">
          +{PASS_PLANS[s.pass.plan].credit} TND chaque mois · {PASS_PLANS[s.pass.plan].label}
        </div>
        {s.pass.credit > ACCOUNT_CAP && <div className="mt-2 text-xs text-or">Plafond de {tnd(ACCOUNT_CAP)} dépassé : réserve un voyage ou passe au niveau 2.</div>}
        <div className="mt-5 flex gap-2">
          <button onClick={() => setHistory(true)} className="min-h-11 flex-1 rounded-2xl bg-white/10 text-sm font-semibold">
            Historique
          </button>
          <button
            onClick={() => {
              actions.simulateMonths(6);
              toast("+6 mois simulés");
            }}
            className="min-h-11 flex-1 rounded-2xl bg-or text-sm font-semibold text-sombre"
          >
            ⏩ {t("simulate6")}
          </button>
        </div>
      </div>

      <Section title={t("goals")}>
        <Card>
          <div className="space-y-3">
            {s.goals.map((g) => {
              const v = pct(s.pass.credit, g.target);
              return (
                <div key={g.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{g.label}</span>
                    <span className={v >= 100 ? "font-bold text-emerald-700" : "text-sombre/50"}>{v >= 100 ? "Atteint ✓" : `${v} %`}</span>
                  </div>
                  <Progress value={v} color={v >= 100 ? "bg-emerald-500" : "bg-or"} label={g.label} />
                </div>
              );
            })}
          </div>
        </Card>
      </Section>

      <TripList trips={s.trips} myTripIds={myBookings.map((b) => b.tripId)} onOpen={openTrip} />

      {/* Détail et réservation d'un voyage */}
      <Sheet open={!!trip} onClose={() => setTripId(null)}>
        {trip && !booked && (
          <>
            <div className="text-4xl">{flag(trip)}</div>
            <h3 className="mt-2 text-2xl font-extrabold">{trip.destination}</h3>
            <p className="text-sm text-sombre/60">
              {trip.event} · {trip.dates}
            </p>
            <p className="mt-1 text-xs text-sombre/50">Vol, hôtel, transferts et billet de match inclus</p>

            <div className="mt-4" />
            <List>
              <Row title="Prix officiel" right={<span className="font-bold">{tnd(trip.price)}</span>} sub={`Prix public ${tnd(trip.publicPrice)}`} />
              <Row title="Payé avec ton crédit" right={<span className="font-bold text-emerald-700">−{tnd(creditUsed)}</span>} />
              {pointsValue > 0 && <Row title="Points Bâtisseur" right={<span className="font-bold text-emerald-700">−{tnd(pointsValue)}</span>} />}
              <Row title="Reste à payer" right={<span className="text-lg font-black">{tnd(complement)}</span>} />
            </List>

            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5 accent-sang" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                Utiliser mes points ({s.points.balance} pts)
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-5 w-5 accent-sang" checked={charter} onChange={(e) => setCharter(e.target.checked)} />
                J'accepte la charte du voyageur
              </label>
            </div>
            <Button className="mt-5 w-full" disabled={!charter || trip.booked >= trip.quota} onClick={book}>
              {trip.booked >= trip.quota ? "Complet" : t("book")}
            </Button>
          </>
        )}
        {trip && booked && (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-4xl">✓</div>
            <h3 className="mt-4 text-2xl font-extrabold">C'est réservé !</h3>
            <p className="mt-1 text-sombre/60">
              {trip.destination} · {trip.dates}
            </p>
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
              Tu économises <strong className="text-emerald-700">{tnd(trip.publicPrice - trip.price)}</strong> par rapport au prix public.
            </div>
            <p className="mt-3 text-xs text-sombre/50">Billet, programme et contact du chef de groupe : 10 jours avant le départ.</p>
            <Button className="mt-5 w-full" onClick={() => setTripId(null)}>
              Super
            </Button>
          </div>
        )}
      </Sheet>

      {/* Historique */}
      <Sheet open={history} onClose={() => setHistory(false)} title={t("history")}>
        <List>
          {s.pass.movements.map((m) => (
            <Row
              key={m.id}
              title={m.label}
              sub={m.date}
              right={
                <span className={`shrink-0 font-semibold ${m.amount >= 0 ? "text-emerald-700" : "text-sang"}`}>
                  {m.amount >= 0 ? "+" : ""}
                  {tnd(m.amount)}
                </span>
              }
            />
          ))}
        </List>
        <button
          className="mt-4 w-full py-2 text-center text-xs text-sombre/40 underline"
          onClick={() => {
            if (confirm("Quitter le Pass et récupérer ton crédit ? (simulation)")) {
              actions.cancelPass();
              setHistory(false);
            }
          }}
        >
          Quitter le Pass et récupérer mon crédit
        </button>
      </Sheet>
    </>
  );
}

function TripList({ trips, myTripIds, onOpen }: { trips: Trip[]; myTripIds: string[]; onOpen: (id: string) => void }) {
  const t = useT();
  return (
    <Section title={t("catalog")}>
      <div className="space-y-3">
        {trips
          .filter((x) => x.status === "publie")
          .map((trip) => {
            const mine = myTripIds.includes(trip.id);
            return (
              <Card key={trip.id} onClick={() => onOpen(trip.id)} className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-creme text-3xl">{flag(trip)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{trip.destination}</span>
                  <span className="block truncate text-xs text-sombre/50">{trip.dates}</span>
                  {mine ? (
                    <span className="mt-1 inline-block">
                      <Badge tone="vert">Réservé ✓</Badge>
                    </span>
                  ) : (
                    <span className="block text-xs text-sombre/40">{trip.quota - trip.booked} places restantes</span>
                  )}
                </span>
                <span className="text-end">
                  <span className="block text-lg font-black">{tnd(trip.price)}</span>
                  <span className="block text-xs text-sombre/40 line-through">{tnd(trip.publicPrice)}</span>
                </span>
              </Card>
            );
          })}
      </div>
    </Section>
  );
}
