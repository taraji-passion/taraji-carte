"use client";

import { useEffect, useRef, useState } from "react";

/** Nombre qui défile jusqu'à sa valeur (au montage et à chaque changement). */
export function CountUp({ value, format = (n: number) => Math.round(n).toLocaleString("fr-FR"), duration = 900 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(a + (value - a) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{format(shown)}</>;
}

/** Pluie de confettis sang et or. */
export function confetti(count = 90) {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#B5121B", "#F2B705", "#FBF6EC", "#F2B705", "#B5121B"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "confetti";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = colors[i % colors.length];
    el.style.setProperty("--dx", `${(Math.random() - 0.5) * 200}px`);
    el.style.setProperty("--rot", `${Math.random() * 900 - 450}deg`);
    el.style.setProperty("--dur", `${1.6 + Math.random() * 1.6}s`);
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
