"use client";

import { useRef, useState, type PointerEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAppState, type Level } from "@/lib/store";
import { useT } from "./ui";

const LEVEL_STYLE: Record<Level, { bg: string; text: string; accent: string }> = {
  base: { bg: "linear-gradient(135deg, #3d2b2b 0%, #1C1414 55%, #2b1d1d 100%)", text: "text-creme", accent: "#F2B705" },
  or: { bg: "linear-gradient(135deg, #d11a24 0%, #B5121B 40%, #6b0a10 100%)", text: "text-creme", accent: "#F2B705" },
  platine: { bg: "linear-gradient(135deg, #f4f1ea 0%, #c9c3b6 45%, #8f887b 100%)", text: "text-sombre", accent: "#B5121B" },
};

/** Carte Supporter en 3D : inclinaison au doigt ou à la souris, reflet holographique, retournement au toucher. */
export function SupporterCard() {
  const s = useAppState();
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50, active: false });
  const style = LEVEL_STYLE[s.card.level];
  const levelName = t(s.card.level === "base" ? "levelBase" : s.card.level === "or" ? "levelOr" : "levelPlatine");
  const qrValue = `TARAJI-ID:${s.card.number}:${s.card.level.toUpperCase()}:${s.persona.name}`;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    setTilt({ x: (py - 50) / -6, y: (px - 50) / 5, px, py, active: true });
  }

  const transform = `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`;

  return (
    <div className="card-3d select-none">
      <div
        ref={ref}
        className="card-inner cursor-pointer"
        style={{ transform, transition: tilt.active ? "transform 0.1s" : undefined }}
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0, px: 50, py: 50, active: false })}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        aria-label="Retourner la carte"
      >
        {/* Recto */}
        <div className={`card-face relative aspect-[1.586] overflow-hidden rounded-3xl p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55)] ${style.text}`} style={{ background: style.bg }}>
          <div className="pointer-events-none absolute inset-y-0 end-0 flex w-28 opacity-[0.13]">
            <div className="flex-1 bg-or" />
            <div className="flex-1 bg-sang" />
            <div className="flex-1 bg-or" />
            <div className="flex-1 bg-sang" />
          </div>
          <div className="pointer-events-none absolute -bottom-16 -start-10 h-48 w-48 rounded-full blur-3xl" style={{ background: `${style.accent}33` }} />
          <div className={`holo ${tilt.active ? "" : "holo-idle"}`} style={tilt.active ? { backgroundPosition: `${tilt.px}% ${tilt.py}%` } : undefined} />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] opacity-75">{t("club")}</div>
                <div className="mt-1 text-[26px] font-black leading-none tracking-tight">
                  TARAJI <span style={{ color: style.accent }}>{levelName.toUpperCase()}</span>
                </div>
              </div>
              <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full ring-2 ring-or">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-sang" />
                  <div className="flex-1 bg-or" />
                  <div className="flex-1 bg-sang" />
                  <div className="flex-1 bg-or" />
                </div>
                <span className="relative text-[11px] font-black text-white drop-shadow">EST</span>
              </div>
            </div>

            {/* Puce */}
            <div className="h-8 w-11 rounded-md bg-gradient-to-br from-[#f7d774] via-[#d4a017] to-[#a67c00] opacity-90 ring-1 ring-black/20">
              <div className="mx-auto mt-1.5 h-5 w-7 rounded-sm border border-black/25" />
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-lg font-bold">{s.persona.name}</div>
                <div className="font-mono text-sm tracking-[0.2em] opacity-90">N° {String(s.card.number).padStart(4, "0")}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.card.founder && <span className="rounded-full bg-or px-2 py-0.5 text-[10px] font-bold text-sombre">{t("founderEdition")}</span>}
                  {s.pass.founder && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur">✈️ Fondateur 108</span>}
                </div>
              </div>
              <div className="shrink-0 rounded-lg bg-white p-1.5 shadow-lg">
                <QRCodeSVG value={qrValue} size={64} fgColor="#1C1414" level="M" />
              </div>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className="card-face card-back overflow-hidden rounded-3xl bg-sombre p-5 text-creme shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55)]">
          <div className="flex h-full items-center gap-4">
            <div className="rounded-xl bg-white p-2">
              <QRCodeSVG value={qrValue} size={130} fgColor="#1C1414" level="M" />
            </div>
            <div className="min-w-0 space-y-1 text-xs">
              <div className="text-sm font-bold text-or">Taraji ID</div>
              <div>
                {t("chapter")} : <strong>{s.persona.chapter}</strong>
              </div>
              <div>Depuis le {s.card.since}</div>
              <div className="opacity-70">Valable 1 an · rappel 30 jours avant</div>
              <div className="pt-2 text-[10px] leading-snug opacity-60">{t("noVote")}</div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-sombre/50">Touche la carte pour la retourner · QR code consultable hors ligne</p>
    </div>
  );
}
