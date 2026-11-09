"use client";

import { useState } from "react";
import { actions, useAppState, type Piggy, type PiggyType } from "@/lib/store";
import { askPayment, Badge, Button, H2, Notice, Panel, Progress, toast, useT } from "@/components/ui";
import { pct, tnd } from "@/lib/format";

const PRESETS: Record<PiggyType, { target: number; deadline: string; monthly: number; icon: string }> = {
  rentree: { target: 700, deadline: "septembre 2027", monthly: 90, icon: "🎒" },
  aid: { target: 1500, deadline: "mai 2027", monthly: 250, icon: "🐑" },
  voyage: { target: 1200, deadline: "juillet 2027", monthly: 120, icon: "🧳" },
};

const OFFERS: Record<PiggyType, { label: string; price: number; detail: string }> = {
  rentree: { label: "Pack rentrée Taraji (2 enfants)", price: 640, detail: "Cartables, fournitures et tabliers, remise club −15 %" },
  aid: { label: "Bon mouton chez un éleveur agréé", price: 1400, detail: "Contrôle vétérinaire ; le club ne transporte ni ne stocke les animaux" },
  voyage: { label: "Week-end famille à Tabarka + match", price: 900, detail: "Hôtel 2 nuits, transport et 4 places au stade" },
};

export default function FamillePage() {
  const s = useAppState();
  const t = useT();
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(8);
  const [invite, setInvite] = useState<{ piggyId: string; name: string; city: string; amount: number } | null>(null);

  const label = (type: PiggyType) => t(type);
  const active = s.piggies.filter((p) => !p.used).length;
  const fees = Math.min(3, active);

  async function create(type: PiggyType) {
    const p = PRESETS[type];
    actions.createPiggy(type, p.target, p.deadline, p.monthly);
    toast(`Tirelire ${label(type)} ouverte`);
  }

  async function use(pg: Piggy) {
    const offer = OFFERS[pg.type];
    const complement = Math.max(0, offer.price - pg.balance);
    if (complement > 0) {
      const ok = await askPayment(`Complément — ${offer.label}`, complement, [`Prix de l'offre groupée : ${tnd(offer.price)}`, `Solde de la tirelire : ${tnd(pg.balance)}`]);
      if (!ok) return;
    }
    actions.usePiggy(pg.id, offer.label, offer.price, s.children[0]?.name);
    toast("Offre groupée réglée !");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">{t("piggy")}</h1>
      <p className="text-sm text-sombre/70">Prépare les grosses dépenses de la famille petit à petit, avec les offres groupées du club.</p>

      {/* Ouvrir */}
      <Panel>
        <H2>Ouvrir une tirelire</H2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PRESETS) as PiggyType[]).map((type) => {
            const exists = s.piggies.some((p) => p.type === type && !p.used);
            return (
              <button
                key={type}
                disabled={exists}
                onClick={() => create(type)}
                className="rounded-xl p-3 text-center ring-2 ring-black/10 transition hover:ring-sang disabled:opacity-40"
              >
                <div className="text-2xl">{PRESETS[type].icon}</div>
                <div className="text-sm font-bold">{label(type)}</div>
                <div className="text-[11px] text-sombre/60">{tnd(PRESETS[type].target)}</div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-sombre/50">Omra prévue en V2. Frais : 1 TND par mois et par tirelire active, plafonnés à 3 TND (actuellement {fees} TND/mois).</p>
      </Panel>

      {s.piggies.length > 0 && (
        <Button
          variant="gold"
          className="w-full"
          onClick={() => {
            actions.simulatePiggyMonths(3);
            toast("+3 mois de versements simulés");
          }}
        >
          ⏩ Simuler 3 mois de versements
        </Button>
      )}

      {s.piggies.map((pg) => {
        const v = pct(pg.balance, pg.target);
        const contributors = s.contributors.filter((c) => c.piggyId === pg.id);
        const offer = OFFERS[pg.type];
        return (
          <Panel key={pg.id} className={pg.used ? "opacity-80" : ""}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">
                  {PRESETS[pg.type].icon} {label(pg.type)}
                </div>
                <div className="text-xs text-sombre/60">Objectif {tnd(pg.target)} · échéance {pg.deadline} · {tnd(pg.monthly)} {t("perMonth")}</div>
              </div>
              {pg.used ? <Badge tone="vert">Utilisée ✓</Badge> : <Badge>{v} %</Badge>}
            </div>
            <div className="mt-3 text-2xl font-black text-sang">{tnd(pg.balance)}</div>
            <div className="mt-1">
              <Progress value={v} color={v >= 100 ? "bg-emerald-500" : "bg-or"} label={`Tirelire ${pg.label}`} />
            </div>

            {contributors.length > 0 && (
              <div className="mt-3 space-y-1">
                {contributors.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-creme px-3 py-1.5 text-xs">
                    <span>🌍 {c.name} ({c.city}, {c.country})</span>
                    <strong>+{tnd(c.total)}</strong>
                  </div>
                ))}
              </div>
            )}

            {!pg.used && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      if (await askPayment(`Versement — tirelire ${pg.label}`, 50)) {
                        actions.depositPiggy(pg.id, 50);
                        toast("+50 TND");
                      }
                    }}
                  >
                    + 50 TND
                  </Button>
                  <Button variant="ghost" onClick={() => setInvite({ piggyId: pg.id, name: "Mehdi (frère)", city: "Lyon", amount: 100 })}>
                    🌍 Inviter
                  </Button>
                </div>
                {invite?.piggyId === pg.id && (
                  <div className="mt-3 space-y-2 rounded-xl bg-creme p-3">
                    <div className="text-sm font-semibold">{t("contributor")}</div>
                    <input className="w-full rounded-lg border border-black/10 px-3 py-2" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="Nom" />
                    <input className="w-full rounded-lg border border-black/10 px-3 py-2" value={invite.city} onChange={(e) => setInvite({ ...invite, city: e.target.value })} placeholder="Ville" />
                    <label className="flex items-center gap-2 text-sm">
                      Montant simulé
                      <input type="number" className="w-24 rounded-lg border border-black/10 px-2 py-1" value={invite.amount} min={10} step={10} onChange={(e) => setInvite({ ...invite, amount: Number(e.target.value) })} />
                      TND
                    </label>
                    <Button
                      className="w-full"
                      onClick={() => {
                        actions.inviteContributor(invite.name, invite.city, invite.city === "Lyon" ? "France" : "Étranger", pg.id, invite.amount);
                        toast(`${invite.name} a contribué ${invite.amount} TND`);
                        setInvite(null);
                      }}
                    >
                      Envoyer l'invitation et simuler sa contribution
                    </Button>
                    <p className="text-[11px] text-sombre/50">Versement en devise, converti en TND. Sous réserve de l'avis juridique sur la réglementation des changes.</p>
                  </div>
                )}
                <div className="mt-3 rounded-xl ring-1 ring-black/10 p-3">
                  <div className="text-xs font-semibold text-sombre/60">Offre groupée du club</div>
                  <div className="font-semibold">{offer.label} — {tnd(offer.price)}</div>
                  <div className="text-xs text-sombre/60">{offer.detail}</div>
                  <Button className="mt-2 w-full" disabled={pg.balance <= 0} onClick={() => use(pg)}>
                    Utiliser la tirelire
                  </Button>
                </div>
                {pg.type === "aid" && (
                  <div className="mt-2">
                    <Notice>L'Aïd peut nécessiter un compte de paiement de niveau 2 (plafond niveau 1 : 1 500 TND).</Notice>
                  </div>
                )}
              </>
            )}

            {pg.movements.length > 0 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-xs text-sang">{t("history")} ({pg.movements.length})</summary>
                <ul className="mt-2 divide-y divide-black/5">
                  {pg.movements.map((m) => (
                    <li key={m.id} className="flex justify-between gap-2 py-1.5 text-xs">
                      <span>
                        {m.label} <span className="text-sombre/40">· {m.date}</span>
                      </span>
                      <strong className={m.amount >= 0 ? "text-emerald-700" : "text-sang"}>
                        {m.amount >= 0 ? "+" : ""}
                        {tnd(m.amount)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </Panel>
        );
      })}

      {/* Enfants */}
      <Panel>
        <H2>{t("children")}</H2>
        <ul className="space-y-2">
          {s.children.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl bg-creme px-3 py-2 text-sm">
              <span>👧 {c.name}, {c.age} ans</span>
              <button className="text-xs text-sombre/50" onClick={() => actions.removeChild(c.id)} aria-label={`Retirer ${c.name}`}>Retirer</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input className="min-w-0 flex-1 rounded-xl border border-black/10 bg-creme px-3 py-2" placeholder="Prénom" value={childName} onChange={(e) => setChildName(e.target.value)} />
          <input type="number" className="w-16 rounded-xl border border-black/10 bg-creme px-2 py-2" min={0} max={17} value={childAge} onChange={(e) => setChildAge(Number(e.target.value))} aria-label="Âge" />
          <Button
            disabled={!childName.trim()}
            onClick={() => {
              actions.addChild(childName.trim(), childAge);
              setChildName("");
            }}
          >
            Ajouter
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-sombre/50">Les enfants n'ont pas de compte propre : profils rattachés à ton compte, données minimales (prénom, âge).</p>
      </Panel>
    </div>
  );
}
