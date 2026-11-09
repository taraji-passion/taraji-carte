"use client";

import { useState } from "react";
import { actions, useAppState } from "@/lib/store";
import { Badge, Button, Card, List, PageHeader, Progress, Row, Sheet, toast, useT } from "@/components/ui";
import { pct, tnd } from "@/lib/format";

const EMPTY = { event: "", competition: "Ligue des champions CAF", destination: "", dates: "", price: 800, publicPrice: 1600, quota: 200 };

export default function AdminVoyagesPage() {
  const s = useAppState();
  const t = useT();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [openId, setOpenId] = useState<string | null>(null);
  const trip = s.trips.find((x) => x.id === openId);
  const bookings = s.bookings.filter((b) => b.tripId === openId);

  function exportCsv() {
    if (!trip) return;
    const rows = [["Rang", "Voyageur", "Ville", "Crédit (TND)", "Complément (TND)", "Statut"], ...bookings.map((b) => [b.rank, b.traveler, b.city, b.creditUsed, b.complement, b.status])];
    const blob = new Blob(["﻿" + rows.map((r) => r.join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `voyageurs-${trip.destination.split(",")[0].toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Liste exportée pour l'agence");
  }

  return (
    <>
      <PageHeader title={t("tripsAdmin")} right={<Button onClick={() => setCreating(true)}>+ Nouveau</Button>} />

      <div className="grid gap-3 md:grid-cols-2">
        {s.trips.map((x) => (
          <Card key={x.id} onClick={() => setOpenId(x.id)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-bold">{x.destination}</div>
                <div className="truncate text-xs text-sombre/50">{x.dates}</div>
              </div>
              <span className="font-black">{tnd(x.price)}</span>
            </div>
            <div className="mt-3">
              <Progress value={pct(x.booked, x.quota)} color="bg-sang" label="Remplissage" />
            </div>
            <div className="mt-1 text-xs text-sombre/50">
              {x.booked} / {x.quota} places réservées
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={creating} onClose={() => setCreating(false)} title="Nouveau voyage officiel">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            actions.createTrip(form);
            setForm(EMPTY);
            setCreating(false);
            toast("Voyage publié, les abonnés sont prévenus");
          }}
        >
          {(
            [
              ["destination", "Destination (ex. Alger, Algérie)"],
              ["event", "Match (ex. Demi-finale aller)"],
              ["dates", "Dates (ex. 10 – 12 avril 2027)"],
            ] as const
          ).map(([k, ph]) => (
            <input key={k} required className="w-full rounded-2xl bg-white px-4 py-3" placeholder={ph} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["price", "Prix"],
                ["publicPrice", "Prix public"],
                ["quota", "Places"],
              ] as const
            ).map(([k, l]) => (
              <label key={k} className="text-xs text-sombre/50">
                {l}
                <input type="number" required min={1} className="mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sombre" value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
              </label>
            ))}
          </div>
          <Button type="submit" className="mt-2 w-full">
            Publier
          </Button>
        </form>
      </Sheet>

      <Sheet open={!!trip} onClose={() => setOpenId(null)} title={trip?.destination}>
        {trip && (
          <>
            <p className="-mt-3 mb-4 text-sm text-sombre/50">
              {trip.event} · {trip.dates}
            </p>
            <List>
              {bookings.length === 0 && <Row title="Aucune réservation nominative" />}
              {bookings.map((b) => (
                <Row key={b.id} icon={<span className="text-sm font-bold">{b.rank}</span>} title={b.traveler} sub={`${b.city} · crédit ${tnd(b.creditUsed)}`} right={<Badge tone={b.status === "confirmee" ? "vert" : "sang"}>{b.status === "confirmee" ? "confirmée" : "reportée"}</Badge>} />
              ))}
            </List>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="dark"
                onClick={() => {
                  actions.allocate(trip.id);
                  toast("Places attribuées selon la règle");
                }}
              >
                Attribuer
              </Button>
              <Button variant="soft" onClick={exportCsv}>
                Exporter CSV
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-sombre/40">Priorité : Voyageur+, puis ancienneté, puis points</p>
          </>
        )}
      </Sheet>
    </>
  );
}
