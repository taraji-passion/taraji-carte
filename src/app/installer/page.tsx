"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button, Segmented, toast } from "@/components/ui";
import { Logo } from "@/components/Logo";
import {
  chooseBrowser,
  promptInstall,
  useDevice,
} from "@/components/InstallApp";
import { BASE_PATH } from "@/lib/format";

const ShareIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 3v12m0-12-4 4m4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
);
const AddIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
  >
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sang text-sm font-black text-white">
          {n}
        </span>
        <span className="text-[15px] leading-snug">{title}</span>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </li>
  );
}

/** Adresse de l'app (calculée côté navigateur). */
function useAppUrl() {
  return useSyncExternalStore(
    () => () => {},
    () => `${window.location.origin}${BASE_PATH}/`,
    () => "",
  );
}

export default function InstallerPage() {
  const d = useDevice();
  const url = useAppUrl();
  const router = useRouter();
  const [manual, setManual] = useState<"iphone" | "android" | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const platform = manual ?? (d.android ? "android" : "iphone");

  async function install() {
    // Android, Chrome, Edge : fenêtre d'installation native ; sinon (iPhone…) on montre les gestes
    if (!(await promptInstall())) setShowSteps(true);
  }

  function continueInBrowser() {
    chooseBrowser();
    router.push("/login");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Lien copié : colle-le dans Safari");
    } catch {
      toast(url);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-16 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-24 w-24 place-items-center rounded-[26px] bg-sombre shadow-xl">
          <Logo size={72} />
        </span>
        <h1 className="mt-4 text-[26px] font-extrabold leading-tight">
          Installe l'app Taraji
        </h1>
        <p className="mt-1 text-sombre/60">
          30 secondes, gratuit, sans App Store
        </p>
      </div>

      {d.standalone ? (
        <div className="mt-8 rounded-3xl bg-emerald-50 p-5 text-center">
          <div className="text-4xl">✅</div>
          <p className="mt-2 font-bold">
            L'app est déjà installée sur ce téléphone.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-sang px-6 font-semibold text-white"
          >
            Ouvrir l'app
          </Link>
        </div>
      ) : (
        <>
          {/* Navigateur intégré (WhatsApp, Gmail…) : il faut rouvrir dans le vrai navigateur */}
          {d.inApp && (
            <div className="mt-6 rounded-3xl bg-or/25 p-4 ring-2 ring-or">
              <p className="font-bold">
                ⚠️ Tu as ouvert le lien depuis une autre app
              </p>
              <p className="mt-1 text-sm text-sombre/70">
                L'installation n'est possible que dans{" "}
                {d.ios ? "Safari" : "Chrome"}. Touche <strong>⋯</strong> puis{" "}
                <strong>
                  « Ouvrir dans {d.ios ? "Safari" : "le navigateur"} »
                </strong>
                , ou copie le lien :
              </p>
              <Button variant="dark" className="mt-3 w-full" onClick={copyLink}>
                Copier le lien
              </Button>
            </div>
          )}

          {/* Les deux choix */}
          {!showSteps && (
            <div className="mt-8 space-y-3">
              <Button className="min-h-14 w-full text-base" onClick={install}>
                📲 Installer l'app
              </Button>
              <Button
                variant="soft"
                className="min-h-14 w-full text-base"
                onClick={continueInBrowser}
              >
                Continuer dans le navigateur
              </Button>
              <p className="pt-1 text-center text-xs text-sombre/45">
                L'app installée s'ouvre en plein écran, comme une app de l'App
                Store.
              </p>
            </div>
          )}

          {d.desktop && !showSteps ? (
            <div className="mt-6 rounded-3xl bg-white p-5 text-center shadow-sm">
              <p className="font-bold">Scanne ce code avec ton téléphone</p>
              <p className="text-sm text-sombre/60">
                avec l'appareil photo, puis suis les étapes
              </p>
              {url && (
                <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3 ring-1 ring-black/10">
                  <QRCodeSVG
                    value={url}
                    size={180}
                    fgColor="#1C1414"
                    level="M"
                  />
                </div>
              )}
              <p className="mt-3 break-all text-xs text-sombre/50">{url}</p>
            </div>
          ) : null}

          {showSteps && (
            <>
              <div className="mt-6">
                <Segmented
                  value={platform}
                  onChange={setManual}
                  items={[
                    { id: "iphone", label: "iPhone" },
                    { id: "android", label: "Android" },
                  ]}
                />
              </div>

              {platform === "iphone" ? (
                <ol className="mt-4 space-y-3">
                  <Step
                    n={1}
                    title={
                      <>
                        Ouvre ce lien dans <strong>Safari</strong>
                        {d.ios && d.iosBrowser === "chrome"
                          ? " (ou continue dans Chrome : son bouton Partager est en haut à droite)"
                          : ""}
                      </>
                    }
                  />
                  <Step
                    n={2}
                    title={
                      <>
                        Touche le bouton <strong>Partager</strong>, en bas de l'écran. Tu ne le vois pas ? Touche d'abord <strong>⋯</strong> (iOS 26)
                  </>
                    }
                  >
                    <div className="flex items-center justify-around rounded-2xl bg-[#f2f2f7] py-3 text-[#007aff]">
                      <span className="opacity-40">‹</span>
                      <span className="opacity-40">›</span>
                      <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#007aff]/15 ring-2 ring-[#007aff]">
                        <ShareIcon />
                      </span>
                      <span className="opacity-40">□</span>
                      <span className="opacity-40">⧉</span>
                    </div>
                  </Step>
                  <Step
                    n={3}
                    title={
                      <>
                        Fais défiler et choisis{" "}
                        <strong>« Sur l'écran d'accueil »</strong>
                      </>
                    }
                  >
                    <div className="flex items-center justify-between rounded-2xl bg-[#f2f2f7] px-4 py-3 ring-2 ring-[#007aff]">
                      <span className="text-[15px]">Sur l'écran d'accueil</span>
                      <AddIcon />
                    </div>
                  </Step>
                  <Step
                    n={4}
                    title={
                      <>
                        Touche <strong>Ajouter</strong>, en haut à droite
                      </>
                    }
                  >
                    <div className="flex items-center gap-3 rounded-2xl bg-[#f2f2f7] px-4 py-3">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-sombre">
                        <Logo size={36} />
                      </span>
                      <span className="flex-1 text-[15px] font-medium">
                        Taraji
                      </span>
                      <span className="font-semibold text-[#007aff]">
                        Ajouter
                      </span>
                    </div>
                  </Step>
                </ol>
              ) : (
                <ol className="mt-4 space-y-3">
                  <Step
                    n={1}
                    title={
                      <>
                        Ouvre ce lien dans <strong>Chrome</strong>
                      </>
                    }
                  />
                  <Step
                    n={2}
                    title={
                      <>
                        Touche le menu <strong>⋮</strong>, en haut à droite
                      </>
                    }
                  />
                  <Step
                    n={3}
                    title={
                      <>
                        Choisis <strong>« Installer l'application »</strong> (ou
                        « Ajouter à l'écran d'accueil »)
                      </>
                    }
                  />
                  <Step
                    n={4}
                    title={
                      <>
                        Confirme avec <strong>Installer</strong>
                      </>
                    }
                  />
                </ol>
              )}

              <div className="mt-6 rounded-3xl bg-sombre p-5 text-white">
                <p className="font-bold">Et ensuite ?</p>
                <p className="mt-1 text-sm text-white/70">
                  L'icône Taraji apparaît sur ton écran d'accueil. L'app s'ouvre
                  en plein écran, sans barre de navigateur, et ta carte reste
                  consultable hors ligne.
                </p>
              </div>

              <button
                onClick={continueInBrowser}
                className="mt-6 block w-full text-center text-sm font-semibold text-sang"
              >
                Continuer dans le navigateur ›
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
