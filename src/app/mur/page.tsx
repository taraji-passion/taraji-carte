"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store";
import { PageHeader, useT } from "@/components/ui";
import { LiveWall } from "@/components/LiveWall";

export default function MurPage() {
  const s = useAppState();
  const t = useT();
  const [matchId, setMatchId] = useState(s.matches[0].id);

  return (
    <>
      <Link href="/matchs" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-sang">
        <span className="rtl:rotate-180">‹</span> {t("navMatches")}
      </Link>
      <PageHeader title={t("liveWall")} />

      <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1">
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

      <LiveWall matchId={matchId} />
    </>
  );
}
