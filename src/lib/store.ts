"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "./i18n";
import { monthLabel, uid } from "./format";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Level = "base" | "or" | "platine";
export type PassPlan = "voyageur" | "plus" | "diaspora";
export type PiggyType = "rentree" | "aid" | "voyage";

export interface Movement {
  id: string;
  date: string;
  label: string;
  amount: number;
  kind: "versement" | "reservation" | "report" | "remboursement" | "contribution" | "utilisation" | "gain" | "frais";
}

export interface Persona {
  id: string;
  name: string;
  city: string;
  country: string;
  diaspora: boolean;
  chapter: string;
}

export interface Trip {
  id: string;
  event: string;
  competition: string;
  destination: string;
  dates: string;
  price: number;
  publicPrice: number;
  quota: number;
  booked: number;
  status: "publie" | "annule";
  goalId?: string;
}

export interface Booking {
  id: string;
  tripId: string;
  traveler: string;
  city: string;
  creditUsed: number;
  pointsUsed: number;
  complement: number;
  date: string;
  status: "confirmee" | "reportee";
  rank: number;
}

export interface Match {
  id: string;
  opponent: string;
  competition: string;
  date: string;
  stadium: string;
}

export interface VirtualTicket {
  id: string;
  matchId: string;
  pseudo: string;
  city: string;
  country: string;
  formula: "Standard" | "Virage" | "Premium";
  price: number;
  status: "en_attente" | "valide" | "rejete";
  mine: boolean;
  autoFlag?: boolean;
}

export interface Piggy {
  id: string;
  type: PiggyType;
  label: string;
  target: number;
  deadline: string;
  monthly: number;
  balance: number;
  movements: Movement[];
  used: boolean;
}

export interface Child {
  id: string;
  name: string;
  age: number;
}

export interface Contributor {
  id: string;
  name: string;
  city: string;
  country: string;
  piggyId: string;
  total: number;
}

export interface Notification {
  id: string;
  text: string;
  date: string;
  read: boolean;
}

export type Role = "supporter" | "club" | "president";

export interface Session {
  role: Role;
  name: string;
}

export interface State {
  version: number;
  session: Session | null;
  lang: Lang;
  month: number; // mois simulé (0 = janvier 2027)
  persona: Persona;
  card: { level: Level; number: number; founder: boolean; since: string };
  pass: {
    plan: PassPlan | null;
    founder: boolean;
    credit: number;
    movements: Movement[];
  };
  founderSeatsTaken: number;
  eliminated: boolean;
  goals: { id: string; label: string; target: number }[];
  trips: Trip[];
  bookings: Booking[];
  matches: Match[];
  tickets: VirtualTicket[];
  manualModeration: boolean;
  solidarityCount: number;
  solidarityMine: number;
  piggies: Piggy[];
  children: Child[];
  contributors: Contributor[];
  points: { balance: number; movements: Movement[] };
  notifications: Notification[];
  adminLog: string[];
}

/* ------------------------------------------------------------------ */
/* Référentiels                                                         */
/* ------------------------------------------------------------------ */

export const LEVELS: Record<Level, { price: number; perks: string[] }> = {
  base: {
    price: 50,
    perks: ["Carte numérique et QR code", "Accès au mur des supporters", "Remises MyTaraji existantes"],
  },
  or: {
    price: 200,
    perks: ["Tout le niveau Base", "Priorité billetterie en ligne", "−10 % Taraji Store", "Contenus exclusifs du vestiaire"],
  },
  platine: {
    price: 680,
    perks: ["Tout le niveau Or", "Rencontre annuelle avec les joueurs", "Place virtuelle Premium offerte à chaque match", "Invitations aux événements du club"],
  },
};

export const PASS_PLANS: Record<PassPlan, { label: string; monthly: number; credit: number; fee: number; note: string }> = {
  voyageur: { label: "Voyageur", monthly: 25, credit: 23, fee: 2, note: "Supporters en Tunisie" },
  plus: { label: "Voyageur+", monthly: 50, credit: 46, fee: 4, note: "Priorité n° 1 pour l'attribution des places" },
  diaspora: { label: "Voyageur diaspora", monthly: 31, credit: 28, fee: 3, note: "Payable en devise (Tunisiens résidant à l'étranger)" },
};

export const ACCOUNT_CAP = 1500; // plafond compte de paiement niveau 1 (BCT)
export const FOUNDER_SEATS = 2000;

export const VIRTUAL_FORMULAS: { formula: VirtualTicket["formula"]; price: number; desc: string }[] = [
  { formula: "Standard", price: 17, desc: "Pseudo sur le mur + badge du match" },
  { formula: "Virage", price: 24, desc: "Pseudo en couleur + badge animé" },
  { formula: "Premium", price: 34, desc: "Pseudo en or + récap personnalisé" },
];

export const PERSONAS: Persona[] = [
  { id: "karim", name: "Karim B.", city: "Lyon", country: "France", diaspora: true, chapter: "Lyon — Taraji Rhône" },
  { id: "yassine", name: "Yassine M.", city: "Tunis", country: "Tunisie", diaspora: false, chapter: "Virage Nord — Bab Souika" },
  { id: "sami", name: "Sami K.", city: "Ben Arous", country: "Tunisie", diaspora: false, chapter: "Ben Arous" },
  { id: "leila", name: "Leila T.", city: "Milan", country: "Italie", diaspora: true, chapter: "Milano Sang et Or" },
];

export const CHAPTERS = [
  "Virage Nord — Bab Souika", "Tunis Centre", "Ben Arous", "Ariana", "Sfax", "Sousse", "Bizerte", "Nabeul",
  "Lyon — Taraji Rhône", "Paris Île-de-France", "Marseille", "Milano Sang et Or", "Roma", "Montréal", "Doha", "Dubaï", "Bruxelles", "Berlin",
];

export const BAD_WORDS = ["merde", "con", "pute", "putain", "fuck", "zebi", "nik", "vendu", "batard", "salop", "nul", "kahba"];

export function isFlagged(pseudo: string): boolean {
  const p = pseudo.toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùüÿ]/g, " ");
  return BAD_WORDS.some((w) => p.split(/\s+/).some((t) => t.includes(w)));
}

/* ------------------------------------------------------------------ */
/* État initial                                                         */
/* ------------------------------------------------------------------ */

function initialState(): State {
  return {
    version: 4,
    session: null,
    lang: "fr",
    month: 0,
    persona: PERSONAS[0],
    card: { level: "or", number: 1187, founder: true, since: "15 janv. 2027" },
    pass: { plan: null, founder: false, credit: 0, movements: [] },
    founderSeatsTaken: 1873,
    eliminated: false,
    goals: [
      { id: "caire", label: "Le Caire (CAF)", target: 750 },
      { id: "can2027", label: "CAN 2027", target: 1800 },
      { id: "maroc2029", label: "Maroc 2029", target: 2500 },
      { id: "cdm2030", label: "Coupe du monde 2030", target: 4200 },
    ],
    trips: [
      {
        id: "t-caire", event: "Quart de finale aller — Al Ahly vs EST", competition: "Ligue des champions CAF",
        destination: "Le Caire, Égypte", dates: "12 – 15 mars 2027", price: 750, publicPrice: 1870,
        quota: 300, booked: 214, status: "publie", goalId: "caire",
      },
      {
        id: "t-casa", event: "Phase de groupes — Wydad AC vs EST", competition: "Ligue des champions CAF",
        destination: "Casablanca, Maroc", dates: "6 – 8 févr. 2027", price: 690, publicPrice: 1450,
        quota: 250, booked: 97, status: "publie",
      },
      {
        id: "t-can", event: "Pack supporters CAN 2027 — phase de groupes", competition: "CAN 2027 (Kenya, Ouganda, Tanzanie)",
        destination: "Nairobi, Kenya", dates: "19 – 27 juin 2027", price: 1750, publicPrice: 3200,
        quota: 150, booked: 41, status: "publie", goalId: "can2027",
      },
    ],
    bookings: [
      { id: "b1", tripId: "t-caire", traveler: "Amine R.", city: "Tunis", creditUsed: 750, pointsUsed: 0, complement: 0, date: "janv. 2027", status: "confirmee", rank: 1 },
      { id: "b2", tripId: "t-caire", traveler: "Mohamed S.", city: "Ariana", creditUsed: 600, pointsUsed: 0, complement: 150, date: "janv. 2027", status: "confirmee", rank: 2 },
      { id: "b3", tripId: "t-caire", traveler: "Hela B.", city: "Paris", creditUsed: 750, pointsUsed: 0, complement: 0, date: "janv. 2027", status: "confirmee", rank: 3 },
      { id: "b4", tripId: "t-casa", traveler: "Oussama J.", city: "Sfax", creditUsed: 520, pointsUsed: 20, complement: 150, date: "janv. 2027", status: "confirmee", rank: 1 },
    ],
    matches: [
      { id: "m1", opponent: "Club Africain", competition: "Derby — Ligue 1", date: "Dim. 24 janv. 2027, 15h", stadium: "Stade Hammadi-Agrebi, Radès" },
      { id: "m2", opponent: "CS Sfaxien", competition: "Ligue 1", date: "Sam. 6 févr. 2027, 17h", stadium: "Stade Hammadi-Agrebi, Radès" },
      { id: "m3", opponent: "Mamelodi Sundowns", competition: "Ligue des champions CAF", date: "Ven. 19 févr. 2027, 20h", stadium: "Stade Hammadi-Agrebi, Radès" },
    ],
    tickets: [
      { id: "vt1", matchId: "m1", pseudo: "Arbitre_vendu", city: "Tunis", country: "Tunisie", formula: "Standard", price: 17, status: "en_attente", mine: false, autoFlag: true },
      { id: "vt2", matchId: "m1", pseudo: "Doha_Taraji", city: "Doha", country: "Qatar", formula: "Virage", price: 24, status: "en_attente", mine: false },
      { id: "vt3", matchId: "m1", pseudo: "Mama_Zarzis_1919", city: "Zarzis", country: "Tunisie", formula: "Standard", price: 17, status: "en_attente", mine: false },
    ],
    manualModeration: false,
    solidarityCount: 1240,
    solidarityMine: 0,
    piggies: [],
    children: [
      { id: "c1", name: "Yassine", age: 10 },
      { id: "c2", name: "Lina", age: 7 },
    ],
    contributors: [],
    points: {
      balance: 120,
      movements: [
        { id: "p1", date: "janv. 2027", label: "Adhésion Carte Supporter (Or)", amount: 100, kind: "gain" },
        { id: "p2", date: "janv. 2027", label: "Bonus Fondateur 1919", amount: 20, kind: "gain" },
      ],
    },
    notifications: [
      { id: "n0", text: "Bienvenue ! Ta Carte Supporter Or n° 1187 (édition Fondateur 1919) est active.", date: "janv. 2027", read: false },
    ],
    adminLog: [],
  };
}

/* ------------------------------------------------------------------ */
/* Store externe (localStorage)                                         */
/* ------------------------------------------------------------------ */

const KEY = "taraji-carte-demo";
let state: State = initialState();
const SERVER_STATE = state;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.version === state.version) state = parsed;
    }
  } catch {
    /* données corrompues : on repart de zéro */
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* stockage plein ou désactivé */
  }
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAppState(): State {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => SERVER_STATE,
  );
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function mutate(fn: (draft: State) => void) {
  const draft = structuredClone(state);
  fn(draft);
  state = draft;
  save();
  listeners.forEach((l) => l());
}

export function getState(): State {
  return state;
}

function notify(d: State, text: string) {
  d.notifications.unshift({ id: uid("n"), text, date: monthLabel(d.month), read: false });
}

function addPoints(d: State, amount: number, label: string) {
  d.points.balance += amount;
  d.points.movements.unshift({ id: uid("p"), date: monthLabel(d.month), label, amount, kind: amount >= 0 ? "gain" : "utilisation" });
}

/* ------------------------------------------------------------------ */
/* Actions                                                              */
/* ------------------------------------------------------------------ */

export const actions = {
  reset() {
    state = initialState();
    save();
    listeners.forEach((l) => l());
  },
  setLang(lang: Lang) {
    mutate((d) => { d.lang = lang; });
  },
  login(role: Role, personaId?: string) {
    mutate((d) => {
      if (role === "supporter") {
        const p = PERSONAS.find((x) => x.id === personaId) ?? PERSONAS[0];
        d.persona = { ...p };
        d.session = { role, name: p.name };
      } else {
        d.session = { role, name: role === "club" ? "Responsable supporters" : "Le Président" };
      }
    });
  },
  logout() {
    mutate((d) => { d.session = null; });
  },
  setPersona(id: string) {
    const p = PERSONAS.find((x) => x.id === id);
    if (p) mutate((d) => { d.persona = { ...p }; });
  },
  setChapter(chapter: string) {
    mutate((d) => {
      d.persona.chapter = chapter;
      notify(d, `Tu as rejoint le chapitre « ${chapter} ».`);
    });
  },
  setLevel(level: Level) {
    mutate((d) => {
      d.card.level = level;
      notify(d, `Ta carte passe au niveau ${level === "base" ? "Base" : level === "or" ? "Or" : "Platine"}.`);
    });
  },
  markNotificationsRead() {
    mutate((d) => d.notifications.forEach((n) => (n.read = true)));
  },

  /* --- Pass Voyageur --- */
  subscribePass(plan: PassPlan, founder: boolean) {
    mutate((d) => {
      const p = PASS_PLANS[plan];
      d.pass.plan = plan;
      if (founder && d.founderSeatsTaken < FOUNDER_SEATS && !d.pass.founder) {
        d.pass.founder = true;
        d.founderSeatsTaken += 1;
      }
      d.pass.credit += p.credit;
      d.pass.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: `1er versement ${p.label} (${p.monthly} TND dont ${p.fee} TND de frais)`, amount: p.credit, kind: "versement" });
      addPoints(d, 50, `Souscription au Pass ${p.label}`);
      notify(d, d.pass.founder
        ? `Bienvenue dans le Pass ${p.label} ! Badge « Fondateur 108 » attribué (place n° ${d.founderSeatsTaken} sur ${FOUNDER_SEATS}).`
        : `Bienvenue dans le Pass ${p.label} !`);
    });
  },
  cancelPass() {
    mutate((d) => {
      const refund = d.pass.credit;
      if (refund > 0) {
        d.pass.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: "Sortie du Pass : remboursement du crédit non utilisé", amount: -refund, kind: "remboursement" });
      }
      d.pass.credit = 0;
      d.pass.plan = null;
      notify(d, `Sortie du Pass enregistrée. ${refund} TND remboursés sur ton compte MyTaraji (simulé).`);
    });
  },
  simulateMonths(n: number) {
    mutate((d) => {
      if (!d.pass.plan) return;
      const p = PASS_PLANS[d.pass.plan];
      for (let i = 0; i < n; i++) {
        d.month += 1;
        d.pass.credit += p.credit;
        d.pass.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: `Versement mensuel ${p.label}`, amount: p.credit, kind: "versement" });
        addPoints(d, 10, "Ancienneté Pass (1 mois)");
        // Les tirelires avancent aussi
        d.piggies.forEach((pg) => {
          if (pg.used) return;
          pg.balance += pg.monthly;
          pg.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: "Versement mensuel programmé", amount: pg.monthly, kind: "versement" });
        });
      }
      if (d.pass.credit > ACCOUNT_CAP) {
        notify(d, `Ton crédit dépasse ${ACCOUNT_CAP} TND (plafond du compte niveau 1) : passe au niveau 2 ou réserve un voyage.`);
      }
      notify(d, `${n} mois simulés : ton crédit voyage est de ${d.pass.credit} TND.`);
    });
  },
  bookTrip(tripId: string, usePoints: boolean) {
    let result: { creditUsed: number; complement: number; pointsUsed: number } | null = null;
    mutate((d) => {
      const trip = d.trips.find((t) => t.id === tripId);
      if (!trip || trip.status !== "publie" || trip.booked >= trip.quota) return;
      const pointsValue = usePoints ? Math.min(Math.floor(d.points.balance / 10), Math.floor(trip.price * 0.1)) : 0; // 10 points = 1 TND, max 10 %
      const remaining = trip.price - pointsValue;
      const creditUsed = Math.min(d.pass.credit, remaining);
      const complement = remaining - creditUsed;
      d.pass.credit -= creditUsed;
      if (creditUsed > 0) {
        d.pass.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: `Réservation : ${trip.destination}`, amount: -creditUsed, kind: "reservation" });
      }
      if (pointsValue > 0) addPoints(d, -pointsValue * 10, `Réduction voyage ${trip.destination}`);
      addPoints(d, 30, `Voyage officiel réservé (${trip.destination})`);
      trip.booked += 1;
      d.bookings.unshift({
        id: uid("b"), tripId, traveler: d.persona.name, city: d.persona.city, creditUsed, pointsUsed: pointsValue * 10,
        complement, date: monthLabel(d.month), status: "confirmee", rank: trip.booked,
      });
      notify(d, `Réservation confirmée : ${trip.destination} (${trip.dates}). Chef de groupe et groupe de discussion communiqués 10 jours avant le départ.`);
      result = { creditUsed, complement, pointsUsed: pointsValue * 10 };
    });
    return result as { creditUsed: number; complement: number; pointsUsed: number } | null;
  },
  setEliminated(on: boolean) {
    mutate((d) => {
      d.eliminated = on;
      const caire = d.trips.find((t) => t.id === "t-caire");
      if (!caire) return;
      if (on) {
        caire.status = "annule";
        let reported = 0;
        d.bookings.forEach((b) => {
          if (b.tripId === "t-caire" && b.status === "confirmee") {
            b.status = "reportee";
            if (b.traveler === d.persona.name) reported += b.creditUsed;
          }
        });
        if (reported > 0) {
          d.pass.credit += reported;
          d.pass.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: "Report : voyage au Caire annulé (EST éliminée)", amount: reported, kind: "report" });
        }
        notify(d, `L'EST est éliminée : le voyage au Caire est annulé. ${reported > 0 ? `${reported} TND recrédités. ` : ""}Ton crédit reste disponible pour la CAN 2027, la Coupe du monde 2030 ou le Taraji Store.`);
      } else {
        caire.status = "publie";
        notify(d, "Scénario réinitialisé : l'EST est qualifiée, le voyage au Caire est rouvert.");
      }
    });
  },

  /* --- Billets --- */
  buyVirtual(matchId: string, pseudo: string, formula: VirtualTicket["formula"], price: number) {
    let status = "en_attente" as VirtualTicket["status"];
    mutate((d) => {
      const flagged = isFlagged(pseudo);
      status = flagged ? "rejete" : d.manualModeration ? "en_attente" : "valide";
      d.tickets.unshift({
        id: uid("vt"), matchId, pseudo, city: d.persona.city, country: d.persona.country, formula, price, status, mine: true, autoFlag: flagged,
      });
      addPoints(d, 5, "Place virtuelle achetée");
      notify(d, flagged
        ? `Ton pseudo « ${pseudo} » a été refusé par le filtre automatique. Choisis un autre pseudo.`
        : status === "valide"
          ? `Place virtuelle confirmée. « ${pseudo} » apparaît sur le mur des supporters.`
          : `Place virtuelle confirmée. « ${pseudo} » sera affiché après validation par le modérateur.`);
    });
    return status;
  },
  giveSolidarity(kind: "place" | "abonnement" | "duo", message: string) {
    mutate((d) => {
      d.solidarityCount += 1;
      d.solidarityMine += 1;
      addPoints(d, kind === "abonnement" ? 60 : 20, kind === "duo" ? "Pack Duo (place solidaire offerte)" : "Billet solidaire offert");
      notify(d, `Merci ! Ta ${kind === "abonnement" ? "saison solidaire" : "place solidaire"} sera attribuée par une association partenaire.${message ? ` Ton message : « ${message} »` : ""}`);
    });
  },
  moderate(ticketId: string, ok: boolean) {
    mutate((d) => {
      const t = d.tickets.find((x) => x.id === ticketId);
      if (!t) return;
      t.status = ok ? "valide" : "rejete";
      d.adminLog.unshift(`${monthLabel(d.month)} — Pseudo « ${t.pseudo} » ${ok ? "validé" : "refusé"}`);
      if (t.mine) notify(d, ok ? `Ton pseudo « ${t.pseudo} » est validé et affiché sur le mur.` : `Ton pseudo « ${t.pseudo} » a été refusé par le modérateur.`);
    });
  },
  setManualModeration(on: boolean) {
    mutate((d) => { d.manualModeration = on; });
  },

  /* --- Tirelires --- */
  createPiggy(type: PiggyType, target: number, deadline: string, monthly: number) {
    mutate((d) => {
      const label = type === "rentree" ? "Rentrée" : type === "aid" ? "Aïd" : "Voyage";
      d.piggies.push({ id: uid("pg"), type, label, target, deadline, monthly, balance: 0, movements: [], used: false });
      notify(d, `Tirelire ${label} ouverte : objectif ${target} TND, ${monthly} TND par mois.`);
    });
  },
  depositPiggy(id: string, amount: number) {
    mutate((d) => {
      const pg = d.piggies.find((p) => p.id === id);
      if (!pg) return;
      pg.balance += amount;
      pg.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: "Versement", amount, kind: "versement" });
    });
  },
  simulatePiggyMonths(n: number) {
    mutate((d) => {
      for (let i = 0; i < n; i++) {
        d.month += 1;
        d.piggies.forEach((pg) => {
          if (pg.used) return;
          pg.balance += pg.monthly;
          pg.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: "Versement mensuel programmé", amount: pg.monthly, kind: "versement" });
        });
        if (d.pass.plan) {
          const p = PASS_PLANS[d.pass.plan];
          d.pass.credit += p.credit;
          d.pass.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: `Versement mensuel ${p.label}`, amount: p.credit, kind: "versement" });
        }
      }
      notify(d, `${n} mois simulés sur les tirelires.`);
    });
  },
  addChild(name: string, age: number) {
    mutate((d) => { d.children.push({ id: uid("c"), name, age }); });
  },
  removeChild(id: string) {
    mutate((d) => { d.children = d.children.filter((c) => c.id !== id); });
  },
  inviteContributor(name: string, city: string, country: string, piggyId: string, amount: number) {
    mutate((d) => {
      const pg = d.piggies.find((p) => p.id === piggyId);
      if (!pg) return;
      d.contributors.push({ id: uid("ct"), name, city, country, piggyId, total: amount });
      pg.balance += amount;
      pg.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: `Contribution de ${name} (${city}), versée en devise`, amount, kind: "contribution" });
      notify(d, `${name} (${city}) a versé ${amount} TND dans la tirelire ${pg.label}.`);
    });
  },
  usePiggy(id: string, offer: string, price: number, childName?: string) {
    mutate((d) => {
      const pg = d.piggies.find((p) => p.id === id);
      if (!pg) return;
      const paid = Math.min(pg.balance, price);
      pg.balance -= paid;
      pg.used = true;
      pg.movements.unshift({ id: uid("m"), date: monthLabel(d.month), label: `Utilisation : ${offer}`, amount: -paid, kind: "utilisation" });
      notify(d, `Offre groupée « ${offer} » réglée avec la tirelire ${pg.label}${price > paid ? ` (complément de ${price - paid} TND)` : ""}.`);
      d.contributors.filter((c) => c.piggyId === id).forEach((c) => {
        const what = pg.type === "rentree" ? `le cartable${childName ? ` de ${childName}` : ""}` : pg.type === "aid" ? "le mouton de l'Aïd" : "le voyage de la famille";
        notify(d, `📩 Notification envoyée à ${c.name} (${c.city}) : « Ton cadeau a payé ${what}. Merci ! »`);
      });
    });
  },

  /* --- Back-office --- */
  createTrip(t: Omit<Trip, "id" | "booked" | "status">) {
    mutate((d) => {
      d.trips.unshift({ ...t, id: uid("t"), booked: 0, status: "publie" });
      d.adminLog.unshift(`${monthLabel(d.month)} — Voyage créé : ${t.destination} (${t.price} TND, ${t.quota} places)`);
      notify(d, `✈️ Nouveau voyage officiel publié : ${t.event} — ${t.destination}, ${t.dates}. Réserve avec ton crédit !`);
    });
  },
  allocate(tripId: string) {
    mutate((d) => {
      const list = d.bookings.filter((b) => b.tripId === tripId && b.status === "confirmee");
      list.forEach((b, i) => (b.rank = i + 1));
      const trip = d.trips.find((t) => t.id === tripId);
      d.adminLog.unshift(`${monthLabel(d.month)} — Attribution lancée pour ${trip?.destination} (${list.length} réservations nominatives)`);
    });
  },
};
