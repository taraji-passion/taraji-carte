"use client";

import { useRouter } from "next/navigation";
import { actions, useAppState } from "@/lib/store";
import { H2, Panel, Screen, toast, useT } from "@/components/ui";

export default function ProfilPage() {
  const s = useAppState();
  const t = useT();
  const router = useRouter();
  const role = s.session?.role;

  return (
    <Screen title={t("myProfile")} icon="👤" subtitle={s.session?.name}>
      <Panel>
        <H2>Compte</H2>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="text-sombre/60">Nom : </span>
            <strong>{s.session?.name}</strong>
          </li>
          <li>
            <span className="text-sombre/60">Espace : </span>
            {role === "supporter" ? "Supporter" : "Admin (club)"}
          </li>
          {role === "supporter" && (
            <>
              <li>
                <span className="text-sombre/60">Ville : </span>
                {s.persona.city}, {s.persona.country}
                {s.persona.diaspora ? " (diaspora)" : ""}
              </li>
              <li>
                <span className="text-sombre/60">Chapitre : </span>
                {s.persona.chapter}
              </li>
            </>
          )}
        </ul>
        <button onClick={() => actions.setLang(s.lang === "fr" ? "ar" : "fr")} className="mt-3 min-h-11 w-full rounded-xl text-sm font-semibold text-sombre ring-1 ring-black/15">
          🌐 {t("language")}
        </button>
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
          className="mt-3 min-h-11 w-full rounded-xl text-sm font-semibold text-sombre/70 ring-1 ring-black/15"
          onClick={() => {
            if (confirm("Remettre la démo à zéro ? (tu seras déconnecté)")) {
              actions.reset();
              toast("Démo réinitialisée");
            }
          }}
        >
          ↺ {t("reset")}
        </button>
      </Panel>

      <button
        onClick={() => {
          actions.logout();
          router.replace("/login");
        }}
        className="min-h-12 w-full rounded-xl bg-sang text-sm font-semibold text-white"
      >
        {t("logout")}
      </button>
    </Screen>
  );
}
