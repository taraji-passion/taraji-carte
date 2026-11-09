"use client";

import { SupporterCard } from "@/components/SupporterCard";
import { confetti } from "@/components/fx";
import { actions, CHAPTERS, LEVELS, useAppState, type Level } from "@/lib/store";
import { askPayment, H2, Notice, Panel, Screen, toast, useT } from "@/components/ui";
import { tnd } from "@/lib/format";

export default function CartePage() {
  const s = useAppState();
  const t = useT();
  const levelName = (l: Level) => t(l === "base" ? "levelBase" : l === "or" ? "levelOr" : "levelPlatine");

  async function changeLevel(l: Level) {
    if (l === s.card.level) return;
    const ok = await askPayment(`Carte Supporter ${levelName(l)}`, LEVELS[l].price, [
      "Abonnement annuel, rappel 30 jours avant le renouvellement",
      "La carte ne donne aucun droit statutaire (pas de droit de vote)",
      s.persona.diaspora ? "Paiement en devise accepté (diaspora)" : "Paiement depuis ton portefeuille MyTaraji",
    ]);
    if (ok) {
      actions.setLevel(l);
      confetti(60);
      toast(`Carte mise à jour : niveau ${levelName(l)}`);
    }
  }

  return (
    <Screen title={t("myCard")} icon="💳" subtitle="Niveau, QR code, avantages et chapitre">

      <SupporterCard />

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
