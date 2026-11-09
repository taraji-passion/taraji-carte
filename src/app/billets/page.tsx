"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { actions, isFlagged, useAppState, VIRTUAL_FORMULAS, type VirtualTicket } from "@/lib/store";
import { askPayment, Badge, Button, H2, Notice, Panel, Tabs, toast, useT } from "@/components/ui";
import { LiveWall } from "@/components/LiveWall";
import { num, tnd } from "@/lib/format";

type Tab = "virtuel" | "mur" | "solidaire";

export default function BilletsPage() {
  const s = useAppState();
  const t = useT();
  const [tab, setTab] = useState<Tab>("virtuel");
  const [matchId, setMatchId] = useState(s.matches[0].id);
  const [formula, setFormula] = useState<VirtualTicket["formula"]>("Standard");
  const [pseudo, setPseudo] = useState(s.persona.name.split(" ")[0] + "_" + s.persona.city.replace(/\s/g, ""));
  const [solKind, setSolKind] = useState<"place" | "abonnement">("place");
  const [message, setMessage] = useState("");

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
      setTab("mur");
    } else if (status === "rejete") {
      toast("Pseudo refusé par le filtre automatique");
    } else {
      toast("En attente de validation par le modérateur");
    }
  }

  async function giveDuo() {
    const ok = await askPayment("Pack Duo", 35, ["1 place virtuelle Standard (17 TND)", "1 place solidaire offerte (20 TND)", "Remise pack : −2 TND"]);
    if (!ok) return;
    actions.buyVirtual(matchId, pseudo.trim() || "Supporter_Duo", "Standard", 17);
    actions.giveSolidarity("duo", message);
    toast("Pack Duo acheté, merci !");
  }

  async function giveSolidarity() {
    const amount = solKind === "place" ? 20 : 150;
    const ok = await askPayment(solKind === "place" ? "Place solidaire" : "Abonnement solidaire (saison)", amount, [
      "Le bénéficiaire est choisi par une association partenaire puis tiré au sort",
      "Son identité n'est jamais révélée",
      message ? `Ton message : « ${message} »` : "Sans message",
    ]);
    if (!ok) return;
    actions.giveSolidarity(solKind, message);
    setMessage("");
    toast("Merci pour ta place solidaire !");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">{t("navTickets")}</h1>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "virtuel", label: t("virtualSeat") },
          { id: "mur", label: "Mur en direct" },
          { id: "solidaire", label: "Solidaire" },
        ]}
      />

      <div>
        <label className="mb-1 block text-xs font-semibold text-sombre/60">Match à domicile</label>
        <select className="w-full rounded-xl border border-black/10 bg-white px-3 py-2" value={matchId} onChange={(e) => setMatchId(e.target.value)}>
          {s.matches.map((m) => (
            <option key={m.id} value={m.id}>
              EST – {m.opponent} · {m.date}
            </option>
          ))}
        </select>
      </div>

      {tab === "virtuel" && (
        <>
          <Panel>
            <H2>{t("virtualSeat")}</H2>
            <div className="mb-3 text-xs text-sombre/60">{match.competition} · {match.stadium}</div>
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
              <Notice>⚠️ <strong>{t("noStadium")}</strong>. La billetterie officielle du stade reste inchangée.</Notice>
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
                        <div className="text-xs text-sombre/60">« {x.pseudo} » · {x.formula} · {tnd(x.price)}</div>
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
        </>
      )}

      {tab === "mur" && <LiveWall matchId={matchId} />}

      {tab === "solidaire" && (
        <>
          <Panel className="bg-gradient-to-br from-sang to-[#7a0c12] text-creme ring-0">
            <div className="text-xs font-semibold text-or">Compteur public</div>
            <div className="text-4xl font-black">{num(s.solidarityCount)}</div>
            <div className="text-sm text-creme/80">places solidaires offertes par les supporters</div>
            {s.solidarityMine > 0 && <div className="mt-2 text-xs text-or">dont {s.solidarityMine} offerte(s) par toi ❤️</div>}
          </Panel>

          <Panel>
            <H2>{t("solidarity")}</H2>
            <p className="mb-3 text-sm text-sombre/70">Offre une vraie place au stade (ou un abonnement) à un supporter qui n'en a pas les moyens.</p>
            <div className="grid grid-cols-2 gap-2">
              {(["place", "abonnement"] as const).map((k) => (
                <button key={k} onClick={() => setSolKind(k)} className={`rounded-xl p-3 text-start ring-2 ${solKind === k ? "bg-sang/5 ring-sang" : "ring-black/10"}`}>
                  <div className="font-bold">{k === "place" ? "1 place" : "1 saison"}</div>
                  <div className="text-sm text-sombre/70">{k === "place" ? tnd(20) : tnd(150)}</div>
                </button>
              ))}
            </div>
            <label className="mb-1 mt-3 block text-xs font-semibold text-sombre/60">Message au bénéficiaire (facultatif)</label>
            <input className="w-full rounded-xl border border-black/10 bg-creme px-3 py-2" value={message} maxLength={80} onChange={(e) => setMessage(e.target.value)} placeholder="Profite du match, Dima Taraji !" />
            <Button className="mt-3 w-full" onClick={giveSolidarity}>Offrir — {tnd(solKind === "place" ? 20 : 150)}</Button>
            <p className="mt-2 text-[11px] text-sombre/50">Bénéficiaires choisis par des associations partenaires, puis tirés au sort. Identité jamais révélée ; aucun mineur photographié sans accord parental.</p>
          </Panel>

          <Panel className="ring-2 ring-or">
            <H2 right={<Badge>−2 TND</Badge>}>{t("duo")}</H2>
            <p className="text-sm text-sombre/70">1 place virtuelle pour toi + 1 place solidaire offerte, pour le match sélectionné.</p>
            <Button variant="gold" className="mt-3 w-full" onClick={giveDuo}>{t("buy")} le pack Duo — {tnd(35)}</Button>
          </Panel>
        </>
      )}
    </div>
  );
}
