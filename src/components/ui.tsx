"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { useAppState } from "@/lib/store";
import { translate, type Key } from "@/lib/i18n";
import { tnd } from "@/lib/format";

export function useT() {
  const { lang } = useAppState();
  return (key: Key) => translate(lang, key);
}

/** En-tête d'une « fenêtre » : une fonctionnalité par écran, avec retour à l'accueil. */
export function Screen({ title, icon, subtitle, children, back = "/" }: { title: string; icon: string; subtitle?: string; children: ReactNode; back?: string }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={back} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-black/5" aria-label={t("back")}>
          <span className="rtl:rotate-180">←</span>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">
            <span className="me-1">{icon}</span>
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-sombre/60">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const bg = /(^|\s)bg-/.test(className) ? "" : "bg-white";
  return <section className={`rounded-2xl p-4 shadow-sm ring-1 ring-black/5 ${bg} ${className}`}>{children}</section>;
}

export function H2({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold text-sombre">{children}</h2>
      {right}
    </div>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "gold" | "ghost" | "dark";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
};

export function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }: BtnProps) {
  const styles = {
    primary: "bg-sang text-white hover:bg-sang-dark",
    gold: "bg-or text-sombre hover:brightness-95",
    ghost: "bg-transparent text-sang ring-1 ring-sang/40 hover:bg-sang/5",
    dark: "bg-sombre text-creme hover:bg-black",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Progress({ value, color = "bg-or", label }: { value: number; color?: string; label?: string }) {
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-sombre/10"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Badge({ children, tone = "or" }: { children: ReactNode; tone?: "or" | "sang" | "vert" | "gris" }) {
  const t = {
    or: "bg-or/20 text-[#7a5b00]",
    sang: "bg-sang/10 text-sang",
    vert: "bg-emerald-100 text-emerald-800",
    gris: "bg-sombre/10 text-sombre/70",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-or/15 px-3 py-2 text-xs text-sombre/80 ring-1 ring-or/40">{children}</p>;
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-creme p-3 ring-1 ring-black/5">
      <div className="text-xs text-sombre/60">{label}</div>
      <div className="text-lg font-bold text-sombre">{value}</div>
      {sub && <div className="text-xs text-sombre/50">{sub}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-sombre/5 p-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`min-h-10 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition ${value === it.id ? "bg-white text-sang shadow" : "text-sombre/60"}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paiement simulé (modale globale)                                    */
/* ------------------------------------------------------------------ */

type PayRequest = { title: string; amount: number; lines?: string[]; resolve: (ok: boolean) => void } | null;
let payReq: PayRequest = null;
const payListeners = new Set<() => void>();
const setPay = (r: PayRequest) => {
  payReq = r;
  payListeners.forEach((l) => l());
};

export function askPayment(title: string, amount: number, lines?: string[]): Promise<boolean> {
  return new Promise((resolve) => setPay({ title, amount, lines, resolve }));
}

export function PaymentModal() {
  const t = useT();
  const req = useSyncExternalStore(
    (cb) => {
      payListeners.add(cb);
      return () => payListeners.delete(cb);
    },
    () => payReq,
    () => null,
  );
  if (!req) return null;
  const close = (ok: boolean) => {
    req.resolve(ok);
    setPay(null);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sang">{t("simulatedPayment")}</div>
        <h3 className="text-lg font-bold text-sombre">{req.title}</h3>
        {req.lines && (
          <ul className="mt-3 space-y-1 text-sm text-sombre/80">
            {req.lines.map((l) => (
              <li key={l}>• {l}</li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-creme p-3">
          <span className="text-sm text-sombre/70">Total</span>
          <span className="text-xl font-extrabold text-sombre">{tnd(req.amount)}</span>
        </div>
        <p className="mt-2 text-xs text-sombre/50">Aucun vrai paiement. En V1, le paiement passera par le portefeuille MyTaraji (Zitouna Payment).</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => close(false)}>{t("cancel")}</Button>
          <Button onClick={() => close(true)}>{t("pay")}</Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

let toastMsg: string | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const toastListeners = new Set<() => void>();

export function toast(msg: string) {
  toastMsg = msg;
  toastListeners.forEach((l) => l());
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMsg = null;
    toastListeners.forEach((l) => l());
  }, 3200);
}

export function Toast() {
  const msg = useSyncExternalStore(
    (cb) => {
      toastListeners.add(cb);
      return () => toastListeners.delete(cb);
    },
    () => toastMsg,
    () => null,
  );
  if (!msg) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4" role="status">
      <div className="max-w-md rounded-xl bg-sombre px-4 py-3 text-sm text-creme shadow-lg">{msg}</div>
    </div>
  );
}

export function MatchSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const s = useAppState();
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-sombre/60">Match à domicile</label>
      <select className="w-full rounded-xl border border-black/10 bg-white px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        {s.matches.map((m) => (
          <option key={m.id} value={m.id}>
            EST – {m.opponent} · {m.date}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Réserve un écran à l'espace Admin du club. */
export function StaffOnly({ children }: { children: ReactNode }) {
  const s = useAppState();
  const role = s.session?.role;
  if (role === "admin") return <>{children}</>;
  return (
    <div className="py-16 text-center">
      <div className="text-4xl">🔒</div>
      <p className="mt-2 font-semibold">Écran réservé à l'administration</p>
      <p className="text-sm text-sombre/60">Déconnecte-toi puis connecte-toi avec l'espace « Admin ».</p>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold text-sang">← Accueil</Link>
    </div>
  );
}
