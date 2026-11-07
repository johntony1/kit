// confetti.ts
// Confetti pop: the element pops in with a blur and an overshoot, a soft glow springs in
// behind it, and 72 ribbons and dots burst out of it, tumble, fall with gravity and air
// drag, and fade. Taken from the "Transaction completed" screen of a currency exchange.
// Plain DOM, canvas and the Web Animations API, no dependencies.
//
//   confettiPop(badge, { within: card });   // confetti stays inside the card, clipped by it
//   confettiPop(badge);                     // confetti over the whole page
//
// Free to use in anything.

export interface ConfettiOptions {
  /** the element the confetti lives in (it clips it). Give it position: relative and
   *  overflow: hidden. Without one, the confetti flies over the whole page */
  within?: HTMLElement | null;
  /** confetti colours. Greens, golds, whites and mints */
  colors?: string[];
  /** how many pieces. 72 */
  count?: number;
  /** how hard they burst out. 1 */
  spread?: number;
  /** pull downwards, px per frame². 0.16 */
  gravity?: number;
  /** seconds before they start to fade. 3.6 (gone 0.9 s later) */
  duration?: number;
  /** pop the element itself. true */
  pop?: boolean;
  /** the glow's colour, or false for none. Mint green */
  glow?: string | false;
}

export const CONFETTI_DEFAULTS: Required<Omit<ConfettiOptions, "within">> = {
  colors: ["#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#fbbf24", "#fde68a", "#f59e0b", "#ffffff", "#f0fdf4", "#6ee7b7", "#a7f3d0"],
  count: 72,
  spread: 1,
  gravity: 0.16,
  duration: 3.6,
  pop: true,
  glow: "#4ade80",
};

// Framer Motion's easeOut, applied to each step of the pop like its `times` keyframes
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";
// a spring (visual duration 0.55 s, bounce 0.2) as a linear() curve, for the glow
const SPRING = "linear(0, 0.13 6%, 0.47 15%, 0.79 25%, 0.98 35%, 1.06 45%, 1.07 52%, 1.04 64%, 1.01 76%, 1)";

interface Piece { x: number; y: number; vx: number; vy: number; rot: number; rotV: number; w: number; h: number; color: string; dot: boolean }

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

  // 2. the glow: a soft mint ellipse that springs in above the element and stays
  const parent = el.parentElement;
  if (o.glow && parent) {
    parent.querySelectorAll(":scope > [data-confetti-glow]").forEach((g) => g.remove());
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    if (!el.style.zIndex) el.style.zIndex = "1";
    const b = el.getBoundingClientRect(), p = parent.getBoundingClientRect();
    const g = document.createElement("div");
    g.setAttribute("aria-hidden", "true");
    g.dataset.confettiGlow = "";
    const c = o.glow;
    Object.assign(g.style, {
      position: "absolute", zIndex: "0", pointerEvents: "none", width: "340px", height: "280px",
      left: `${b.left + b.width / 2 - p.left - 170}px`, top: `${b.top + b.height / 2 - p.top - 96}px`, transformOrigin: "center top",
      background: c === CONFETTI_DEFAULTS.glow
        ? "radial-gradient(ellipse 60% 60% at 50% 10%, rgba(187,247,208,0.95) 0%, rgba(134,239,172,0.55) 40%, rgba(74,222,128,0.15) 65%, transparent 85%)"
        : `radial-gradient(ellipse 60% 60% at 50% 10%, color-mix(in srgb, ${c} 30%, white) 0%, color-mix(in srgb, ${c} 55%, transparent) 40%, color-mix(in srgb, ${c} 15%, transparent) 65%, transparent 85%)`,
    });
    parent.insertBefore(g, parent.firstChild);
    g.animate([{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
      still ? { duration: 150, fill: "both" } : { duration: 700, easing: SPRING, fill: "both" });
  }
  if (still) return;

  // 3. the burst: a canvas over the container (or the page), 180 ms in, as the pop lands
  const host = o.within ?? null;
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, host
    ? { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "20" }
    : { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "9999" });
  if (host) {
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.appendChild(cv);
  } else document.body.appendChild(cv);

  const ctx = cv.getContext("2d")!;
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width * dpr;
  cv.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  let pieces: Piece[] = [];
  const launch = setTimeout(() => {
    const b = el.getBoundingClientRect(), c = cv.getBoundingClientRect();
    const cx = b.left + b.width / 2 - c.left, cy = b.top + b.height / 2 - c.top;
    pieces = Array.from({ length: o.count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1.8 + Math.random() * 5.5) * o.spread;
      const dot = Math.random() < 0.25;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5 * o.spread,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.18,
        w: dot ? 5 + Math.random() * 4 : 4 + Math.random() * 8,
        h: dot ? 5 + Math.random() * 4 : 9 + Math.random() * 8,
        color: o.colors[Math.floor(Math.random() * o.colors.length)],
        dot,
      };
    });
  }, 180);

  // the physics is per 60 Hz frame; scale it by the real frame time so 120 Hz looks the same
  const fadeAt = o.duration * 1000, end = fadeAt + 1600;
  let start = 0, last = 0, raf = 0;
  const frame = (now: number) => {
    if (!start) start = last = now;
    const t = now - start;
    const k = Math.min((now - last) / (1000 / 60), 3);
    last = now;
    ctx.clearRect(0, 0, W, H);
    const alpha = t > fadeAt ? Math.max(0, 1 - (t - fadeAt) / 900) : 1;
    const drag = Math.pow(0.988, k);
    for (const p of pieces) {
      p.vy += o.gravity * k;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.rot += p.rotV * k;
      if (alpha <= 0 || p.y > H + 40) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.dot) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < end) raf = requestAnimationFrame(frame);
    else cv.remove();
  };
  raf = requestAnimationFrame(frame);

  /** stop early (when the element goes away) */
  return () => { clearTimeout(launch); cancelAnimationFrame(raf); cv.remove(); };
}
