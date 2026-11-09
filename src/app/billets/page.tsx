"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { actions, isFlagged, useAppState, VIRTUAL_FORMULAS, type VirtualTicket } from "@/lib/store";
import { askPayment, Badge, Button, H2, MatchSelect, Notice, Panel, Screen, toast, useT } from "@/components/ui";
import { tnd } from "@/lib/format";

export default function BilletsPage() {
  const s = useAppState();
  const t = useT();
  const router = useRouter();
  const [matchId, setMatchId] = useState(s.matches[0].id);
  const [formula, setFormula] = useState<VirtualTicket["formula"]>("Standard");
  const [pseudo, setPseudo] = useState(s.persona.name.split(" ")[0] + "_" + s.persona.city.replace(/\s/g, ""));

  const price = VIRTUAL_FORMULAS.find((f) => f.formula === formula)!.price;
  const flagged = pseudo.trim().length > 0 && isFlagged(pseudo);
  const match = s.matches.find((m) => m.id === matchId)!;
  const myTickets = s.tickets.filter((x) => x.mine);

  async function buy() {
    const ok = await askPayment(`Place virtuelle ${formula} — EST vs ${match.opponent}`, price, [
      "Place virtuelle, sans accès au stade",
      `Pseudo affiché : « ${pseudo} » (après modération)`,
      "Badge du match et QR code de preuve d'achat",
    ]);
    if (!ok) return;
    const status = actions.buyVirtual(matchId, pseudo.trim(), formula, price);
    if (status === "valide") {
      toast("Ton pseudo est sur le mur !");
      router.push("/mur");
    } else if (status === "rejete") {
      toast("Pseudo refusé par le filtre automatique");
    } else {
      toast("En attente de validation par le modérateur");
    }
  }

  return (
    <Screen title={t("virtualSeat")} icon="🎟️" subtitle="Sois présent au stade, où que tu sois">
      <MatchSelect value={matchId} onChange={setMatchId} />
      <Panel>
        <div className="mb-3 text-xs text-sombre/60">
          {match.competition} · {match.stadium}
        </div>
        <div className="space-y-2">
          {VIRTUAL_FORMULAS.map((f) => (
            <label key={f.formula} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-2 ${formula === f.formula ? "bg-sang/5 ring-sang" : "ring-black/10"}`}>
              <input type="radio" checked={formula === f.formula} onChange={() => setFormula(f.formula)} className="accent-sang" />
              <div className="flex-1">
                <div className="font-bold">{f.formula}</div>
                <div className="text-xs text-sombre/60">{f.desc}</div>
              </div>
              <div className="font-extrabold">{tnd(f.price)}</div>
            </label>
          ))}
        </div>
        <label className="mb-1 mt-4 block text-xs font-semibold text-sombre/60">Ton pseudo sur le mur</label>
        <input
          className={`w-full rounded-xl border px-3 py-2 ${flagged ? "border-sang bg-sang/5" : "border-black/10 bg-creme"}`}
          value={pseudo}
          maxLength={24}
          onChange={(e) => setPseudo(e.target.value)}
        />
        {flagged && <p className="mt-1 text-xs text-sang">Ce pseudo contient un mot interdit : il sera refusé par le filtre automatique.</p>}
        <div className="mt-3">
          <Notice>
            ⚠️ <strong>{t("noStadium")}</strong>. La billetterie officielle du stade reste inchangée.
          </Notice>
        </div>
        <Button className="mt-3 w-full" disabled={!pseudo.trim() || flagged} onClick={buy}>
          {t("buy")} — {tnd(price)}
        </Button>
      </Panel>

      {myTickets.length > 0 && (
        <Panel>
          <H2>Mes places virtuelles</H2>
          <div className="space-y-3">
            {myTickets.map((x) => {
              const m = s.matches.find((mm) => mm.id === x.matchId);
              return (
                <div key={x.id} className="flex items-center gap-3 rounded-xl bg-creme p-3">
                  <div className="rounded-lg bg-white p-1">
                    <QRCodeSVG value={`TARAJI-VT:${x.id}:${x.pseudo}`} size={56} fgColor="#1C1414" />
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-bold">EST – {m?.opponent}</div>
                    <div className="text-xs text-sombre/60">
                      « {x.pseudo} » · {x.formula} · {tnd(x.price)}
                    </div>
                    <div className="mt-1">
                      {x.status === "valide" && <Badge tone="vert">Sur le mur ✓</Badge>}
                      {x.status === "en_attente" && <Badge>En modération</Badge>}
                      {x.status === "rejete" && <Badge tone="sang">Pseudo refusé</Badge>}
                      <span className="ms-2 text-[10px] text-sombre/50">🏅 Badge du match</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </Screen>
  );
}
