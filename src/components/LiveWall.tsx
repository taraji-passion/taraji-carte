"use client";

import { useEffect, useMemo, useState } from "react";
import { CHEERS, CITIES, cityInfo, MAP, project, randomCity, randomPseudo } from "@/lib/geo";
import { useAppState } from "@/lib/store";
import { num } from "@/lib/format";
import { H2, Panel, useT } from "./ui";

interface Entry {
  id: string;
  pseudo: string;
  city: string;
  flag: string;
  cheer: string;
  formula: "Standard" | "Virage" | "Premium";
  mine?: boolean;
}

function seed(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => {
    const c = randomCity();
    return { id: `seed-${i}`, pseudo: randomPseudo(), city: c.city, flag: c.flag, cheer: CHEERS[i % CHEERS.length], formula: i % 7 === 0 ? "Premium" : i % 3 === 0 ? "Virage" : "Standard" };
  });
}

function initialCounts(): Record<string, number> {
  // répartition de départ : environ 8 400 supporters virtuels
  const base: Record<string, number> = {
    Tunis: 2410, Sfax: 610, Sousse: 580, Bizerte: 340, Gabès: 190, Zarzis: 160, "Ben Arous": 420,
    Paris: 980, Lyon: 520, Marseille: 390, Milan: 410, Rome: 230, Berlin: 160, Bruxelles: 170, Londres: 90, Genève: 80,
    Montréal: 240, Doha: 260, Dubaï: 170, Riyad: 60, Tripoli: 50,
  };
  return base;
}

export function LiveWall({ matchId }: { matchId: string }) {
  const s = useAppState();
  const t = useT();
  const match = s.matches.find((m) => m.id === matchId) ?? s.matches[0];
  const [entries, setEntries] = useState<Entry[]>(() => seed(8));
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const c = randomCity();
      const e: Entry = {
        id: `live-${Date.now()}`,
        pseudo: randomPseudo(),
        city: c.city,
        flag: c.flag,
        cheer: CHEERS[Math.floor(Math.random() * CHEERS.length)],
        formula: Math.random() < 0.15 ? "Premium" : Math.random() < 0.35 ? "Virage" : "Standard",
      };
      setEntries((prev) => [e, ...prev].slice(0, 30));
      setCounts((prev) => ({ ...prev, [c.city]: (prev[c.city] ?? 0) + 1 + Math.floor(Math.random() * 3) }));
    }, 2200);
    return () => clearInterval(timer);
  }, [paused]);

  // Mes pseudos validés (achetés dans l'app) en tête du mur
  const mine: Entry[] = s.tickets
    .filter((x) => x.mine && x.status === "valide" && x.matchId === match.id)
    .map((x) => ({ id: x.id, pseudo: x.pseudo, city: x.city, flag: cityInfo(x.city)?.flag ?? "🌍", cheer: "C'est moi ! 🎉", formula: x.formula, mine: true }));
  // Pseudos validés par la modération (autres supporters)
  const moderated: Entry[] = s.tickets
    .filter((x) => !x.mine && x.status === "valide" && x.matchId === match.id)
    .map((x) => ({ id: x.id, pseudo: x.pseudo, city: x.city, flag: cityInfo(x.city)?.flag ?? "🌍", cheer: "", formula: x.formula }));

  const merged = [...mine, ...moderated, ...entries];
  const total = Object.values(counts).reduce((a, b) => a + b, 0) + mine.length + moderated.length;

  const byCountry = useMemo(() => {
    const agg: Record<string, { n: number; flag: string }> = {};
    for (const c of CITIES) {
      const n = counts[c.city] ?? 0;
      agg[c.country] = { n: (agg[c.country]?.n ?? 0) + n, flag: c.flag };
    }
    return Object.entries(agg).sort((a, b) => b[1].n - a[1].n);
  }, [counts]);
  const max = byCountry[0]?.[1].n ?? 1;
  const myCity = cityInfo(s.persona.city);

  return (
    <div className="space-y-4">
      <Panel className="bg-sombre text-creme ring-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-or">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-sang ${paused ? "" : "animate-ping"}`} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sang" />
              </span>
              {paused ? "EN PAUSE" : "EN DIRECT"} · {t("liveWall")}
            </div>
            <div className="mt-1 font-bold">EST – {match.opponent}</div>
            <div className="text-xs text-creme/60">{match.competition}</div>
          </div>
          <div className="text-end">
            <div className="text-2xl font-black text-or">{num(total)}</div>
            <div className="text-[11px] text-creme/60">supporters virtuels</div>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-creme/60">{byCountry.filter(([, v]) => v.n > 0).length} pays · {Object.values(counts).filter((n) => n > 0).length} villes représentées</div>
      </Panel>

      {/* Carte */}
      <Panel className="overflow-hidden p-0">
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="block w-full bg-[#241a1a]" role="img" aria-label="Carte des supporters virtuels">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={(i * MAP.w) / 7} y1={0} x2={(i * MAP.w) / 7} y2={MAP.h} stroke="#ffffff10" />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i * MAP.h) / 4} x2={MAP.w} y2={(i * MAP.h) / 4} stroke="#ffffff10" />
          ))}
          {CITIES.map((c) => {
            const { x, y } = project(c.lat, c.lon);
            const n = counts[c.city] ?? 0;
            const r = Math.max(1.5, Math.sqrt(n) / 7);
            return (
              <g key={c.city}>
                <circle cx={x} cy={y} r={r} fill="#F2B705" fillOpacity={0.35} />
                <circle cx={x} cy={y} r={1.4} fill="#F2B705" />
                {n > 300 && c.country !== "Tunisie" && (
                  <text x={x + r + 1} y={y + 2} fontSize={5.5} fill="#FBF6EC" fillOpacity={0.8}>{c.city}</text>
                )}
              </g>
            );
          })}
          {(() => {
            const tn = project(36.8, 10.18);
            return <text x={tn.x + 6} y={tn.y + 12} fontSize={6} fill="#FBF6EC" fontWeight={700}>Tunisie</text>;
          })()}
          {myCity && mine.length > 0 && (() => {
            const p = project(myCity.lat, myCity.lon);
            return (
              <g>
                <circle className="ping-dot" cx={p.x} cy={p.y} r={3} fill="#B5121B" />
                <circle cx={p.x} cy={p.y} r={2.5} fill="#B5121B" stroke="#fff" strokeWidth={0.8} />
              </g>
            );
          })()}
        </svg>
        <div className="space-y-1.5 p-3">
          {byCountry.slice(0, 6).map(([country, v]) => (
            <div key={country} className="flex items-center gap-2 text-xs">
              <span className="w-32 truncate">{v.flag} {country}</span>
              <div className="h-2 flex-1 rounded-full bg-sombre/10">
                <div className="h-2 rounded-full bg-sang transition-all" style={{ width: `${(v.n / max) * 100}%` }} />
              </div>
              <span className="w-12 text-end font-semibold">{num(v.n)}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Flux */}
      <Panel>
        <H2 right={<button className="text-xs text-sang" onClick={() => setPaused(!paused)}>{paused ? "▶︎ Reprendre" : "⏸ Pause"}</button>}>Le mur</H2>
        <ul className="space-y-2">
          {merged.slice(0, 14).map((e) => (
            <li
              key={e.id}
              className={`wall-in flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${e.mine ? "bg-or/30 ring-2 ring-or" : "bg-creme"}`}
            >
              <span className="text-lg">{e.flag}</span>
              <div className="min-w-0 flex-1">
                <span className={`font-bold ${e.formula === "Premium" ? "text-[#9a7400]" : e.formula === "Virage" ? "text-sang" : ""}`}>{e.pseudo}</span>
                <span className="text-sombre/50"> · {e.city}</span>
                {e.cheer && <div className="truncate text-xs text-sombre/70">{e.cheer}</div>}
              </div>
              {e.formula !== "Standard" && <span className="text-[10px] font-semibold text-sombre/50">{e.formula}</span>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-sombre/50">Pseudos filtrés automatiquement puis validés par un modérateur avant affichage (simulation locale ; temps réel en V1).</p>
      </Panel>
    </div>
  );
}
