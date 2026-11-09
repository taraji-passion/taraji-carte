"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store";
import { Button, List, PageHeader, Row, Section, useT } from "@/components/ui";
import { Crest } from "@/components/Crest";
import { GiftSheet, VirtualSeatSheet } from "@/components/TicketSheets";
import { num } from "@/lib/format";

export default function MatchsPage() {
  const s = useAppState();
  const t = useT();
  const [matchId, setMatchId] = useState(s.matches[0].id);
  const [buying, setBuying] = useState(false);
  const [giving, setGiving] = useState(false);
  const match = s.matches.find((m) => m.id === matchId)!;
  const myTicket = s.tickets.find((x) => x.mine && x.matchId === matchId && x.status !== "rejete");

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
          <div className="text-3xl font-black">VS</div>
          <Crest name={match.opponent} size={60} />
        </div>
        <div className="mt-3 text-center">
          <div className="font-bold">Espérance – {match.opponent}</div>
          <div className="text-xs text-white/60">{match.date}</div>
          <div className="text-xs text-white/40">{match.stadium}</div>
        </div>
        {myTicket ? (
          <div className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500/20 px-3 text-center text-sm font-semibold text-emerald-300">
            ✓ Tu as ta place virtuelle · « {myTicket.pseudo} »
          </div>
        ) : (
          <Button variant="gold" className="mt-5 w-full" onClick={() => setBuying(true)}>
            Prendre ma place virtuelle · dès 17 TND
          </Button>
        )}
      </div>

      <Section>
        <List>
          <Link href="/mur" className="block">
            <Row
              icon={
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sang opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-sang" />
                </span>
              }
              title={t("liveWall")}
              sub="Les supporters du monde entier, en direct"
              right={<span className="text-sombre/25 rtl:rotate-180">›</span>}
            />
          </Link>
          <Row icon="❤️" title="Offrir une place" sub={`${num(s.solidarityCount)} places déjà offertes`} onClick={() => setGiving(true)} />
        </List>
      </Section>

      <VirtualSeatSheet open={buying} onClose={() => setBuying(false)} matchId={matchId} />
      <GiftSheet open={giving} onClose={() => setGiving(false)} />
    </>
  );
}
