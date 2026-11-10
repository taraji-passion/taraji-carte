"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actions, CHAPTERS, LEVELS, useAppState, type Level } from "@/lib/store";
import { askPayment, List, PageHeader, Row, Section, Sheet, toast, useT } from "@/components/ui";
import { confetti } from "@/components/fx";
import { InstallApp } from "@/components/InstallApp";
import { tnd } from "@/lib/format";

export default function ProfilPage() {
  const s = useAppState();
  const t = useT();
  const router = useRouter();
  const [sheet, setSheet] = useState<"level" | "chapter" | "points" | null>(null);
  const isAdmin = s.session?.role === "admin";
  const levelName = (l: Level) => t(l === "base" ? "levelBase" : l === "or" ? "levelOr" : "levelPlatine");

  async function changeLevel(l: Level) {
    if (l === s.card.level) return;
    const ok = await askPayment(`Carte ${levelName(l)}`, LEVELS[l].price, ["Valable 1 an", "Sans droit de vote"]);
    if (!ok) return;
    actions.setLevel(l);
    setSheet(null);
    confetti(60);
    toast(`Bienvenue au niveau ${levelName(l)} !`);
  }

  return (
    <>
      <PageHeader title={isAdmin ? t("account") : t("myProfile")} />

      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-sang text-2xl font-black text-white">{(s.session?.name ?? "?")[0]}</span>
        <div>
          <div className="text-xl font-extrabold">{s.session?.name}</div>
          <div className="text-sm text-sombre/50">{isAdmin ? "admin@est.tn" : `${s.persona.city}, ${s.persona.country}`}</div>
        </div>
      </div>

      {!isAdmin && (
        <Section title="Ma carte">
          <List>
            <Row icon="💳" title="Niveau" sub={`${levelName(s.card.level)} · ${tnd(LEVELS[s.card.level].price)} par an`} onClick={() => setSheet("level")} />
            <Row icon="📍" title={t("chapter")} sub={s.persona.chapter} onClick={() => setSheet("chapter")} />
            <Row icon="🏗️" title={t("points")} sub={`${s.points.balance} points`} onClick={() => setSheet("points")} />
          </List>
        </Section>
      )}

      <Section>
        <InstallApp />
      </Section>

      <Section title="Réglages">
        <List>
          <Row icon="🌐" title="Langue" sub={s.lang === "fr" ? "Français" : "العربية"} right={<span className="text-sm font-semibold text-sang">{t("language")}</span>} onClick={() => actions.setLang(s.lang === "fr" ? "ar" : "fr")} />
          <Row
            icon="↺"
            title={t("reset")}
            onClick={() => {
              if (confirm("Remettre la démo à zéro ?")) actions.reset();
            }}
          />
          <Row
            icon="🚪"
            title={<span className="text-sang">{t("logout")}</span>}
            onClick={() => {
              actions.logout();
              router.replace("/login");
            }}
          />
        </List>
      </Section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-sombre/40">
        Démo · données fictives · aucun vrai paiement
        <br />
        La Carte Supporter ne donne pas de droit de vote.
      </p>

      <Sheet open={sheet === "level"} onClose={() => setSheet(null)} title="Choisir mon niveau">
        <div className="space-y-2">
          {(Object.keys(LEVELS) as Level[]).map((l) => (
            <button key={l} onClick={() => changeLevel(l)} className={`flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-start ring-2 ${s.card.level === l ? "ring-sang" : "ring-transparent"}`}>
              <span className="flex-1">
                <span className="block font-bold">{levelName(l)}</span>
                <span className="block text-xs text-sombre/50">{LEVELS[l].perks.slice(-2).join(" · ")}</span>
              </span>
              <span className="font-black">{tnd(LEVELS[l].price)}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "chapter"} onClose={() => setSheet(null)} title={t("chapter")}>
        <List>
          {[...new Set([s.persona.chapter, ...CHAPTERS])].map((c) => (
            <Row
              key={c}
              title={c}
              right={c === s.persona.chapter ? <span className="font-bold text-sang">✓</span> : undefined}
              onClick={() => {
                actions.setChapter(c);
                setSheet(null);
              }}
            />
          ))}
        </List>
      </Sheet>

      <Sheet open={sheet === "points"} onClose={() => setSheet(null)} title={t("points")}>
        <div className="mb-4 text-center">
          <div className="text-5xl font-black">{s.points.balance}</div>
          <div className="text-sm text-sombre/50">10 points = 1 TND sur un voyage</div>
        </div>
        <List>
          {s.points.movements.map((m) => (
            <Row key={m.id} title={m.label} sub={m.date} right={<span className={`font-semibold ${m.amount >= 0 ? "text-emerald-700" : "text-sang"}`}>{m.amount >= 0 ? `+${m.amount}` : m.amount}</span>} />
          ))}
        </List>
      </Sheet>
    </>
  );
}
