"use client";

import { useState } from "react";
import { actions, isFlagged, useAppState, VIRTUAL_FORMULAS, type VirtualTicket } from "@/lib/store";
import { askPayment, Button, Segmented, Sheet, toast, useT } from "./ui";
import { confetti } from "./fx";
import { tnd } from "@/lib/format";

const SOLIDARITY_DUO = 18; // place solidaire ajoutée au pack Duo

/** Achat d'une place virtuelle (panneau autonome, sans le mur). */
export function VirtualSeatSheet({ open, onClose, matchId }: { open: boolean; onClose: () => void; matchId: string }) {
  const s = useAppState();
  const t = useT();
  const [formula, setFormula] = useState<VirtualTicket["formula"]>("Standard");
  const [pseudo, setPseudo] = useState(`${s.persona.name.split(" ")[0]}_${s.persona.city.replace(/\s/g, "")}`);
  const [duo, setDuo] = useState(false);
  const match = s.matches.find((m) => m.id === matchId) ?? s.matches[0];
  const price = VIRTUAL_FORMULAS.find((f) => f.formula === formula)!.price;
  const total = price + (duo ? SOLIDARITY_DUO : 0);
  const flagged = pseudo.trim().length > 0 && isFlagged(pseudo);

  async function buy() {
    const ok = await askPayment(`Place virtuelle · EST – ${match.opponent}`, total, [
      `Formule ${formula}, pseudo « ${pseudo.trim()} »`,
      duo ? "Pack Duo : une place solidaire offerte" : "Badge du match et QR code",
      "Sans accès au stade",
    ]);
    if (!ok) return;
    const status = actions.buyVirtual(match.id, pseudo.trim(), formula, price);
    if (duo) actions.giveSolidarity("duo", "");
    onClose();
    if (status === "valide") {
      confetti();
      toast("Tu es dans le stade virtuel !");
    } else if (status === "en_attente") {
      toast("Pseudo en cours de validation");
    } else {
      toast("Pseudo refusé, choisis-en un autre");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t("virtualSeat")}>
      <p className="-mt-3 mb-4 text-sm text-sombre/50">
        EST – {match.opponent} · {match.date}
      </p>
      <Segmented value={formula} onChange={setFormula} items={VIRTUAL_FORMULAS.map((f) => ({ id: f.formula, label: `${f.formula} · ${f.price}` }))} />
      <p className="mt-2 text-xs text-sombre/50">{VIRTUAL_FORMULAS.find((f) => f.formula === formula)!.desc}</p>

      <label className="mt-4 block text-sm font-semibold">
        Ton pseudo
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
  );
}

/** Billet solidaire : offrir une place ou une saison. */
export function GiftSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAppState();
  const [kind, setKind] = useState<"place" | "abonnement">("place");

  async function give() {
    const amount = kind === "place" ? 20 : 150;
    const ok = await askPayment(kind === "place" ? "Place solidaire" : "Saison solidaire", amount, ["Attribuée par une association partenaire", "Bénéficiaire jamais révélé"]);
    if (!ok) return;
    actions.giveSolidarity(kind, "");
    onClose();
    confetti(60);
    toast("Merci pour ta générosité ❤️");
  }

  return (
    <Sheet open={open} onClose={onClose} title="Offrir une place">
      <p className="text-sm text-sombre/60">Une association partenaire choisit un supporter qui n'a pas les moyens d'aller au stade.</p>
      <div className="my-4 text-center">
        <div className="text-4xl font-black text-sang">{s.solidarityCount.toLocaleString("fr-FR")}</div>
        <div className="text-xs text-sombre/50">places déjà offertes par les supporters</div>
      </div>
      <Segmented
        value={kind}
        onChange={setKind}
        items={[
          { id: "place", label: "1 match · 20 TND" },
          { id: "abonnement", label: "1 saison · 150 TND" },
        ]}
      />
      <Button className="mt-5 w-full" onClick={give}>
        Offrir · {tnd(kind === "place" ? 20 : 150)}
      </Button>
    </Sheet>
  );
}
