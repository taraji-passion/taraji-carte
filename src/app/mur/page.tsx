"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { MatchSelect, Screen, useT } from "@/components/ui";
import { LiveWall } from "@/components/LiveWall";

export default function MurPage() {
  const s = useAppState();
  const t = useT();
  const [matchId, setMatchId] = useState(s.matches[0].id);
  return (
    <Screen title={t("wall")} icon="📣" subtitle="Les supporters virtuels du monde entier">
      <MatchSelect value={matchId} onChange={setMatchId} />
      <LiveWall matchId={matchId} />
    </Screen>
  );
}
