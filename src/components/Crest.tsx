import { Logo } from "./Logo";

/** Écusson simplifié : bandes sang et or pour l'EST, initiales pour l'adversaire. */
export function Crest({ name, size = 52 }: { name: string; size?: number }) {
  if (name === "EST") return <Logo size={size * 1.15} className="drop-shadow" />;
  const colors: Record<string, string> = {
    "Al Ahly": "#c8102e",
    "Mamelodi Sundowns": "#ffd200",
    "Paris Saint-Germain": "#004170",
    "CS Sfaxien": "#111111",
  };
  const initials = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const bg = colors[name] ?? "#555";
  const light = bg === "#ffd200";
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full ring-2 ring-white/30"
      style={{ width: size, height: size, background: bg, color: light ? "#14532d" : "#fff", fontSize: size * 0.28, fontWeight: 900 }}
    >
      {initials}
    </span>
  );
}
