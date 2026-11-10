"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Logo } from "./Logo";

/* ------------------------------------------------------------------ */
/* Détection de l'appareil et de l'installation possible               */
/* ------------------------------------------------------------------ */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// « beforeinstallprompt » (Chrome, Edge, Android) : capté une seule fois, au chargement
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

export interface Device {
  ready: boolean;
  standalone: boolean; // déjà ouverte comme app installée
  ios: boolean;
  android: boolean;
  inApp: boolean; // navigateur intégré (WhatsApp, Facebook, Instagram, Gmail…) : installation impossible
  iosBrowser: "safari" | "chrome" | "autre";
  desktop: boolean;
}

const SERVER_DEVICE: Device = { ready: false, standalone: false, ios: false, android: false, inApp: false, iosBrowser: "safari", desktop: false };
let clientDevice: Device | null = null;

function readDevice(): Device {
  if (!clientDevice) {
    const ua = navigator.userAgent;
    const nav = navigator as Navigator & { standalone?: boolean };
    const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /android/i.test(ua);
    const inApp = /FBAN|FBAV|Instagram|Line\/|LinkedInApp|Snapchat|Twitter|GSA\/|WhatsApp|Messenger|MicroMessenger|; wv\)/i.test(ua);
    clientDevice = {
      ready: true,
      standalone: window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true,
      ios,
      android,
      inApp,
      iosBrowser: /CriOS|EdgiOS/i.test(ua) ? "chrome" : /FxiOS|OPiOS/i.test(ua) ? "autre" : "safari",
      desktop: !ios && !android,
    };
  }
  return clientDevice;
}

export function useDevice() {
  const device = useSyncExternalStore(
    () => () => {},
    () => readDevice(),
    () => SERVER_DEVICE,
  );
  const canPrompt = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => deferred !== null,
    () => false,
  );
  return { ...device, canPrompt };
}

/** Ouvre la fenêtre d'installation native (Chrome, Edge, Android). Renvoie false si indisponible. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  emit();
  return true;
}

/* ------------------------------------------------------------------ */
/* Bouton et bandeau                                                   */
/* ------------------------------------------------------------------ */

/** Bouton « Installer l'app » : installation native si possible, sinon page d'aide. Masqué si déjà installée. */
export function InstallApp({ variant = "light" }: { variant?: "light" | "dark" }) {
  const d = useDevice();
  if (!d.ready || d.standalone) return null;
  const style = variant === "dark" ? "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur" : "bg-white text-sombre shadow-sm";
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sombre">
        <Logo size={30} />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">Installer l'app Taraji</span>
        <span className={`block text-xs ${variant === "dark" ? "text-white/60" : "text-sombre/50"}`}>Sur ton écran d'accueil, comme une vraie app</span>
      </span>
      <span className="text-xl">📲</span>
    </>
  );
  const cls = `flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-start transition active:scale-[0.98] ${style}`;
  return d.canPrompt ? (
    <button onClick={() => promptInstall()} className={cls}>
      {content}
    </button>
  ) : (
    <Link href="/installer" className={cls}>
      {content}
    </Link>
  );
}

/** Bandeau en haut de l'écran de connexion. */
export function InstallBanner() {
  const d = useDevice();
  if (!d.ready || d.standalone) return null;
  const label = "📲 Installer l'app sur mon téléphone";
  const cls = "flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl bg-or px-4 text-sm font-bold text-sombre shadow-[0_8px_24px_-10px_rgba(242,183,5,0.9)]";
  return d.canPrompt ? (
    <button onClick={() => promptInstall()} className={cls}>
      {label} <span>›</span>
    </button>
  ) : (
    <Link href="/installer" className={cls}>
      {label} <span className="rtl:rotate-180">›</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Choix « continuer dans le navigateur » (mémorisé, hors données démo) */
/* ------------------------------------------------------------------ */

const BROWSER_KEY = "taraji-choix-navigateur";

export function hasChosenBrowser(): boolean {
  try {
    return localStorage.getItem(BROWSER_KEY) === "1";
  } catch {
    return false;
  }
}

export function chooseBrowser() {
  try {
    localStorage.setItem(BROWSER_KEY, "1");
  } catch {
    /* stockage indisponible : on redemandera la prochaine fois */
  }
}
