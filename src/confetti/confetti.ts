// confetti.ts
// Confetti pop: the element pops in with a blur and a little overshoot, confetti
// bursts out of it, and a soft glow blooms behind. Plain DOM + Web Animations, no deps.
//
//   confettiPop(badge);                                   // the defaults
//   confettiPop(badge, { colors: ["#1fc16b", "#f5c028"], count: 30 });
//
// Free to use in anything.

export interface ConfettiOptions {
  /** confetti colours. Green, orange, gold, lavender */
  colors?: string[];
  /** number of pieces. 20 */
  count?: number;
  /** how far they fly, 1 = about 150 px. 1 */
  spread?: number;
  /** seconds a piece flies. 0.82 */
  duration?: number;
  /** pop the element itself (scale 0 → 1.25 → 0.92 → 1.06 → 1 with a blur). true */
  pop?: boolean;
  /** colour of the glow behind it, or false for none. "#4ade80" */
  glow?: string | false;
  /** the glow's size in px. 280 */
  glowSize?: number;
}

export const CONFETTI_DEFAULTS: Required<ConfettiOptions> = {
  colors: ["#1fc16b", "#fa7319", "#f5c028", "#b197fc"],
  count: 20,
  spread: 1,
  duration: 0.82,
  pop: true,
  glow: "#4ade80",
  glowSize: 280,
};

/** the same pieces every time for the same count: a burst that is designed, not random */
function pieces(count: number) {
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: count }, (_, i) => {
    // three in four go up and out, the rest fall to the sides
    const up = i % 4 !== 3;
    const angle = up ? -Math.PI * (0.08 + rand() * 0.84) : Math.PI * (0.12 + rand() * 0.76);
    const dist = up ? 95 + rand() * 65 : 45 + rand() * 50;
    const w = 5 + Math.round(rand() * 4);
    const h = 5 + Math.round(rand() * 5);
    return {
      x: Math.cos(angle) * dist * (up ? 1.05 : 1.3),
      y: Math.sin(angle) * dist,
      r: (rand() - 0.5) * 500,
      w, h,
      round: w === h && w <= 6,
      delay: rand() * 0.055,
    };
  });
}

export function confettiPop(el: HTMLElement, options: ConfettiOptions = {}) {
  const o = { ...CONFETTI_DEFAULTS, ...options };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (o.pop) {
    el.animate(
      still
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { transform: "scale(0)", opacity: 0, filter: "blur(8px)", offset: 0 },
            { transform: "scale(1.25)", opacity: 1, filter: "blur(3px)", offset: 0.34 },
            { transform: "scale(0.92)", filter: "blur(0px)", offset: 0.56 },
            { transform: "scale(1.06)", offset: 0.76 },
            { transform: "scale(1)", opacity: 1, filter: "blur(0px)", offset: 1 },
          ],
      { duration: still ? 150 : 720, delay: still ? 0 : 80, easing: "ease-out", fill: "backwards" },
    );
  }
  if (still) return;

  const box = el.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed", left: `${box.left + box.width / 2}px`, top: `${box.top + box.height / 2}px`,
    width: "0", height: "0", pointerEvents: "none", zIndex: "9999",
  });

  // the glow sits just behind the element, inside its parent (give the parent position: relative)
  const parent = el.parentElement;
  if (o.glow && parent) {
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    if (!el.style.zIndex) el.style.zIndex = "1";
    const s = o.glowSize;
    const p = parent.getBoundingClientRect();
    const glow = document.createElement("div");
    glow.setAttribute("aria-hidden", "true");
    Object.assign(glow.style, {
      position: "absolute", zIndex: "0", pointerEvents: "none", borderRadius: "50%",
      width: `${s}px`, height: `${s}px`,
      left: `${box.left - p.left + box.width / 2 - s / 2}px`,
      top: `${box.top - p.top + box.height / 2 - s / 2}px`,
      background: `radial-gradient(closest-side, ${o.glow}, color-mix(in srgb, ${o.glow} 40%, transparent) 45%, transparent)`,
    });
    parent.insertBefore(glow, el);
    glow.animate(
      [
        { transform: "scale(0.5)", opacity: 0 },
        { transform: "scale(1.05)", opacity: 0.55, offset: 0.3 },
        { transform: "scale(1)", opacity: 0.45, offset: 0.6 },
        { transform: "scale(1)", opacity: 0 },
      ],
      { duration: 1800, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    ).onfinish = () => glow.remove();
  }

  const ps = pieces(o.count);
  ps.forEach((p, i) => {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "absolute", width: `${p.w}px`, height: `${p.h}px`, marginLeft: `${-p.w / 2}px`, marginTop: `${-p.h / 2}px`,
      borderRadius: p.round ? "50%" : "2px", background: o.colors[i % o.colors.length],
    });
    layer.appendChild(d);
    d.animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: `translate(${p.x * o.spread}px, ${p.y * o.spread}px) rotate(${p.r}deg) scale(0.35)`, opacity: 0 },
      ],
      { duration: o.duration * 1000, delay: 200 + p.delay * 1000, easing: "cubic-bezier(0.1, 0.6, 0.3, 1)", fill: "both" },
    );
  });
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 200 + (o.duration + 0.1) * 1000);
}
