"use client";

import { useState } from "react";
import { actions, isFlagged, useAppState, VIRTUAL_FORMULAS, type VirtualTicket } from "@/lib/store";
import { askPayment, Button, Card, PageHeader, Section, Segmented, Sheet, toast, useT } from "@/components/ui";
import { Crest } from "@/components/Crest";
import { LiveWall } from "@/components/LiveWall";
import { confetti } from "@/components/fx";
import { num, tnd } from "@/lib/format";

const SOLIDARITY_DUO = 18; // place solidaire ajoutée au pack Duo

export default function MatchsPage() {
  const s = useAppState();
  const t = useT();
  const [matchId, setMatchId] = useState(s.matches[0].id);
  const [buying, setBuying] = useState(false);
  const [formula, setFormula] = useState<VirtualTicket["formula"]>("Standard");
  const [pseudo, setPseudo] = useState(`${s.persona.name.split(" ")[0]}_${s.persona.city.replace(/\s/g, "")}`);
  const [duo, setDuo] = useState(false);
  const [giving, setGiving] = useState(false);
  const [solKind, setSolKind] = useState<"place" | "abonnement">("place");

  const match = s.matches.find((m) => m.id === matchId)!;
  const price = VIRTUAL_FORMULAS.find((f) => f.formula === formula)!.price;
  const total = price + (duo ? SOLIDARITY_DUO : 0);
  const flagged = pseudo.trim().length > 0 && isFlagged(pseudo);
  const myTicket = s.tickets.find((x) => x.mine && x.matchId === matchId && x.status !== "rejete");

  async function buy() {
    const ok = await askPayment(`Place virtuelle · EST – ${match.opponent}`, total, [
      `Formule ${formula}, pseudo « ${pseudo.trim()} »`,
      duo ? "Pack Duo : une place solidaire offerte" : "Badge du match et QR code",
      "Sans accès au stade",
    ]);
    if (!ok) return;
    const status = actions.buyVirtual(matchId, pseudo.trim(), formula, price);
    if (duo) actions.giveSolidarity("duo", "");
    setBuying(false);
    if (status === "valide") {
      confetti();
      toast("Tu es dans le stade virtuel !");
    } else if (status === "en_attente") {
      toast("Pseudo en cours de validation");
    } else {
      toast("Pseudo refusé, choisis-en un autre");
    }
  }

  async function give() {
    const amount = solKind === "place" ? 20 : 150;
    const ok = await askPayment(solKind === "place" ? "Place solidaire" : "Saison solidaire", amount, ["Attribuée par une association partenaire", "Bénéficiaire jamais révélé"]);
    if (!ok) return;
    actions.giveSolidarity(solKind, "");
    setGiving(false);
    confetti(60);
    toast("Merci pour ta générosité ❤️");
  }

  return (
    <>
      <PageHeader title={t("navMatches")} />

      {/* Choix du match */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {s.matches.map((m) => (
          <button
            key={m.id}
            onClick={() => setMatchId(m.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${m.id === matchId ? "bg-sombre text-white" : "bg-white text-sombre/60"}`}
          >
            vs {m.opponent}
          </button>
        ))}
      </div>

      {/* Affiche du match */}
      <div className="mt-4 rounded-[28px] bg-[radial-gradient(ellipse_at_top,#5a1016,#1C1414_70%)] p-5 text-white shadow-xl">
        <div className="text-center text-[11px] font-semibold uppercase tracking-wider text-or">{match.competition}</div>
        <div className="mt-4 flex items-center justify-around">
          <Crest name="EST" size={60} />
          <div className="text-center">
            <div className="text-3xl font-black">VS</div>
          </div>
          <Crest name={match.opponent} size={60} />
        </div>
        <div className="mt-3 text-center">
          <div className="font-bold">Espérance – {match.opponent}</div>
          <div className="text-xs text-white/60">{match.date}</div>
        </div>
        {myTicket ? (
          <div className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-sm font-semibold text-emerald-300">
            ✓ Tu es dans le stade virtuel · « {myTicket.pseudo} »
          </div>
        ) : (
          <Button variant="gold" className="mt-5 w-full" onClick={() => setBuying(true)}>
            Prendre ma place virtuelle · dès 17 TND
          </Button>
        )}
      </div>

      <Section title={t("liveWall")}>
        <LiveWall matchId={matchId} />
      </Section>

      <Section>
        <Card onClick={() => setGiving(true)} className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sang/10 text-2xl">❤️</span>
          <span className="flex-1">
            <span className="block font-bold">Offrir une place</span>
            <span className="block text-xs text-sombre/50">{num(s.solidarityCount)} places déjà offertes par les supporters</span>
          </span>
          <span className="text-sombre/25 rtl:rotate-180">›</span>
        </Card>
      </Section>

      {/* Achat de la place virtuelle */}
      <Sheet open={buying} onClose={() => setBuying(false)} title={t("virtualSeat")}>
        <Segmented
          value={formula}
          onChange={setFormula}
          items={VIRTUAL_FORMULAS.map((f) => ({ id: f.formula, label: `${f.formula} · ${f.price}` }))}
        />
        <p className="mt-2 text-xs text-sombre/50">{VIRTUAL_FORMULAS.find((f) => f.formula === formula)!.desc}</p>

        <label className="mt-4 block text-sm font-semibold">
          Ton pseudo sur le mur
          <input
            className={`mt-1 w-full rounded-2xl border bg-white px-4 py-3 font-normal ${flagged ? "border-sang" : "border-transparent"}`}
            value={pseudo}
            maxLength={24}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </label>
        {flagged && <p className="mt-1 text-xs text-sang">Ce pseudo contient un mot interdit.</p>}

        <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
          <span className="text-2xl">🤝</span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">Pack Duo</span>
            <span className="block text-xs text-sombre/50">Offre aussi une vraie place à un supporter (+{SOLIDARITY_DUO} TND)</span>
          </span>
          <input type="checkbox" checked={duo} onChange={(e) => setDuo(e.target.checked)} className="h-6 w-6 accent-sang" />
        </label>

        <Button className="mt-5 w-full" disabled={!pseudo.trim() || flagged} onClick={buy}>
          {t("buy")} · {tnd(total)}
        </Button>
        <p className="mt-2 text-center text-[11px] text-sombre/40">{t("noStadium")}</p>
      </Sheet>

      {/* Billet solidaire */}
      <Sheet open={giving} onClose={() => setGiving(false)} title="Offrir une place">
        <p className="text-sm text-sombre/60">Une association partenaire choisit un supporter qui n'a pas les moyens d'aller au stade.</p>
        <div className="mt-4">
          <Segmented
            value={solKind}
            onChange={setSolKind}
            items={[
              { id: "place", label: "1 match · 20 TND" },
              { id: "abonnement", label: "1 saison · 150 TND" },
            ]}
          />
        </div>
        <Button className="mt-5 w-full" onClick={give}>
          Offrir · {tnd(solKind === "place" ? 20 : 150)}
        </Button>
      </Sheet>
    </>
  );
}
