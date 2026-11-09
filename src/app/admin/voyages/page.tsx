"use client";

import { useState } from "react";
import { actions, useAppState } from "@/lib/store";
import { Badge, Button, H2, Panel, Screen, StaffOnly, toast, useT } from "@/components/ui";
import { tnd } from "@/lib/format";

const EMPTY = { event: "", competition: "Ligue des champions CAF", destination: "", dates: "", price: 800, publicPrice: 1600, quota: 200 };

export default function AdminVoyagesPage() {
  const s = useAppState();
  const t = useT();
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState(s.trips[0]?.id ?? "");
  const trip = s.trips.find((x) => x.id === selected);
  const tripBookings = s.bookings.filter((b) => b.tripId === selected);

  function exportCsv() {
    if (!trip) return;
    const rows = [
      ["Rang", "Voyageur", "Ville", "Crédit utilisé (TND)", "Points", "Complément (TND)", "Statut"],
      ...tripBookings.map((b) => [b.rank, b.traveler, b.city, b.creditUsed, b.pointsUsed, b.complement, b.status]),
    ];
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
    <StaffOnly>
      <Screen title={t("tripsAdmin")} icon="✈️" subtitle="Créer, attribuer, exporter pour l'agence">
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
                  <input
                    required
                    className="mt-1 w-full rounded-lg border border-black/10 bg-creme px-3 py-2 text-sm font-normal text-sombre"
                    placeholder={ph}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
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
                    <input
                      type="number"
                      required
                      min={1}
                      className="mt-1 w-full rounded-lg border border-black/10 bg-creme px-2 py-2 text-sm font-normal text-sombre"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                    />
                  </label>
                ))}
              </div>
              <Button type="submit" className="w-full">
                Publier et ouvrir les réservations
              </Button>
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
                <thead className="text-sombre/50">
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
                      <td colSpan={5} className="py-3 text-center text-sombre/50">
                        Aucune réservation nominative.
                      </td>
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
              <Button variant="ghost" onClick={exportCsv}>
                Exporter (CSV)
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-sombre/50">Règle : 1) Voyageur+, 2) ancienneté dans le Pass, 3) Points Bâtisseur. Liste envoyée à l'agence agréée.</p>
          </Panel>
        </div>
      </Screen>
    </StaffOnly>
  );
}
