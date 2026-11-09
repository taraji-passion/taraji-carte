"use client";

import { QRCodeSVG } from "qrcode.react";
import { actions, CHAPTERS, LEVELS, useAppState, type Level } from "@/lib/store";
import { askPayment, H2, Notice, Panel, Screen, toast, useT } from "@/components/ui";
import { tnd } from "@/lib/format";

const LEVEL_STYLE: Record<Level, string> = {
  base: "from-[#3a2a2a] via-sombre to-[#2b1d1d]",
  or: "from-sang via-[#8e0e15] to-[#5c0a0f]",
  platine: "from-[#e4dfd3] via-[#b9b2a3] to-[#8a8376]",
};

export default function CartePage() {
  const s = useAppState();
  const t = useT();
  const levelName = (l: Level) => t(l === "base" ? "levelBase" : l === "or" ? "levelOr" : "levelPlatine");
  const qrValue = `TARAJI-ID:${s.card.number}:${s.card.level.toUpperCase()}:${s.persona.name}`;
  const dark = s.card.level !== "platine";

  async function changeLevel(l: Level) {
    if (l === s.card.level) return;
    const ok = await askPayment(`Carte Supporter ${levelName(l)}`, LEVELS[l].price, [
      "Abonnement annuel, rappel 30 jours avant le renouvellement",
      "La carte ne donne aucun droit statutaire (pas de droit de vote)",
      s.persona.diaspora ? "Paiement en devise accepté (diaspora)" : "Paiement depuis ton portefeuille MyTaraji",
    ]);
    if (ok) {
      actions.setLevel(l);
      toast(`Carte mise à jour : niveau ${levelName(l)}`);
    }
  }

  return (
    <Screen title={t("myCard")} icon="💳" subtitle="Niveau, QR code, avantages et chapitre">

      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-xl ${LEVEL_STYLE[s.card.level]} ${dark ? "text-creme" : "text-sombre"}`}>
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-or/25 blur-2xl" />
        <div className="pointer-events-none absolute inset-y-0 end-0 flex w-24 opacity-15">
          <div className="flex-1 bg-or" />
          <div className="flex-1 bg-sang" />
          <div className="flex-1 bg-or" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-80">{t("club")}</div>
            <div className="mt-1 text-2xl font-black tracking-tight">TARAJI {levelName(s.card.level).toUpperCase()}</div>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-b from-sang from-50% to-or to-50% text-xs font-black text-white ring-2 ring-or">
            EST
          </span>
        </div>
        <div className="relative mt-4 flex items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-lg font-bold">{s.persona.name}</div>
            <div className="text-sm opacity-90">
              {t("member")} {String(s.card.number).padStart(4, "0")}
            </div>
            {s.card.founder && (
              <div className="inline-block rounded-full bg-or px-2 py-0.5 text-[11px] font-bold text-sombre">{t("founderEdition")}</div>
            )}
            <div className="text-xs opacity-85">
              {t("chapter")} : {s.persona.chapter}
            </div>
            <div className="text-xs opacity-75">
              Depuis le {s.card.since}
              {s.pass.founder ? " · Fondateur 108 ✈️" : ""}
            </div>
          </div>
          <div className="shrink-0 rounded-xl bg-white p-2 shadow">
            <QRCodeSVG value={qrValue} size={92} fgColor="#1C1414" level="M" />
          </div>
        </div>
        <div className="relative mt-4 border-t border-current/20 pt-2 text-[11px] opacity-85">{t("noVote")}</div>
      </div>
      <p className="text-center text-xs text-sombre/50">QR code consultable hors ligne une fois l'application installée.</p>

      <Panel>
        <H2>{t("level")}</H2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(LEVELS) as Level[]).map((l) => (
            <button
              key={l}
              onClick={() => changeLevel(l)}
              className={`rounded-xl p-3 text-start ring-2 transition ${s.card.level === l ? "bg-sang/5 ring-sang" : "ring-black/10"}`}
            >
              <div className="text-sm font-bold">{levelName(l)}</div>
              <div className="text-xs text-sombre/70">{tnd(LEVELS[l].price)}</div>
              <div className="text-[10px] text-sombre/50">{t("perYear")}</div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-sombre/50">Prix indicatifs à tester : Base 35 à 70 TND, Or environ 200 TND, Platine environ 680 TND.</p>
      </Panel>

      <Panel>
        <H2>{t("benefits")}</H2>
        <ul className="space-y-2 text-sm">
          {LEVELS[s.card.level].perks.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-or">★</span>
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <Notice>
            Les remises famille et le service voyage existants restent dans <strong>MyTaraji</strong> (renvoi vers l'application en V1).
          </Notice>
        </div>
      </Panel>

      <Panel>
        <H2>{t("chapter")}</H2>
        <select
          className="w-full rounded-xl border border-black/10 bg-creme px-3 py-2"
          value={s.persona.chapter}
          onChange={(e) => {
            actions.setChapter(e.target.value);
            toast(`Chapitre : ${e.target.value}`);
          }}
        >
          {[...new Set([s.persona.chapter, ...CHAPTERS])].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-sombre/50">Ta ville ou ta cellule de supporters, en Tunisie ou dans la diaspora (Tunisiens résidant à l'étranger).</p>
      </Panel>

    </Screen>
  );
}
