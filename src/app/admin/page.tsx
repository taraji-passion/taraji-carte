"use client";

import { useState } from "react";
import { actions, FOUNDER_SEATS, useAppState } from "@/lib/store";
import { Badge, Button, H2, Panel, Stat, Tabs, toast, useT } from "@/components/ui";
import { num, tnd } from "@/lib/format";

type Tab = "dashboard" | "voyages" | "mur";

const EMPTY = { event: "", competition: "Ligue des champions CAF", destination: "", dates: "", price: 800, publicPrice: 1600, quota: 200 };

export default function AdminPage() {
  const s = useAppState();
  const t = useT();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState(s.trips[0]?.id ?? "");

  // Données agrégées fictives + actions de la démo
  const cards = { base: 12840, or: 4920, platine: 672 };
  const cardsTotal = cards.base + cards.or + cards.platine + 1;
  const passSubs = s.founderSeatsTaken + 1260 + (s.pass.plan ? 1 : 0);
  const creditPool = 412600 + s.pass.credit;
  const totalBooked = s.trips.reduce((a, b) => a + b.booked, 0);
  const virtualTickets = 8412 + s.tickets.filter((x) => x.mine).length;
  const piggies = 2140 + s.piggies.length;
  const pending = s.tickets.filter((x) => x.status === "en_attente");
  const trip = s.trips.find((x) => x.id === selected);
  const tripBookings = s.bookings.filter((b) => b.tripId === selected);
  const monthly = [1200, 2900, 3400, 2100, 1800, 1650, 2300, 1900, 2600, 1500, 1200, 1900];

  function exportCsv() {
    if (!trip) return;
    const rows = [["Rang", "Voyageur", "Ville", "Crédit utilisé (TND)", "Points", "Complément (TND)", "Statut"], ...tripBookings.map((b) => [b.rank, b.traveler, b.city, b.creditUsed, b.pointsUsed, b.complement, b.status])];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `voyageurs-${trip.destination.split(",")[0].toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Liste des voyageurs exportée (CSV)");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">{t("admin")}</h1>
        <Badge tone="gris">Responsable supporters</Badge>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "dashboard", label: "Tableau de bord" },
          { id: "voyages", label: "Voyages" },
          { id: "mur", label: `Modération${pending.length ? ` (${pending.length})` : ""}` },
        ]}
      />

      {tab === "dashboard" && (
        <>
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
                <span className="flex-1 rounded-lg bg-creme p-2 text-center">🇹🇳 Tunisie <strong>71 %</strong></span>
                <span className="flex-1 rounded-lg bg-creme p-2 text-center">🌍 Diaspora <strong>29 %</strong></span>
              </div>
            </Panel>
            <Panel>
              <H2>Nouvelles cartes par mois (2027, simulé)</H2>
              <div className="flex h-36 items-end gap-1">
                {monthly.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
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
        </>
      )}

      {tab === "voyages" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <H2>Créer un voyage officiel</H2>
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                actions.createTrip(form);
                setForm(EMPTY);
                toast("Voyage publié — notification envoyée aux abonnés");
              }}
            >
              {(
                [
                  ["event", "Événement", "Demi-finale aller — Espérance vs …"],
                  ["competition", "Compétition", ""],
                  ["destination", "Destination", "Alger, Algérie"],
                  ["dates", "Dates", "10 – 12 avril 2027"],
                ] as const
              ).map(([k, l, ph]) => (
                <label key={k} className="block text-xs font-semibold text-sombre/60">
                  {l}
                  <input required className="mt-1 w-full rounded-lg border border-black/10 bg-creme px-3 py-2 text-sm font-normal text-sombre" placeholder={ph} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </label>
              ))}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["price", "Prix (TND)"],
                    ["publicPrice", "Prix public"],
                    ["quota", "Quota"],
                  ] as const
                ).map(([k, l]) => (
                  <label key={k} className="block text-xs font-semibold text-sombre/60">
                    {l}
                    <input type="number" required min={1} className="mt-1 w-full rounded-lg border border-black/10 bg-creme px-2 py-2 text-sm font-normal text-sombre" value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
                  </label>
                ))}
              </div>
              <Button type="submit" className="w-full">Publier et ouvrir les réservations</Button>
            </form>
          </Panel>

          <Panel>
            <H2>Réservations</H2>
            <select className="mb-3 w-full rounded-lg border border-black/10 bg-creme px-3 py-2 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {s.trips.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.destination} — {x.booked}/{x.quota} {x.status === "annule" ? "(annulé)" : ""}
                </option>
              ))}
            </select>
            {trip && (
              <div className="mb-2 text-xs text-sombre/60">
                {trip.event} · {trip.dates} · {tnd(trip.price)} · {trip.booked} réservations (dont {tripBookings.length} nominatives dans la démo)
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-start text-sombre/50">
                  <tr>
                    <th className="py-1 text-start">#</th>
                    <th className="text-start">Voyageur</th>
                    <th className="text-start">Ville</th>
                    <th className="text-end">Crédit</th>
                    <th className="text-end">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {tripBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="py-1.5">{b.rank}</td>
                      <td>{b.traveler}</td>
                      <td>{b.city}</td>
                      <td className="text-end">{tnd(b.creditUsed)}</td>
                      <td className="text-end">{b.status === "confirmee" ? <Badge tone="vert">confirmée</Badge> : <Badge tone="sang">reportée</Badge>}</td>
                    </tr>
                  ))}
                  {tripBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-3 text-center text-sombre/50">Aucune réservation nominative.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="dark"
                onClick={() => {
                  actions.allocate(selected);
                  toast("Attribution lancée selon la règle publique");
                }}
              >
                Lancer l'attribution
              </Button>
              <Button variant="ghost" onClick={exportCsv}>Exporter (CSV)</Button>
            </div>
            <p className="mt-2 text-[11px] text-sombre/50">Règle : 1) Voyageur+, 2) ancienneté dans le Pass, 3) Points Bâtisseur. Liste envoyée à l'agence agréée.</p>
          </Panel>
        </div>
      )}

      {tab === "mur" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <H2>File de modération</H2>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-sang" checked={s.manualModeration} onChange={(e) => actions.setManualModeration(e.target.checked)} />
              Validation humaine obligatoire pour les nouveaux pseudos
            </label>
            {pending.length === 0 && <p className="text-sm text-sombre/50">Aucun pseudo en attente.</p>}
            <ul className="space-y-2">
              {pending.map((x) => (
                <li key={x.id} className="rounded-xl bg-creme p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <strong>{x.pseudo}</strong>
                    {x.autoFlag && <Badge tone="sang">Signalé par le filtre</Badge>}
                  </div>
                  <div className="text-xs text-sombre/60">
                    {x.city}, {x.country} · {x.formula} · EST – {s.matches.find((m) => m.id === x.matchId)?.opponent}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button onClick={() => actions.moderate(x.id, true)}>Valider</Button>
                    <Button variant="ghost" onClick={() => actions.moderate(x.id, false)}>Refuser</Button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <H2>Décisions</H2>
            <ul className="divide-y divide-black/5 text-sm">
              {s.tickets
                .filter((x) => x.status !== "en_attente")
                .map((x) => (
                  <li key={x.id} className="flex items-center justify-between py-2">
                    <span>
                      {x.pseudo} <span className="text-xs text-sombre/50">· {x.city}</span>
                    </span>
                    {x.status === "valide" ? <Badge tone="vert">affiché</Badge> : <Badge tone="sang">refusé</Badge>}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-[11px] text-sombre/50">Filtre automatique de mots, puis validation humaine avant tout affichage public (écran du stade si le club l'autorise).</p>
          </Panel>
        </div>
      )}
    </div>
  );
}
