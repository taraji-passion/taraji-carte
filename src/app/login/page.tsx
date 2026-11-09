"use client";

import { useState } from "react";
import { actions, PERSONAS, useAppState, type Role } from "@/lib/store";
import { useT } from "@/components/ui";
import { confetti } from "@/components/fx";

const PHONES: Record<string, string> = {
  karim: "+33 6 12 34 56 78",
  yassine: "+216 98 123 456",
  sami: "+216 22 654 321",
  leila: "+39 345 678 9012",
};

const ROLES: { id: Role; label: string; desc: string; icon: string }[] = [
  { id: "supporter", label: "Supporter", desc: "Carte, Pass, billets, tirelires", icon: "🔴🟡" },
  { id: "club", label: "Club", desc: "Back-office des supporters", icon: "🛠️" },
  { id: "president", label: "Président", desc: "Simulateur et indicateurs", icon: "📊" },
];

const TICKER = ["3,17 M d'abonnés, n° 1 en Tunisie", "Pass Voyageur : Le Caire à 750 TND au lieu de 1 870", "2 000 places Fondateur 108", "Supporters virtuels dans 21 pays", "Tirelires Rentrée et Aïd", "Paiement MyTaraji · Zitouna Payment"];

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  l: (i * 53) % 100,
  s: 3 + (i % 4) * 2,
  c: i % 3 === 0 ? "#B5121B" : "#F2B705",
  d: 9 + (i % 5) * 3,
  dl: -((i * 7) % 15),
}));

export default function LoginPage() {
  const s = useAppState();
  const t = useT();
  const [role, setRole] = useState<Role>("supporter");
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [step, setStep] = useState<"id" | "code">("id");
  const [code, setCode] = useState("");

  const identifier = role === "supporter" ? PHONES[persona] : role === "club" ? "supporters@est.tn" : "president@est.tn";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top,#4a0d12_0%,#1C1414_55%,#0d0909_100%)] text-creme">
      <div className="spot start-[-10%]" />
      <div className="spot end-[-10%]" style={{ animationDelay: "-3.5s" }} />
      {EMBERS.map((e, i) => (
        <span key={i} className="ember" style={{ left: `${e.l}%`, width: e.s, height: e.s, background: e.c, animationDuration: `${e.d}s`, animationDelay: `${e.dl}s` }} />
      ))}
      {/* Pelouse stylisée */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[repeating-linear-gradient(90deg,rgba(242,183,5,0.05)_0_40px,transparent_40px_80px)] [mask-image:linear-gradient(to_top,black,transparent)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-or backdrop-blur">108 ans · 1919 – 2027</span>
        <button onClick={() => actions.setLang(s.lang === "fr" ? "ar" : "fr")} className="min-h-9 rounded-lg px-3 text-xs font-semibold text-or ring-1 ring-or/50">
          {t("language")}
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-or/20 blur-2xl" />
          <div className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full shadow-[0_0_60px_rgba(242,183,5,0.35)] ring-4 ring-or">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-sang" />
              <div className="flex-1 bg-or" />
              <div className="flex-1 bg-sang" />
              <div className="flex-1 bg-or" />
            </div>
            <span className="relative text-3xl font-black text-white drop-shadow-lg">EST</span>
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-black leading-tight">
          Aujourd'hui supporters,
          <br />
          <span className="text-shine">demain bâtisseurs.</span>
        </h1>
        <p className="mt-2 text-sm text-creme/60">{t("appName")} · {t("club")}</p>
      </div>

      <div className="mt-6 overflow-hidden whitespace-nowrap text-xs text-creme/70 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <div className="ticker inline-flex gap-8">
          {[...TICKER, ...TICKER].map((x, i) => (
            <span key={i}>
              <span className="text-or">●</span> {x}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-creme/95 p-5 text-sombre shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/20 backdrop-blur">
        {step === "id" ? (
          <>
            <h2 className="text-lg font-extrabold">{t("login")}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`rounded-xl p-2 text-center ring-2 transition ${role === r.id ? "bg-white ring-sang" : "ring-black/10"}`}
                >
                  <div className="text-lg">{r.icon}</div>
                  <div className="text-sm font-bold">{r.label}</div>
                  <div className="text-[10px] leading-tight text-sombre/60">{r.desc}</div>
                </button>
              ))}
            </div>

            {role === "supporter" && (
              <>
                <div className="mt-4 text-xs font-semibold text-sombre/60">Profil de démo</div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`rounded-xl px-3 py-2 text-start ring-2 ${persona === p.id ? "bg-white ring-sang" : "ring-black/10"}`}
                    >
                      <div className="text-sm font-bold">{p.name}</div>
                      <div className="text-[11px] text-sombre/60">
                        {p.city}
                        {p.diaspora ? " · diaspora" : ""}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <label className="mt-4 block text-xs font-semibold text-sombre/60">
              {role === "supporter" ? "Numéro de téléphone (compte MyTaraji)" : "Identifiant du club"}
              <input readOnly value={identifier} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sombre" />
            </label>

            <button
              onClick={() => {
                setStep("code");
                setCode("");
              }}
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-sang font-semibold text-white"
            >
              {role === "supporter" ? t("loginMyTaraji") : "Recevoir le code"}
            </button>
            <p className="mt-3 text-center text-[11px] text-sombre/50">Connexion simulée. En V1 : connexion unique via MyTaraji (Zitouna Payment).</p>
          </>
        ) : (
          <>
            <button onClick={() => setStep("id")} className="text-sm text-sang">
              ← {t("back")}
            </button>
            <h2 className="mt-2 text-lg font-extrabold">Code de vérification</h2>
            <p className="text-sm text-sombre/60">
              Code envoyé par SMS au <strong>{identifier}</strong>.
            </p>
            <div className="mt-2 rounded-lg bg-or/20 px-3 py-2 text-xs">Démo : saisis <strong>1919</strong> (ou touche « Remplir »).</div>
            <div className="mt-3 flex gap-2">
              <input
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-2xl font-bold tracking-[0.5em]"
                aria-label="Code"
                placeholder="••••"
              />
              <button onClick={() => setCode("1919")} className="rounded-xl px-3 text-sm font-semibold text-sang ring-1 ring-sang/40">
                Remplir
              </button>
            </div>
            {code.length === 4 && code !== "1919" && <p className="mt-1 text-xs text-sang">Code incorrect.</p>}
            <button
              disabled={code !== "1919"}
              onClick={() => { confetti(70); actions.login(role, persona); }}
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-sang font-semibold text-white disabled:opacity-40"
            >
              {t("confirm")}
            </button>
          </>
        )}
      </div>

      <p className="mt-auto pt-8 text-center text-[11px] text-creme/40">{t("demo")} · aucun vrai paiement · montants en TND</p>
      </div>
    </div>
  );
}
