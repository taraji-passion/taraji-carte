"use client";

import { useState } from "react";
import { actions, useAppState, type PiggyType } from "@/lib/store";
import { AmountInput, askPayment, Button, Card, List, PageHeader, Ring, Row, Section, Sheet, toast, useT } from "@/components/ui";
import { confetti } from "@/components/fx";
import { pct, tnd } from "@/lib/format";

const TYPES: Record<PiggyType, { icon: string; target: number; deadline: string; monthly: number; color: string; offer: string; offerPrice: number }> = {
  rentree: { icon: "🎒", target: 700, deadline: "sept. 2027", monthly: 90, color: "#2563eb", offer: "Pack rentrée Taraji (2 enfants)", offerPrice: 640 },
  aid: { icon: "🐑", target: 1500, deadline: "mai 2027", monthly: 250, color: "#059669", offer: "Bon mouton chez un éleveur agréé", offerPrice: 1400 },
  voyage: { icon: "🧳", target: 1200, deadline: "juil. 2027", monthly: 120, color: "#B5121B", offer: "Week-end famille à Tabarka + match", offerPrice: 900 },
};

export default function FamillePage() {
  const s = useAppState();
  const t = useT();
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"deposit" | "invite" | null>(null);
  const [amount, setAmount] = useState("");
  const [guest, setGuest] = useState({ name: "Mehdi (frère)", city: "Lyon" });
  const value = Math.round(Number(amount.replace(",", ".")) || 0);
  const validAmount = value >= 1 && value <= 5000;
  const [addingChild, setAddingChild] = useState(false);
  const [child, setChild] = useState({ name: "", age: 8 });

  const pg = s.piggies.find((p) => p.id === openId) ?? null;
  const conf = pg ? TYPES[pg.type] : null;

  function create(type: PiggyType) {
    const c = TYPES[type];
    actions.createPiggy(type, c.target, c.deadline, c.monthly);
    setCreating(false);
    toast(`Tirelire ${t(type)} créée`);
  }

  async function use() {
    if (!pg || !conf) return;
    const complement = Math.max(0, conf.offerPrice - pg.balance);
    if (complement > 0 && !(await askPayment(`Complément · ${conf.offer}`, complement))) return;
    actions.usePiggy(pg.id, conf.offer, conf.offerPrice, s.children[0]?.name);
    confetti();
    toast("Offre réglée avec ta tirelire !");
  }

  return (
    <>
      <PageHeader
        title={t("navFamily")}
        right={
          s.piggies.length > 0 ? (
            <button
              onClick={() => {
                actions.simulatePiggyMonths(3);
                toast("+3 mois simulés");
              }}
              className="rounded-full bg-or px-4 py-2 text-xs font-bold"
            >
              ⏩ +3 mois
            </button>
          ) : undefined
        }
      />

      {s.piggies.length === 0 ? (
        <div className="rounded-[28px] bg-white p-6 text-center shadow-sm">
          <div className="text-5xl">💰</div>
          <h2 className="mt-3 text-xl font-extrabold">La rentrée et l'Aïd, sans stress</h2>
          <p className="mt-1 text-sm text-sombre/60">Mets un peu de côté chaque mois. Tes proches à l'étranger peuvent participer.</p>
          <Button className="mt-5 w-full" onClick={() => setCreating(true)}>
            Créer ma première tirelire
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {s.piggies.map((p) => {
            const c = TYPES[p.type];
            const v = pct(p.balance, p.target);
            return (
              <Card key={p.id} onClick={() => setOpenId(p.id)} className="flex items-center gap-4">
                <Ring value={v} color={p.used ? "#10b981" : c.color}>
                  <span className="text-2xl">{c.icon}</span>
                </Ring>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{t(p.type)}</span>
                  <span className="block text-sm">
                    <strong>{tnd(p.balance)}</strong> <span className="text-sombre/40">/ {tnd(p.target)}</span>
                  </span>
                  <span className="block text-xs text-sombre/50">{p.used ? "Utilisée ✓" : `${tnd(p.monthly)} par mois · ${p.deadline}`}</span>
                </span>
                <span className="text-sombre/25 rtl:rotate-180">›</span>
              </Card>
            );
          })}
          {s.piggies.filter((p) => !p.used).length < 3 && (
            <button onClick={() => setCreating(true)} className="flex min-h-14 w-full items-center justify-center rounded-3xl border-2 border-dashed border-sombre/15 text-sm font-semibold text-sombre/50">
              + Nouvelle tirelire
            </button>
          )}
        </div>
      )}

      <Section title={t("children")}>
        <div className="flex gap-4">
          {s.children.map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-xl font-bold text-sang shadow-sm">{c.name[0]}</span>
              <span className="text-xs font-medium">{c.name}</span>
              <span className="text-[10px] text-sombre/40">{c.age} ans</span>
            </div>
          ))}
          <button onClick={() => setAddingChild(true)} className="flex flex-col items-center gap-1">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-sombre/20 text-xl text-sombre/40">+</span>
            <span className="text-xs text-sombre/50">Ajouter</span>
          </button>
        </div>
      </Section>

      {/* Nouvelle tirelire */}
      <Sheet open={creating} onClose={() => setCreating(false)} title="Nouvelle tirelire">
        <div className="space-y-2">
          {(Object.keys(TYPES) as PiggyType[]).map((type) => {
            const exists = s.piggies.some((p) => p.type === type && !p.used);
            return (
              <Card key={type} onClick={exists ? undefined : () => create(type)} className={`flex items-center gap-4 ${exists ? "opacity-40" : ""}`}>
                <span className="text-3xl">{TYPES[type].icon}</span>
                <span className="flex-1">
                  <span className="block font-bold">{t(type)}</span>
                  <span className="block text-xs text-sombre/50">
                    Objectif {tnd(TYPES[type].target)} · {tnd(TYPES[type].monthly)} / mois
                  </span>
                </span>
                {exists && <span className="text-xs">Déjà ouverte</span>}
              </Card>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-sombre/40">1 TND de frais par mois et par tirelire, 3 TND maximum</p>
      </Sheet>

      {/* Détail d'une tirelire */}
      <Sheet
        open={!!pg}
        onClose={() => {
          setOpenId(null);
          setMode(null);
        }}
        onBack={mode ? () => setMode(null) : () => setOpenId(null)}
      >
        {pg && conf && (
          <>
            <div className="flex flex-col items-center text-center">
              <Ring value={pct(pg.balance, pg.target)} size={110} color={pg.used ? "#10b981" : conf.color}>
                <span className="text-4xl">{conf.icon}</span>
              </Ring>
              <h3 className="mt-3 text-2xl font-extrabold">{t(pg.type)}</h3>
              <div className="text-3xl font-black">{tnd(pg.balance)}</div>
              <div className="text-sm text-sombre/50">sur {tnd(pg.target)} · {pg.deadline}</div>
            </div>

            {!pg.used && !mode && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  variant="soft"
                  onClick={() => {
                    setAmount("");
                    setMode("deposit");
                  }}
                >
                  + Verser
                </Button>
                <Button
                  variant="soft"
                  onClick={() => {
                    setAmount("100");
                    setMode("invite");
                  }}
                >
                  🌍 Inviter un proche
                </Button>
              </div>
            )}

            {mode && (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold">{mode === "deposit" ? "Combien veux-tu verser ?" : "Un proche à l'étranger participe"}</p>
                {mode === "invite" && (
                  <>
                    <input className="w-full rounded-2xl bg-white px-4 py-3" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} placeholder="Nom" />
                    <input className="w-full rounded-2xl bg-white px-4 py-3" value={guest.city} onChange={(e) => setGuest({ ...guest, city: e.target.value })} placeholder="Ville" />
                  </>
                )}
                <AmountInput value={amount} onChange={setAmount} />
                {amount !== "" && !validAmount && <p className="text-xs text-sang">Saisis un montant entre 1 et 5 000 TND.</p>}
                <Button
                  className="w-full"
                  disabled={!validAmount}
                  onClick={async () => {
                    if (mode === "deposit") {
                      if (!(await askPayment(`Versement · ${t(pg.type)}`, value))) return;
                      actions.depositPiggy(pg.id, value);
                      toast(`+${value} TND dans ta tirelire`);
                    } else {
                      actions.inviteContributor(guest.name, guest.city, guest.city === "Lyon" ? "France" : "Étranger", pg.id, value);
                      toast(`${guest.name} a participé : +${value} TND`);
                    }
                    setMode(null);
                  }}
                >
                  {mode === "deposit" ? `Verser ${validAmount ? tnd(value) : ""}` : "Envoyer l'invitation"}
                </Button>
              </div>
            )}

            {!pg.used && !mode && (
              <Card className="mt-4">
                <div className="text-xs text-sombre/50">Offre groupée du club</div>
                <div className="font-bold">{conf.offer}</div>
                <div className="text-sm text-sombre/60">{tnd(conf.offerPrice)}</div>
                <Button className="mt-3 w-full" disabled={pg.balance <= 0} onClick={use}>
                  Utiliser ma tirelire
                </Button>
              </Card>
            )}

            {pg.movements.length > 0 && (
              <div className="mt-4">
                <List>
                  {pg.movements.slice(0, 6).map((m) => (
                    <Row
                      key={m.id}
                      title={m.label}
                      sub={m.date}
                      right={
                        <span className={`shrink-0 font-semibold ${m.amount >= 0 ? "text-emerald-700" : "text-sang"}`}>
                          {m.amount >= 0 ? "+" : ""}
                          {tnd(m.amount)}
                        </span>
                      }
                    />
                  ))}
                </List>
              </div>
            )}
          </>
        )}
      </Sheet>

      {/* Ajouter un enfant */}
      <Sheet open={addingChild} onClose={() => setAddingChild(false)} title="Ajouter un enfant">
        <input className="w-full rounded-2xl bg-white px-4 py-3" placeholder="Prénom" value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} />
        <input type="number" min={0} max={17} className="mt-2 w-full rounded-2xl bg-white px-4 py-3" value={child.age} onChange={(e) => setChild({ ...child, age: Number(e.target.value) })} aria-label="Âge" />
        <p className="mt-2 text-xs text-sombre/50">Pas de compte pour les enfants : seulement le prénom et l'âge.</p>
        <Button
          className="mt-4 w-full"
          disabled={!child.name.trim()}
          onClick={() => {
            actions.addChild(child.name.trim(), child.age);
            setChild({ name: "", age: 8 });
            setAddingChild(false);
          }}
        >
          Ajouter
        </Button>
      </Sheet>
    </>
  );
}

