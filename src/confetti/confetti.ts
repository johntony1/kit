// confetti.ts
// Confetti pop: the element pops in with a blur and an overshoot, 20 hand-placed pieces of
// confetti burst out, and a soft glow springs in behind it and stays.
// Taken from the "Transaction completed" screen of a currency exchange. Plain DOM and the
// Web Animations API, no dependencies.
//
//   confettiPop(badge);
//   confettiPop(badge, { colors: ["#38bdf8", "#22d3ee", "#818cf8", "#e0f2fe"], originY: 34 });
//
// Free to use in anything.

export interface ConfettiOptions {
  /** four colours, used where the original had green, orange, gold and lavender */
  colors?: string[];
  /** how many pieces. 20 is the original burst; more repeats it with a twist */
  count?: number;
  /** how far they fly. 1 = the original distances */
  spread?: number;
  /** seconds a piece flies. 0.82 */
  duration?: number;
  /** pop the element itself. true */
  pop?: boolean;
  /** the glow's colour, or false for none. Mint green */
  glow?: string | false;
  /** where the burst starts, in px below the element's centre. 0 (the original screen used 34) */
  originY?: number;
}

export const CONFETTI_DEFAULTS: Required<ConfettiOptions> = {
  colors: ["#1fc16b", "#fa7319", "#f5c028", "#b197fc"],
  count: 20,
  spread: 1,
  duration: 0.82,
  pop: true,
  glow: "#4ade80",
  originY: 0,
};

// x, y: where it lands (px). r: spin (deg). c: colour slot. w, h: size. d: delay (s)
const PIECES = [
  // up and left
  { x: -110, y: -100, r: 45, c: 0, w: 8, h: 8, d: 0 },
  { x: -70, y: -120, r: -30, c: 1, w: 5, h: 9, d: 0.02 },
  { x: -40, y: -95, r: 135, c: 2, w: 7, h: 5, d: 0.05 },
  { x: -130, y: -60, r: 80, c: 3, w: 6, h: 6, d: 0.04 },
  { x: -155, y: -30, r: -70, c: 2, w: 5, h: 8, d: 0.055 },
  // up and right
  { x: 85, y: -110, r: -48, c: 0, w: 6, h: 10, d: 0.01 },
  { x: 125, y: -75, r: 60, c: 1, w: 8, h: 6, d: 0.03 },
  { x: 50, y: -125, r: -90, c: 3, w: 6, h: 6, d: 0.04 },
  { x: 160, y: -45, r: 95, c: 2, w: 5, h: 9, d: 0.025 },
  { x: 145, y: -10, r: -55, c: 0, w: 7, h: 5, d: 0.05 },
  // straight up
  { x: -20, y: -140, r: 200, c: 1, w: 7, h: 7, d: 0.015 },
  { x: 18, y: -150, r: -160, c: 2, w: 5, h: 8, d: 0.035 },
  { x: -60, y: -100, r: 90, c: 3, w: 9, h: 5, d: 0.025 },
  { x: 60, y: -105, r: -20, c: 0, w: 6, h: 7, d: 0.045 },
  // falling to the sides
  { x: -100, y: 50, r: -120, c: 1, w: 6, h: 6, d: 0.01 },
  { x: 95, y: 65, r: 170, c: 0, w: 8, h: 4, d: 0.038 },
  { x: -50, y: 80, r: -100, c: 3, w: 5, h: 8, d: 0.028 },
  { x: 45, y: 90, r: 250, c: 2, w: 7, h: 7, d: 0.018 },
  { x: -115, y: 20, r: -85, c: 0, w: 6, h: 5, d: 0.048 },
  { x: 130, y: 40, r: 140, c: 1, w: 5, h: 7, d: 0.032 },
];

/** the original 20, then more of them turned and scaled a little, if you ask for more */
function pieces(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const p = PIECES[i % 20];
    const lap = Math.floor(i / 20);
    if (!lap) return p;
    const a = lap * 0.42, k = 1 + lap * 0.12;
    const c = Math.cos(a), s = Math.sin(a);
    return { ...p, x: (p.x * c - p.y * s) * k, y: (p.x * s + p.y * c) * k, r: -p.r, d: p.d + lap * 0.02 };
  });
}

// Framer Motion's easeOut, applied to each step of the pop like its `times` keyframes
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";
// a spring (visual duration 0.55 s, bounce 0.2) as a linear() curve, for the glow
const SPRING = "linear(0, 0.13 6%, 0.47 15%, 0.79 25%, 0.98 35%, 1.06 45%, 1.07 52%, 1.04 64%, 1.01 76%, 1)";

export function confettiPop(el: HTMLElement, options: ConfettiOptions = {}) {
  const o = { ...CONFETTI_DEFAULTS, ...options };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. the pop: scale 0 → 1.25 → 0.92 → 1.06 → 1, blur 8 → 3 → 0, after 80 ms, 720 ms long
  if (o.pop) {
    el.animate(
      still
        ? [{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }]
        : [
            { transform: "scale(0)", opacity: 0, filter: "blur(8px)", offset: 0, easing: EASE_OUT },
            { transform: "scale(1.25)", opacity: 1, filter: "blur(3px)", offset: 0.34, easing: EASE_OUT },
            { transform: "scale(0.92)", opacity: 1, filter: "blur(0px)", offset: 0.56, easing: EASE_OUT },
            { transform: "scale(1.06)", opacity: 1, filter: "blur(0px)", offset: 0.76, easing: EASE_OUT },
            { transform: "scale(1)", opacity: 1, filter: "blur(0px)", offset: 1 },
          ],
      { duration: still ? 150 : 720, delay: still ? 0 : 80, fill: "both" },
    );
  }

  const box = el.getBoundingClientRect();
  const cx = box.left + box.width / 2, cy = box.top + box.height / 2;

  // 2. the glow: a soft ellipse that springs in from the top and stays, until the next pop
  const parent = el.parentElement;
  if (o.glow && parent) {
    parent.querySelectorAll(":scope > [data-confetti-glow]").forEach((g) => g.remove());
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    if (!el.style.zIndex) el.style.zIndex = "1";
    const p = parent.getBoundingClientRect();
    const g = document.createElement("div");
    g.setAttribute("aria-hidden", "true");
    g.dataset.confettiGlow = "";
    const c = o.glow;
    const mint = c === CONFETTI_DEFAULTS.glow;
    Object.assign(g.style, {
      position: "absolute", zIndex: "0", pointerEvents: "none", width: "340px", height: "280px",
      left: `${cx - p.left - 170}px`, top: `${cy - p.top - 96}px`, transformOrigin: "center top",
      background: mint
        ? "radial-gradient(ellipse 60% 60% at 50% 10%, rgba(187,247,208,0.95) 0%, rgba(134,239,172,0.55) 40%, rgba(74,222,128,0.15) 65%, transparent 85%)"
        : `radial-gradient(ellipse 60% 60% at 50% 10%, color-mix(in srgb, ${c} 30%, white) 0%, color-mix(in srgb, ${c} 55%, transparent) 40%, color-mix(in srgb, ${c} 15%, transparent) 65%, transparent 85%)`,
    });
    parent.insertBefore(g, parent.firstChild);
    g.animate(
      [{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
      still ? { duration: 150, fill: "both" } : { duration: 700, easing: SPRING, fill: "both" },
    );
  }
  if (still) return;

  // 3. the burst: from just below the centre, on a layer above the page so nothing clips it
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, { position: "fixed", left: `${cx}px`, top: `${cy + o.originY}px`, width: "0", height: "0", pointerEvents: "none", zIndex: "9999" });
  for (const q of pieces(o.count)) {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "absolute", width: `${q.w}px`, height: `${q.h}px`, marginLeft: `${-q.w / 2}px`, marginTop: `${-q.h / 2}px`,
      borderRadius: q.w === q.h && q.w <= 6 ? "50%" : "2px", backgroundColor: o.colors[q.c % o.colors.length],
    });
    layer.appendChild(d);
    d.animate(
      [
        { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${q.x * o.spread}px, ${q.y * o.spread}px) scale(0.35) rotate(${q.r}deg)`, opacity: 0 },
      ],
      { duration: o.duration * 1000, delay: q.d * 1000, easing: "cubic-bezier(0.1, 0.6, 0.3, 1)", fill: "both" },
    );
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), (o.duration + 0.2) * 1000);
}
