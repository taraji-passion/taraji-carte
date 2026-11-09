"use client";

import Link from "next/link";
import { actions, PERSONAS, useAppState } from "@/lib/store";
import { H2, Panel, toast, useT } from "@/components/ui";

export default function PlusPage() {
  const s = useAppState();
  const t = useT();
  const links = [
    { href: "/points", label: t("points"), desc: `${s.points.balance} points`, icon: "🏗️" },
    { href: "/simulateur", label: t("simulator"), desc: "Revenus annuels estimés en TND", icon: "📊" },
    { href: "/admin", label: t("admin"), desc: "Voyages, réservations, modération, tableau de bord", icon: "🛠️" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">{t("navMore")}</h1>
      <div className="space-y-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <span className="text-2xl">{l.icon}</span>
            <span className="flex-1">
              <span className="block font-bold">{l.label}</span>
              <span className="block text-xs text-sombre/60">{l.desc}</span>
            </span>
            <span className="text-sombre/30 rtl:rotate-180">›</span>
          </Link>
        ))}
      </div>

      <Panel>
        <H2>{t("profile")}</H2>
        <div className="grid grid-cols-2 gap-2">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                actions.setPersona(p.id);
                toast(`Profil : ${p.name}`);
              }}
              className={`rounded-xl p-3 text-start ring-2 ${s.persona.id === p.id ? "bg-sang/5 ring-sang" : "ring-black/10"}`}
            >
              <div className="font-bold">{p.name}</div>
              <div className="text-xs text-sombre/60">
                {p.city}
                {p.diaspora ? " · diaspora" : ""}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-sombre/50">Parcours de démo : Karim (Lyon) adhère et achète une place virtuelle ; Yassine (Tunis) voyage avec le Pass ; Sami (Ben Arous) gère les tirelires.</p>
      </Panel>

      <Panel>
        <H2>Installer l'application</H2>
        <ul className="space-y-1 text-sm text-sombre/80">
          <li>📱 iPhone : Safari → Partager → « Sur l'écran d'accueil »</li>
          <li>🤖 Android : Chrome → menu ⋮ → « Installer l'application »</li>
        </ul>
      </Panel>

      <Panel>
        <H2>À propos de cette démo</H2>
        <ul className="space-y-1 text-xs text-sombre/70">
          <li>• Données fictives, enregistrées uniquement dans ce navigateur.</li>
          <li>• Aucun vrai paiement : MyTaraji / Zitouna Payment en V1.</li>
          <li>• Tous les montants sont en dinars tunisiens (TND).</li>
          <li>• La Carte Supporter ne remplace pas la carte d'adhérent statutaire et ne donne aucun droit de vote.</li>
        </ul>
        <button
          className="mt-3 w-full rounded-xl py-2 text-sm font-semibold text-sang ring-1 ring-sang/40"
          onClick={() => {
            if (confirm("Remettre la démo à zéro ?")) {
              actions.reset();
              toast("Démo réinitialisée");
            }
          }}
        >
          ↺ {t("reset")}
        </button>
      </Panel>
    </div>
  );
}
