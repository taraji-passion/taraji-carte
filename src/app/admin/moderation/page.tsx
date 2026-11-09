"use client";

import { actions, useAppState } from "@/lib/store";
import { Badge, Button, Card, List, PageHeader, Row, Section, useT } from "@/components/ui";

export default function ModerationPage() {
  const s = useAppState();
  const t = useT();
  const pending = s.tickets.filter((x) => x.status === "en_attente");
  const done = s.tickets.filter((x) => x.status !== "en_attente");

  return (
    <>
      <PageHeader title={t("moderation")} subtitle="Pseudos du mur des supporters" />

      <Card className="flex items-center gap-3">
        <span className="flex-1 text-sm font-medium">Validation humaine de chaque pseudo</span>
        <input type="checkbox" className="h-6 w-6 accent-sang" checked={s.manualModeration} onChange={(e) => actions.setManualModeration(e.target.checked)} />
      </Card>

      <Section title={`À valider (${pending.length})`}>
        {pending.length === 0 ? (
          <Card className="text-center text-sm text-sombre/50">Tout est à jour ✓</Card>
        ) : (
          <div className="space-y-2">
            {pending.map((x) => (
              <Card key={x.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-bold">{x.pseudo}</div>
                    <div className="text-xs text-sombre/50">
                      {x.city}, {x.country}
                    </div>
                  </div>
                  {x.autoFlag && <Badge tone="sang">Signalé</Badge>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="soft" onClick={() => actions.moderate(x.id, false)}>
                    Refuser
                  </Button>
                  <Button onClick={() => actions.moderate(x.id, true)}>Valider</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {done.length > 0 && (
        <Section title="Décisions">
          <List>
            {done.map((x) => (
              <Row key={x.id} title={x.pseudo} sub={x.city} right={<Badge tone={x.status === "valide" ? "vert" : "sang"}>{x.status === "valide" ? "affiché" : "refusé"}</Badge>} />
            ))}
          </List>
        </Section>
      )}
    </>
  );
}
