"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, Sheet } from "./ui";
import { Logo } from "./Logo";

/* L'événement « beforeinstallprompt » (Chrome, Edge, Android) est capté une seule fois, au chargement. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

// Environnement du navigateur, calculé une fois (instantané stable pour useSyncExternalStore)
const SERVER_ENV = { standalone: false, ios: false, ready: false };
let clientEnv: typeof SERVER_ENV | null = null;
function readEnv() {
  if (!clientEnv) {
    const nav = navigator as Navigator & { standalone?: boolean };
    clientEnv = {
      standalone: window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true,
      ios: /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      ready: true,
    };
  }
  return clientEnv;
}

function useInstallState() {
  const canPrompt = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => deferred !== null,
    () => false,
  );
  const env = useSyncExternalStore(
    () => () => {},
    () => readEnv(),
    () => SERVER_ENV,
  );
  return { canPrompt, ...env };
}

/** Bouton « Installer l'app » : installation native si possible, sinon mode d'emploi. Masqué si déjà installée. */
export function InstallApp({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { canPrompt, standalone, ios, ready } = useInstallState();
  const [help, setHelp] = useState(false);
  if (!ready || standalone) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      listeners.forEach((l) => l());
    } else {
      setHelp(true);
    }
  }

  const style =
    variant === "dark"
      ? "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur"
      : "bg-white text-sombre shadow-sm";

  return (
    <>
      <button onClick={install} className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-start transition active:scale-[0.98] ${style}`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sombre">
          <Logo size={30} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Installer l'app Taraji</span>
          <span className={`block text-xs ${variant === "dark" ? "text-white/60" : "text-sombre/50"}`}>
            {canPrompt ? "Sur ton écran d'accueil, en un clic" : "Sur ton écran d'accueil, comme une vraie app"}
          </span>
        </span>
        <span className="text-xl">📲</span>
      </button>

      <Sheet open={help} onClose={() => setHelp(false)} title="Installer l'app">
        {ios ? (
          <ol className="space-y-4">
            <li className="flex items-center gap-3 rounded-2xl bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sang font-bold text-white">1</span>
              <span>
                Dans <strong>Safari</strong>, touche le bouton <strong>Partager</strong>{" "}
                <svg viewBox="0 0 24 24" className="inline h-5 w-5 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3v12m0-12-4 4m4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
                </svg>{" "}
                en bas de l'écran.
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sang font-bold text-white">2</span>
              <span>
                Choisis <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.
              </span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-4">
            <li className="flex items-center gap-3 rounded-2xl bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sang font-bold text-white">1</span>
              <span>
                Ouvre le menu du navigateur <strong>⋮</strong> (Chrome, Edge, Samsung Internet).
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sang font-bold text-white">2</span>
              <span>
                Choisis <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
              </span>
            </li>
          </ol>
        )}
        <p className="mt-4 text-center text-xs text-sombre/50">L'app s'ouvre ensuite en plein écran, sans barre de navigateur, et ta carte reste consultable hors ligne.</p>
        <Button className="mt-4 w-full" onClick={() => setHelp(false)}>
          Compris
        </Button>
      </Sheet>
    </>
  );
}
