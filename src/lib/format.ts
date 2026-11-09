export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function tnd(n: number): string {
  return `${nf.format(Math.round(n))} TND`;
}

export function num(n: number): string {
  return nf.format(Math.round(n));
}

// Mois de démo : index 0 = janvier 2027 (lancement le 15 janvier 2027)
const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export function monthLabel(index: number): string {
  const y = 2027 + Math.floor(index / 12);
  return `${MONTHS_FR[((index % 12) + 12) % 12]} ${y}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function pct(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}
