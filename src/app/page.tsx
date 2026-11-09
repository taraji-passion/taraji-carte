"use client";

import Link from "next/link";
import { useAppState } from "@/lib/store";
import { useT } from "@/components/ui";
import { num, tnd } from "@/lib/format";
import type { Key } from "@/lib/i18n";

interface Tile {
  href: string;
  key: Key;
  icon: string;
  info: string;
  tone: string;
}

export default function HomePage() {
  const s = useAppState();
  const t = useT();
  const role = s.session?.role ?? "supporter";
  const pending = s.tickets.filter((x) => x.status === "en_attente").length;
  const activePiggies = s.piggies.filter((p) => !p.used);

  const supporter: Tile[] = [
    { href: "/carte", key: "myCard", icon: "💳", info: `Niveau ${s.card.level === "base" ? "Base" : s.card.level === "or" ? "Or" : "Platine"} · n° ${s.card.number}`, tone: "bg-sang text-white" },
    { href: "/pass", key: "passTitle", icon: "💰", info: s.pass.plan ? `Crédit ${tnd(s.pass.credit)}` : `${s.founderSeatsTaken} / 2 000 Fondateurs`, tone: "bg-or text-sombre" },
    { href: "/voyages", key: "catalog", icon: "✈️", info: `${s.trips.filter((x) => x.status === "publie").length} voyages ouverts`, tone: "bg-white" },
    { href: "/billets", key: "virtualSeat", icon: "🎟️", info: "17 à 34 TND · sans accès au stade", tone: "bg-white" },
    { href: "/mur", key: "wall", icon: "📣", info: `EST – ${s.matches[0].opponent}`, tone: "bg-white" },
    { href: "/solidaire", key: "solidarity", icon: "❤️", info: `${num(s.solidarityCount)} places offertes`, tone: "bg-white" },
    { href: "/famille", key: "piggy", icon: "🐷", info: activePiggies.length ? `${activePiggies.length} tirelire(s) active(s)` : "Rentrée, Aïd, Voyage", tone: "bg-white" },
    { href: "/points", key: "points", icon: "🏗️", info: `${s.points.balance} points`, tone: "bg-white" },
  ];
  const club: Tile[] = [
    { href: "/admin", key: "dashboard", icon: "📈", info: "Cartes, Pass, voyages, billets", tone: "bg-sang text-white" },
    { href: "/admin/voyages", key: "tripsAdmin", icon: "✈️", info: `${s.trips.length} voyages · export CSV`, tone: "bg-or text-sombre" },
    { href: "/admin/moderation", key: "moderation", icon: "🛡️", info: pending ? `${pending} pseudo(s) en attente` : "Aucun pseudo en attente", tone: "bg-white" },
    { href: "/mur", key: "wall", icon: "📣", info: "Vue publique du mur", tone: "bg-white" },
  ];
  const president: Tile[] = [
    { href: "/simulateur", key: "simulator", icon: "📊", info: "Revenus annuels estimés en TND", tone: "bg-sang text-white" },
    { href: "/admin", key: "dashboard", icon: "📈", info: "Indicateurs de la communauté", tone: "bg-or text-sombre" },
    { href: "/mur", key: "wall", icon: "📣", info: "Les supporters en direct", tone: "bg-white" },
  ];
  const tiles = role === "club" ? club : role === "president" ? president : supporter;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-sombre to-[#3a1a1a] p-5 text-creme shadow-lg">
        <div className="text-sm text-or">{t("hello")},</div>
        <div className="text-2xl font-black">{s.session?.name}</div>
        <div className="mt-1 text-xs text-creme/60">
          {role === "supporter" ? `${s.persona.city} · ${s.persona.chapter}` : role === "club" ? "Espace du club" : "Espace du président"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`flex min-h-32 flex-col justify-between rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98] ${tile.tone}`}
          >
            <span className="text-3xl">{tile.icon}</span>
            <span>
              <span className="block font-bold leading-tight">{t(tile.key)}</span>
              <span className="mt-0.5 block text-[11px] opacity-70">{tile.info}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
