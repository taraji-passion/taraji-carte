"use client";

import { actions, useAppState } from "@/lib/store";
import { Badge, Button, H2, Panel, Screen, StaffOnly, useT } from "@/components/ui";

export default function ModerationPage() {
  const s = useAppState();
  const t = useT();
  const pending = s.tickets.filter((x) => x.status === "en_attente");

  return (
    <StaffOnly>
      <Screen title={t("moderation")} icon="🛡️" subtitle="Pseudos du mur des supporters">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <H2>File de modération</H2>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-sang" checked={s.manualModeration} onChange={(e) => actions.setManualModeration(e.target.checked)} />
              Validation humaine obligatoire pour les nouveaux pseudos
            </label>
            {pending.length === 0 && <p className="text-sm text-sombre/50">Aucun pseudo en attente.</p>}
            <ul className="space-y-2">
              {pending.map((x) => (
                <li key={x.id} className="rounded-xl bg-creme p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <strong>{x.pseudo}</strong>
                    {x.autoFlag && <Badge tone="sang">Signalé par le filtre</Badge>}
                  </div>
                  <div className="text-xs text-sombre/60">
                    {x.city}, {x.country} · {x.formula} · EST – {s.matches.find((m) => m.id === x.matchId)?.opponent}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button onClick={() => actions.moderate(x.id, true)}>Valider</Button>
                    <Button variant="ghost" onClick={() => actions.moderate(x.id, false)}>
                      Refuser
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <H2>Décisions</H2>
            <ul className="divide-y divide-black/5 text-sm">
              {s.tickets
                .filter((x) => x.status !== "en_attente")
                .map((x) => (
                  <li key={x.id} className="flex items-center justify-between py-2">
                    <span>
                      {x.pseudo} <span className="text-xs text-sombre/50">· {x.city}</span>
                    </span>
                    {x.status === "valide" ? <Badge tone="vert">affiché</Badge> : <Badge tone="sang">refusé</Badge>}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-[11px] text-sombre/50">Filtre automatique de mots, puis validation humaine avant tout affichage public (écran du stade si le club l'autorise).</p>
          </Panel>
        </div>
      </Screen>
    </StaffOnly>
  );
}
