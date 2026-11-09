"use client";

import Link from "next/link";
import { useAppState } from "@/lib/store";
import { useT } from "@/components/ui";
import { CountUp } from "@/components/fx";
import { SupporterCard } from "@/components/SupporterCard";
import { tnd } from "@/lib/format";
import type { Key } from "@/lib/i18n";

interface Tile {
  href: string;
  key: Key;
  icon: string;
  info: string;
  grad: string; // dégradé de la pastille d'icône
  big?: boolean;
}

const G = {
  sang: "from-[#e0303a] to-[#8e0e15]",
  or: "from-[#ffd84d] to-[#c99700]",
  nuit: "from-[#4a3535] to-[#1C1414]",
  vert: "from-[#34d399] to-[#047857]",
  bleu: "from-[#60a5fa] to-[#1d4ed8]",
  rose: "from-[#fb7185] to-[#be123c]",
  violet: "from-[#a78bfa] to-[#6d28d9]",
};

export default function HomePage() {
  const s = useAppState();
  const t = useT();
  const role = s.session?.role ?? "supporter";
  const pending = s.tickets.filter((x) => x.status === "en_attente").length;
  const activePiggies = s.piggies.filter((p) => !p.used);
  const supporter: Tile[] = [
    { href: "/pass", key: "passTitle", icon: "💰", info: s.pass.plan ? `Crédit ${tnd(s.pass.credit)}` : `${s.founderSeatsTaken} / 2 000 Fondateurs`, grad: G.or, big: true },
    { href: "/voyages", key: "catalog", icon: "✈️", info: `${s.trips.filter((x) => x.status === "publie").length} voyages ouverts`, grad: G.bleu },
    { href: "/billets", key: "virtualSeat", icon: "🎟️", info: "17 à 34 TND", grad: G.sang },
    { href: "/mur", key: "wall", icon: "📣", info: `EST – ${s.matches[0].opponent}`, grad: G.rose },
    { href: "/solidaire", key: "solidarity", icon: "❤️", info: `${s.solidarityCount.toLocaleString("fr-FR")} offertes`, grad: G.sang },
    { href: "/famille", key: "piggy", icon: "🐷", info: activePiggies.length ? `${activePiggies.length} active(s)` : "Rentrée, Aïd, Voyage", grad: G.vert },
    { href: "/points", key: "points", icon: "🏗️", info: `${s.points.balance} points`, grad: G.violet },
  ];
  const admin: Tile[] = [
    { href: "/admin", key: "dashboard", icon: "📈", info: "Cartes, Pass, voyages, billets", grad: G.sang, big: true },
    { href: "/simulateur", key: "simulator", icon: "📊", info: "Revenus annuels en TND", grad: G.or },
    { href: "/admin/voyages", key: "tripsAdmin", icon: "✈️", info: `${s.trips.length} voyages · CSV`, grad: G.bleu },
    { href: "/admin/moderation", key: "moderation", icon: "🛡️", info: pending ? `${pending} en attente` : "File vide", grad: G.rose },
    { href: "/mur", key: "wall", icon: "📣", info: "Vue publique", grad: G.vert },
  ];
  const tiles = role === "admin" ? admin : supporter;

  return (
    <div className="space-y-5">
      {/* Bandeau héros */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#5a1016_0%,#1C1414_60%)] px-4 pb-6 pt-5 text-creme">
        <div className="pointer-events-none absolute -end-20 -top-20 h-60 w-60 rounded-full bg-or/10 blur-3xl" />
        <div className="relative">
          <div className="text-sm text-or">{t("hello")} 👋</div>
          <div className="text-2xl font-black">{s.session?.name}</div>
          <div className="text-xs text-creme/60">{role === "supporter" ? `${s.persona.city} · ${s.persona.chapter}` : "Espace Admin du club"}</div>
        </div>

        {role === "supporter" ? (
          <>
            <div className="relative mt-4">
              <SupporterCard />
            </div>
            <div className="relative mt-1 grid grid-cols-3 gap-2 text-center">
              <Kpi label="Crédit voyage" value={<CountUp value={s.pass.credit} format={(n) => tnd(n)} />} />
              <Kpi label="Points" value={<CountUp value={s.points.balance} />} />
              <Kpi label="Supporters en direct" value={<CountUp value={8412} />} />
            </div>
          </>
        ) : (
          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <Kpi label="Cartes actives" value={<CountUp value={18433} />} big />
            <Kpi label="Abonnés au Pass" value={<CountUp value={s.founderSeatsTaken + 1260} />} big />
            <Kpi label="Crédit voyage cumulé" value={<CountUp value={412600 + s.pass.credit} format={(n) => tnd(n)} />} big />
            <Kpi label="Part diaspora" value={<CountUp value={29} format={(n) => `${Math.round(n)} %`} />} big />
          </div>
        )}
      </section>

      <Link href="/mur" className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sang opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-sang" />
        </span>
        <span className="flex-1 text-sm">
          <strong>En direct</strong> · EST – {s.matches[0].opponent} · supporters de 21 pays
        </span>
        <span className="text-sombre/30 rtl:rotate-180">›</span>
      </Link>

      <div className="stagger grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] ${tile.big ? "col-span-2 min-h-28 flex-row items-center gap-4" : "min-h-36"}`}
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-md ${tile.grad}`}>{tile.icon}</span>
            <span className={tile.big ? "flex-1" : "mt-3"}>
              <span className="block font-bold leading-tight">{t(tile.key)}</span>
              <span className="mt-0.5 block text-[11px] text-sombre/60">{tile.info}</span>
            </span>
            {tile.big && <span className="text-xl text-sombre/30 transition group-hover:translate-x-1 rtl:rotate-180">›</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, big }: { label: string; value: React.ReactNode; big?: boolean }) {
  return (
    <div className="glass rounded-2xl px-2 py-2.5">
      <div className={`font-black text-or ${big ? "text-xl" : "text-base"}`}>{value}</div>
      <div className="text-[10px] text-creme/60">{label}</div>
    </div>
  );
}
