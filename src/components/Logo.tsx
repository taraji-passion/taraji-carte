import { BASE_PATH } from "@/lib/format";

/** Logo officiel de l'Espérance Sportive de Tunis. */
export function Logo({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${BASE_PATH}/est-logo.png`} alt="Espérance Sportive de Tunis" width={Math.round(size * 0.82)} height={size} className={`shrink-0 object-contain ${className}`} style={{ height: size, width: "auto" }} />
  );
}
