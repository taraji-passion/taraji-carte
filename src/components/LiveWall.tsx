"use client";

import { useEffect, useMemo, useState } from "react";
import { CHEERS, CITIES, cityInfo, MAP, project, randomCity, randomPseudo } from "@/lib/geo";
import { useAppState } from "@/lib/store";
import { num } from "@/lib/format";

interface Entry {
  id: string;
  pseudo: string;
  city: string;
  flag: string;
  cheer: string;
  premium: boolean;
  mine?: boolean;
}

const START: Record<string, number> = {
  Tunis: 2410, Sfax: 610, Sousse: 580, Bizerte: 340, Gabès: 190, Zarzis: 160, "Ben Arous": 420,
  Paris: 980, Lyon: 520, Marseille: 390, Milan: 410, Rome: 230, Berlin: 160, Bruxelles: 170, Londres: 90, Genève: 80,
  Montréal: 240, Doha: 260, Dubaï: 170, Riyad: 60, Tripoli: 50,
};

function makeEntry(id: string): Entry {
  const c = randomCity();
  return { id, pseudo: randomPseudo(), city: c.city, flag: c.flag, cheer: CHEERS[Math.floor(Math.random() * CHEERS.length)], premium: Math.random() < 0.2 };
}

/** Mur des supporters en direct (simulation locale) : compteur, carte et flux. */
export function LiveWall({ matchId }: { matchId: string }) {
  const s = useAppState();
  const [entries, setEntries] = useState<Entry[]>(() => Array.from({ length: 5 }, (_, i) => makeEntry(`seed-${i}`)));
  const [counts, setCounts] = useState<Record<string, number>>(START);

  useEffect(() => {
    const timer = setInterval(() => {
      const e = makeEntry(`live-${Date.now()}`);
      setEntries((prev) => [e, ...prev].slice(0, 12));
      setCounts((prev) => ({ ...prev, [e.city]: (prev[e.city] ?? 0) + 1 + Math.floor(Math.random() * 3) }));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const mine: Entry[] = s.tickets
    .filter((x) => x.status === "valide" && x.matchId === matchId)
    .map((x) => ({ id: x.id, pseudo: x.pseudo, city: x.city, flag: cityInfo(x.city)?.flag ?? "🌍", cheer: x.mine ? "C'est moi ! 🎉" : "", premium: x.formula === "Premium", mine: x.mine }));
  const feed = [...mine, ...entries].slice(0, 7);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) + mine.length;

  const countries = useMemo(() => {
    const agg: Record<string, { n: number; flag: string }> = {};
    for (const c of CITIES) agg[c.country] = { n: (agg[c.country]?.n ?? 0) + (counts[c.city] ?? 0), flag: c.flag };
    return Object.entries(agg).sort((a, b) => b[1].n - a[1].n);
  }, [counts]);
  const myCity = cityInfo(s.persona.city);
  const iAmIn = mine.some((m) => m.mine);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl bg-sombre text-white shadow-lg">
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="flex items-center gap-2 text-xs font-bold text-or">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sang" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sang" />
            </span>
            EN DIRECT
          </span>
          <span className="text-xs text-white/50">{countries.length} pays</span>
        </div>
        <div className="px-4 pb-2">
          <span className="text-3xl font-black">{num(total)}</span>
          <span className="ms-2 text-sm text-white/60">supporters virtuels</span>
        </div>
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="block w-full" role="img" aria-label="Carte des supporters virtuels">
          {CITIES.map((c) => {
            const { x, y } = project(c.lat, c.lon);
            const r = Math.max(1.6, Math.sqrt(counts[c.city] ?? 0) / 7);
            return (
              <g key={c.city}>
                <circle cx={x} cy={y} r={r} fill="#F2B705" fillOpacity={0.3} />
                <circle cx={x} cy={y} r={1.3} fill="#F2B705" />
              </g>
            );
          })}
          {myCity && iAmIn && (() => {
            const p = project(myCity.lat, myCity.lon);
            return (
              <g>
                <circle className="ping-dot" cx={p.x} cy={p.y} r={3} fill="#B5121B" />
                <circle cx={p.x} cy={p.y} r={2.6} fill="#B5121B" stroke="#fff" strokeWidth={0.8} />
              </g>
            );
          })()}
        </svg>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 pt-1">
          {countries.slice(0, 6).map(([country, v]) => (
            <span key={country} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs">
              {v.flag} {num(v.n)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {feed.map((e) => (
          <div key={e.id} className={`wall-in flex items-center gap-3 rounded-2xl px-3 py-2.5 ${e.mine ? "bg-or/25 ring-2 ring-or" : "bg-white"}`}>
            <span className="text-xl">{e.flag}</span>
            <span className="min-w-0 flex-1">
              <span className={`block truncate text-sm font-bold ${e.premium ? "text-[#9a7400]" : ""}`}>{e.pseudo}</span>
              <span className="block truncate text-xs text-sombre/50">
                {e.city}
                {e.cheer ? ` · ${e.cheer}` : ""}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
