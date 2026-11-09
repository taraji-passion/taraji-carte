"use client";

import { useState } from "react";
import { actions, ACCOUNT_CAP, PASS_PLANS, useAppState } from "@/lib/store";
import { AmountInput, askPayment, Button, Sheet, toast } from "./ui";
import { confetti } from "./fx";
import { tnd } from "@/lib/format";

/** Ajouter de l'argent sur le crédit voyage, montant libre. */
export function TopUpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAppState();
  const [amount, setAmount] = useState("");
  const value = Math.round(Number(amount.replace(",", ".")) || 0);
  const room = Math.max(0, ACCOUNT_CAP - s.pass.credit);
  const tooMuch = value > room;
  const valid = value >= 1 && !tooMuch;
  const monthly = s.pass.plan ? PASS_PLANS[s.pass.plan].credit : 0;

  async function add() {
    if (!(await askPayment("Ajout au crédit voyage", value, ["Depuis ton portefeuille MyTaraji", "Le crédit reste à toi, remboursable"]))) return;
    actions.topUpCredit(value);
    setAmount("");
    onClose();
    confetti(50);
    toast(`+${value} TND sur ton crédit voyage`);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Ajouter à mon crédit voyage">
      <p className="-mt-2 mb-4 text-sm text-sombre/60">
        Solde actuel : <strong>{tnd(s.pass.credit)}</strong>
      </p>
      <AmountInput value={amount} onChange={setAmount} />
      {tooMuch && <p className="mt-2 text-xs text-sang">Maximum {tnd(room)} : le compte MyTaraji niveau 1 est plafonné à {tnd(ACCOUNT_CAP)}.</p>}
      <Button className="mt-5 w-full" disabled={!valid} onClick={add}>
        Ajouter {valid ? tnd(value) : ""}
      </Button>
      <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-sombre/70">
        🔁 Ton crédit monte aussi <strong>automatiquement de {tnd(monthly)}</strong> le 1er de chaque mois, grâce à ton abonnement au Pass.
      </div>
    </Sheet>
  );
}
