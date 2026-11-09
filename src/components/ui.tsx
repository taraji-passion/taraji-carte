"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useAppState } from "@/lib/store";
import { translate, type Key } from "@/lib/i18n";
import { tnd } from "@/lib/format";

export function useT() {
  const { lang } = useAppState();
  return (key: Key) => translate(lang, key);
}

/* ------------------------------------------------------------------ */
/* Mise en page                                                        */
/* ------------------------------------------------------------------ */

/** Grand titre d'écran, façon iOS. */
export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 pb-4 pt-2">
      <div className="min-w-0">
        {subtitle && <p className="text-sm text-sombre/50">{subtitle}</p>}
        <h1 className="truncate text-[28px] font-extrabold leading-tight tracking-tight">{title}</h1>
      </div>
      {right}
    </header>
  );
}

export function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      {(title || action) && (
        <div className="mb-2 flex items-center justify-between">
          {title && <h2 className="text-[17px] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const bg = /(^|\s)bg-/.test(className) ? "" : "bg-white";
  const cls = `block w-full rounded-3xl p-4 text-start shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${bg} ${className}`;
  if (onClick) {
    return (
      <button onClick={onClick} className={`${cls} transition active:scale-[0.99]`}>
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "gold" | "ghost" | "dark" | "soft";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
};

export function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }: BtnProps) {
  const styles = {
    primary: "bg-sang text-white shadow-[0_8px_20px_-8px_rgba(181,18,27,0.7)]",
    gold: "bg-or text-sombre shadow-[0_8px_20px_-8px_rgba(242,183,5,0.8)]",
    ghost: "bg-transparent text-sang",
    dark: "bg-sombre text-white",
    soft: "bg-sang/10 text-sang",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-35 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Progress({ value, color = "bg-or", label }: { value: number; color?: string; label?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sombre/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

/** Anneau de progression (tirelires). */
export function Ring({ value, size = 64, color = "#B5121B", children }: { value: number; size?: number; color?: string; children?: ReactNode }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1C141414" strokeWidth={7} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-bold">{children}</div>
    </div>
  );
}

export function Badge({ children, tone = "or" }: { children: ReactNode; tone?: "or" | "sang" | "vert" | "gris" }) {
  const t = { or: "bg-or/20 text-[#7a5b00]", sang: "bg-sang/10 text-sang", vert: "bg-emerald-100 text-emerald-800", gris: "bg-sombre/10 text-sombre/60" }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <Card>
      <div className="text-xs text-sombre/50">{label}</div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
      {sub && <div className="text-[11px] text-sombre/40">{sub}</div>}
    </Card>
  );
}

/** Choix exclusif en pastilles. */
export function Segmented<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="flex gap-1 rounded-2xl bg-sombre/[0.06] p-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`min-h-10 flex-1 rounded-xl px-2 text-sm font-semibold transition ${value === it.id ? "bg-white text-sombre shadow-sm" : "text-sombre/50"}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Ligne de liste (réglages, historique…). */
export function Row({ icon, title, sub, right, onClick }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void }) {
  const content = (
    <>
      {icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-creme text-lg">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{title}</span>
        {sub && <span className="block truncate text-xs text-sombre/50">{sub}</span>}
      </span>
      {right ?? (onClick && <span className="text-sombre/25 rtl:rotate-180">›</span>)}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-3 text-start";
  return onClick ? (
    <button onClick={onClick} className={cls}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-sombre/[0.06] overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Panneau qui glisse du bas (bottom sheet)                            */
/* ------------------------------------------------------------------ */

/** onBack (facultatif) : action du bouton Retour, par défaut il ferme le panneau. */
export function Sheet({ open, onClose, onBack, title, children }: { open: boolean; onClose: () => void; onBack?: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="sheet-backdrop absolute inset-0 bg-black/40" onClick={onClose} aria-label="Fermer" />
      <div className="sheet-up relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-creme px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-2xl">
        {/* En-tête fixe : le bouton Retour reste visible même quand le contenu défile */}
        <div className="sticky top-0 z-10 -mx-5 mb-2 bg-creme/95 px-5 pb-1 pt-2 backdrop-blur">
          <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-sombre/15" />
          <button onClick={onBack ?? onClose} className="-ms-1 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-sang">
            <span className="text-lg leading-none rtl:rotate-180">‹</span> Retour
          </button>
        </div>
        {title && <h3 className="mb-4 text-xl font-extrabold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paiement simulé                                                     */
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
    <div className="fixed inset-0 z-[55] flex items-end justify-center" role="dialog" aria-modal="true">
      <button className="sheet-backdrop absolute inset-0 bg-black/50" onClick={() => close(false)} aria-label="Fermer" />
      <div className="sheet-up relative w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-2 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-sombre/15" />
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sombre text-sm font-black text-or">MT</span>
          <div>
            <div className="text-xs font-semibold text-sombre/50">MyTaraji · paiement simulé</div>
            <div className="font-bold">{req.title}</div>
          </div>
        </div>
        {req.lines && (
          <ul className="mt-4 space-y-1.5 text-sm text-sombre/70">
            {req.lines.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                {l}
              </li>
            ))}
          </ul>
        )}
        <div className="my-5 text-center text-4xl font-black tracking-tight">{tnd(req.amount)}</div>
        <Button className="w-full" onClick={() => close(true)}>
          {t("pay")}
        </Button>
        <button className="mt-2 min-h-11 w-full text-sm font-semibold text-sombre/50" onClick={() => close(false)}>
          {t("cancel")}
        </button>
        <p className="mt-1 text-center text-[11px] text-sombre/40">{t("simulatedPayment")}</p>
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
  }, 2800);
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
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4" role="status">
      <div className="page-in rounded-full bg-sombre px-5 py-3 text-sm font-medium text-white shadow-lg">{msg}</div>
    </div>
  );
}

/** Saisie libre d'un montant en TND, avec raccourcis. */
export function AmountInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 rounded-2xl bg-white px-4 py-3 ring-2 ring-transparent focus-within:ring-sang">
        <input
          inputMode="decimal"
          autoFocus
          aria-label="Montant en TND"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
          className="min-w-0 flex-1 bg-transparent text-3xl font-black outline-none"
        />
        <span className="text-lg font-bold text-sombre/40">TND</span>
      </div>
      <div className="mt-2 flex gap-2">
        {[20, 50, 100, 200].map((a) => (
          <button key={a} onClick={() => onChange(String(a))} className={`min-h-10 flex-1 rounded-xl text-sm font-semibold ${value === String(a) ? "bg-sombre text-white" : "bg-white"}`}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
