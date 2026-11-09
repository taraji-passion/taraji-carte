"use client";

import { useState } from "react";
import { actions, useAppState } from "@/lib/store";
import { askPayment, Badge, Button, H2, MatchSelect, Panel, Screen, toast, useT } from "@/components/ui";
import { confetti } from "@/components/fx";
import { num, tnd } from "@/lib/format";

export default function SolidairePage() {
  const s = useAppState();
  const t = useT();
  const [kind, setKind] = useState<"place" | "abonnement">("place");
  const [message, setMessage] = useState("");
  const [matchId, setMatchId] = useState(s.matches[0].id);

  async function give() {
    const amount = kind === "place" ? 20 : 150;
    const ok = await askPayment(kind === "place" ? "Place solidaire" : "Abonnement solidaire (saison)", amount, [
      "Le bénéficiaire est choisi par une association partenaire puis tiré au sort",
      "Son identité n'est jamais révélée",
      message ? `Ton message : « ${message} »` : "Sans message",
    ]);
    if (!ok) return;
    actions.giveSolidarity(kind, message);
    confetti(60);
    setMessage("");
    toast("Merci pour ta place solidaire !");
  }

  async function giveDuo() {
    const ok = await askPayment("Pack Duo", 35, ["1 place virtuelle Standard (17 TND)", "1 place solidaire offerte (20 TND)", "Remise pack : −2 TND"]);
    if (!ok) return;
    const pseudo = s.persona.name.split(" ")[0] + "_Duo";
    actions.buyVirtual(matchId, pseudo, "Standard", 17);
    actions.giveSolidarity("duo", message);
    confetti(80);
    toast("Pack Duo acheté, merci !");
  }

  return (
    <Screen title={t("solidarity")} icon="❤️" subtitle="Offre une place à un supporter qui n'en a pas les moyens">
      <Panel className="bg-gradient-to-br from-sang to-[#7a0c12] text-creme ring-0">
        <div className="text-xs font-semibold text-or">Compteur public</div>
        <div className="text-4xl font-black">{num(s.solidarityCount)}</div>
        <div className="text-sm text-creme/80">places solidaires offertes par les supporters</div>
        {s.solidarityMine > 0 && <div className="mt-2 text-xs text-or">dont {s.solidarityMine} offerte(s) par toi ❤️</div>}
      </Panel>

      <Panel>
        <H2>Offrir une place</H2>
        <div className="grid grid-cols-2 gap-2">
          {(["place", "abonnement"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`rounded-xl p-3 text-start ring-2 ${kind === k ? "bg-sang/5 ring-sang" : "ring-black/10"}`}>
              <div className="font-bold">{k === "place" ? "1 place" : "1 saison"}</div>
              <div className="text-sm text-sombre/70">{k === "place" ? tnd(20) : tnd(150)}</div>
            </button>
          ))}
        </div>
        <label className="mb-1 mt-3 block text-xs font-semibold text-sombre/60">Message au bénéficiaire (facultatif)</label>
        <input className="w-full rounded-xl border border-black/10 bg-creme px-3 py-2" value={message} maxLength={80} onChange={(e) => setMessage(e.target.value)} placeholder="Profite du match, Dima Taraji !" />
        <Button className="mt-3 w-full" onClick={give}>
          Offrir — {tnd(kind === "place" ? 20 : 150)}
        </Button>
        <p className="mt-2 text-[11px] text-sombre/50">Bénéficiaires choisis par des associations partenaires, puis tirés au sort. Identité jamais révélée ; aucun mineur photographié sans accord parental.</p>
      </Panel>

      <Panel className="bg-white ring-2 ring-or">
        <H2 right={<Badge>−2 TND</Badge>}>{t("duo")}</H2>
        <p className="mb-3 text-sm text-sombre/70">1 place virtuelle pour toi + 1 place solidaire offerte.</p>
        <MatchSelect value={matchId} onChange={setMatchId} />
        <Button variant="gold" className="mt-3 w-full" onClick={giveDuo}>
          {t("buy")} le pack Duo — {tnd(35)}
        </Button>
      </Panel>
    </Screen>
  );
}
