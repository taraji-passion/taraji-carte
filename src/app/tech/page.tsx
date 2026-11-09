"use client";

import { useEffect, useState } from "react";
import { Badge, H2, Panel, Screen, useT } from "@/components/ui";

interface Diag {
  sw: string;
  standalone: boolean;
  online: boolean;
  storageKb: number;
  loadMs: number | null;
  manifest: boolean;
  https: boolean;
}

const LAYERS = [
  { title: "Application supporter (PWA)", items: ["Next.js 16 · React 19", "Tailwind CSS 4 · FR / AR (RTL)", "Installable, hors ligne"], tone: "from-sang to-[#7a0c12] text-white" },
  { title: "Back-office et API (BFF)", items: ["Next.js ou Spring Boot", "OpenAPI · authentification SSO", "Journal d'audit"], tone: "from-sombre to-[#3a2a2a] text-creme" },
];
const PARTNERS = [
  { name: "MyTaraji / Zitouna Payment", desc: "SSO, prélèvements, solde, paiements", icon: "💳" },
  { name: "Agence de voyage agréée", desc: "Catalogue, attribution, liste des voyageurs", icon: "✈️" },
  { name: "PostgreSQL", desc: "Cartes, Pass, réservations, tirelires", icon: "🗄️" },
  { name: "Temps réel", desc: "WebSocket pour le mur (moins de 3 s)", icon: "⚡" },
  { name: "Notifications", desc: "Push web, SMS Taraji Mobile, e-mail", icon: "🔔" },
  { name: "Analytics", desc: "Respectueux de la vie privée", icon: "📊" },
];
const API = [
  ["POST", "/api/cards", "Souscrire une carte"],
  ["GET", "/api/me/card", "Afficher ma carte"],
  ["POST", "/api/pass/subscribe", "Souscrire au Pass"],
  ["GET", "/api/pass/credit", "Solde et mouvements"],
  ["GET", "/api/trips", "Voyages officiels"],
  ["POST", "/api/trips/{id}/book", "Réserver un voyage"],
  ["POST", "/api/matches/{id}/virtual-tickets", "Acheter une place virtuelle"],
  ["GET", "/api/matches/{id}/wall", "Mur en direct"],
  ["POST", "/api/piggybanks/{id}/contributions", "Contribuer à une tirelire"],
  ["POST", "/api/admin/trips/{id}/allocate", "Attribuer les places"],
];
const ENTITIES = ["Utilisateur", "Carte", "AbonnementPass", "CréditVoyage", "Objectif", "Voyage", "Réservation", "Match", "BilletVirtuel", "BilletSolidaire", "Tirelire", "Contribution", "ProfilEnfant", "PointsBâtisseur"];
const SECURITY = [
  ["Authentification", "SSO MyTaraji (V1), aucun mot de passe stocké"],
  ["Paiement", "Aucune donnée de carte bancaire dans l'application"],
  ["Argent des supporters", "Tenu par Zitouna Payment (circulaire BCT 2026-10), plafonds par niveau de compte"],
  ["Données personnelles", "INPDP (Tunisie) et RGPD (diaspora), consentement explicite"],
  ["Mineurs", "Aucun compte propre, données minimales (prénom, âge)"],
  ["Modération", "Filtre automatique + validation humaine avant affichage public"],
  ["Traçabilité", "Journalisation des actions du back-office"],
  ["Transport", "TLS partout, en-têtes de sécurité"],
];
const ROADMAP = [
  ["15 janv. 2027", "Démo au club (cette application)", true],
  ["Févr. – juin 2027", "V1 pilote : API MyTaraji, agence, premier voyage CAF", false],
  ["2027", "Tirelires Rentrée et Aïd en pilote, anglais", false],
  ["V2", "Carte physique co-brandée, charters, classement des villes", false],
] as const;

export default function TechPage() {
  const t = useT();
  const [d, setD] = useState<Diag | null>(null);

  useEffect(() => {
    const run = async () => {
      let sw = "non supporté";
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        sw = reg?.active ? "actif" : process.env.NODE_ENV === "production" ? "en cours d'installation" : "désactivé en développement";
      }
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) ?? "";
        size += k.length + (localStorage.getItem(k)?.length ?? 0);
      }
      setD({
        sw,
        standalone: window.matchMedia("(display-mode: standalone)").matches,
        online: navigator.onLine,
        storageKb: Math.round((size * 2) / 1024),
        loadMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        manifest: !!document.querySelector('link[rel="manifest"]'),
        https: location.protocol === "https:" || location.hostname === "localhost",
      });
    };
    run();
  }, []);

  return (
    <Screen title={t("tech")} icon="⚙️" subtitle="Pour les équipes IT : architecture, API, sécurité">
      {/* Diagnostic en direct */}
      <Panel className="bg-sombre text-creme ring-0">
        <H2>
          <span className="text-creme">Diagnostic en direct de cet appareil</span>
        </H2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <DiagItem label="Chargement" value={d?.loadMs != null ? `${d.loadMs} ms` : "…"} ok={d ? (d.loadMs ?? 0) < 2500 : undefined} hint="cible < 2,5 s en 4G" />
          <DiagItem label="Service worker" value={d?.sw ?? "…"} ok={d ? d.sw === "actif" : undefined} hint="mode hors ligne" />
          <DiagItem label="Manifeste PWA" value={d ? (d.manifest ? "présent" : "absent") : "…"} ok={d?.manifest} hint="installable" />
          <DiagItem label="Contexte sécurisé" value={d ? (d.https ? "oui" : "non (HTTP)") : "…"} ok={d?.https} hint="requis pour installer" />
          <DiagItem label="Mode d'affichage" value={d ? (d.standalone ? "application" : "navigateur") : "…"} hint="standalone une fois installée" />
          <DiagItem label="Réseau" value={d ? (d.online ? "en ligne" : "hors ligne") : "…"} ok={d?.online} />
          <DiagItem label="Données locales" value={d ? `${d.storageKb} Ko` : "…"} hint="localStorage (démo)" />
          <DiagItem label="Back-end" value="aucun (démo)" hint="export statique, 0 serveur" />
        </div>
      </Panel>

      {/* Architecture */}
      <Panel>
        <H2 right={<Badge tone="gris">Cible V1</Badge>}>Architecture</H2>
        <div className="space-y-2">
          {LAYERS.map((l, i) => (
            <div key={l.title}>
              <div className={`rounded-2xl bg-gradient-to-r p-4 ${l.tone}`}>
                <div className="font-bold">{l.title}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {l.items.map((x) => (
                    <span key={x} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
              {i < LAYERS.length - 1 && <div className="mx-auto h-4 w-0.5 bg-sombre/20" />}
            </div>
          ))}
          <div className="mx-auto h-4 w-0.5 bg-sombre/20" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {PARTNERS.map((p) => (
              <div key={p.name} className="rounded-xl bg-creme p-3 ring-1 ring-black/5">
                <div className="text-sm font-bold">
                  {p.icon} {p.name}
                </div>
                <div className="text-[11px] text-sombre/60">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <H2 right={<Badge tone="gris">REST · OpenAPI</Badge>}>Contrat d'API</H2>
          <ul className="space-y-1.5 font-mono text-[11px]">
            {API.map(([m, r, d2]) => (
              <li key={r + m} className="flex items-center gap-2">
                <span className={`w-11 shrink-0 rounded px-1 text-center font-bold ${m === "GET" ? "bg-emerald-100 text-emerald-800" : "bg-sang/10 text-sang"}`}>{m}</span>
                <span className="truncate">{r}</span>
                <span className="ms-auto hidden shrink-0 font-sans text-sombre/50 sm:inline">{d2}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <H2>Modèle de données</H2>
          <div className="flex flex-wrap gap-1.5">
            {ENTITIES.map((e) => (
              <span key={e} className="rounded-lg bg-sombre px-2 py-1 font-mono text-[11px] text-or">
                {e}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-sombre/60">Le crédit voyage et les tirelires restent sur le compte de paiement MyTaraji du supporter : l'application ne détient pas les fonds.</p>
        </Panel>
      </div>

      <Panel>
        <H2>Sécurité et conformité</H2>
        <div className="grid gap-2 md:grid-cols-2">
          {SECURITY.map(([k, v]) => (
            <div key={k} className="flex gap-2 rounded-xl bg-creme p-3 text-sm">
              <span className="text-emerald-600">✔</span>
              <div>
                <div className="font-semibold">{k}</div>
                <div className="text-xs text-sombre/60">{v}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <H2>Qualité de la démo</H2>
          <ul className="space-y-1 text-sm">
            <li>⚡ Export statique : servi par n'importe quel CDN, 0 serveur, 0 coût</li>
            <li>📱 PWA installable iOS et Android, sans magasin d'applications</li>
            <li>🌐 Français et arabe (de droite à gauche)</li>
            <li>♿ Contrastes AA, cibles tactiles ≥ 44 px, animations désactivées si l'utilisateur le demande</li>
            <li>🧪 Parcours clés testés automatiquement (Playwright)</li>
          </ul>
        </Panel>
        <Panel>
          <H2>Feuille de route</H2>
          <ol className="relative space-y-3 border-s-2 border-or/50 ps-4">
            {ROADMAP.map(([date, label, done]) => (
              <li key={date} className="relative">
                <span className={`absolute -start-[23px] top-1 h-3 w-3 rounded-full ring-2 ring-white ${done ? "bg-sang" : "bg-or"}`} />
                <div className="text-xs font-bold text-sang">{date}</div>
                <div className="text-sm">{label}</div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </Screen>
  );
}

function DiagItem({ label, value, ok, hint }: { label: string; value: string; ok?: boolean; hint?: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-creme/60">
        {ok !== undefined && <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-or"}`} />}
        {label}
      </div>
      <div className="text-sm font-bold text-creme">{value}</div>
      {hint && <div className="text-[10px] text-creme/40">{hint}</div>}
    </div>
  );
}
