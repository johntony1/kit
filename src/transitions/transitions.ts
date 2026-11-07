// transitions.ts
// Page transitions between two real DOM elements: the page you are on (`from`) and the
// next one (`to`), stacked in the same container. No screenshots, no dependencies.
//
//   await transition("burn", container, fromEl, toEl, { x: 0.3, y: 0.6 });
//
// Kinds: burn, paper, reveal, ink, curtain, pixels, zoom, tilt.
// Free to use in anything.

export type TransitionKind = "burn" | "paper" | "reveal" | "ink" | "curtain" | "pixels" | "zoom" | "tilt";

export interface TransitionOptions {
  /** where it starts, 0..1 of the container (the click). Centre by default */
  x?: number;
  y?: number;
  /** seconds. Each kind has its own default */
  duration?: number;
  /** colour for curtain and pixels panels */
  color?: string;
  /** burn: how ragged the edge is, 0..1. 0.5 */
  rough?: number;
  /** burn: smoke amount, 0..1. 0.6 */
  smoke?: number;
}

export const DURATIONS: Record<TransitionKind, number> = { burn: 2.2, paper: 0.9, reveal: 0.7, ink: 1.0, curtain: 1.1, pixels: 1.0, zoom: 0.7, tilt: 0.65 };

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = {
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  fire: (t: number) => Math.pow(t, 1.55), // fire speeds up as it spreads
  // paper: a smooth ease in and out (lift, travel, settle)
  paper: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/** run a per-frame function for `ms`, resolves when done */
function frames(ms: number, step: (t: number) => void) {
  return new Promise<void>((done) => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      step(t);
      if (t < 1) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });
}

/* ── ragged edges: a radius that wobbles around the circle (same maths for mask and fire) ── */
const K = [3, 5, 7, 11, 17, 23, 31];
const A = [0.5, 0.32, 0.22, 0.13, 0.08, 0.05, 0.035];
function edgeRadius(R: number, th: number, t: number, rough: number, seed: number) {
  let n = 0;
  for (let i = 0; i < K.length; i++) n += A[i] * Math.sin(K[i] * th + seed * (i + 1) * 1.7 + t * (0.6 + i * 0.35));
  return R * (1 + rough * 0.22 * n);
}
function polygon(cx: number, cy: number, R: number, t: number, rough: number, seed: number, out = 0, n = 220) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    const r = Math.max(0, edgeRadius(R, th, t, rough, seed) + out);
    pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]);
  }
  return pts;
}
/** a mask that hides the inside of a polygon (the hole burnt through) */
function holeMask(el: HTMLElement, W: number, H: number, pts: [number, number][]) {
  const d = `M0 0H${W}V${H}H0Z M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}Z`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'><path fill='white' fill-rule='evenodd' d='${d}'/></svg>`)}")`;
  el.style.maskImage = url;
  el.style.webkitMaskImage = url;
  el.style.maskSize = el.style.webkitMaskSize = "100% 100%";
}
function clearMask(el: HTMLElement) {
  el.style.maskImage = el.style.webkitMaskImage = "";
}

function overlayCanvas(box: HTMLElement) {
  const cv = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = box.clientWidth, H = box.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "3" });
  box.appendChild(cv);
  const ctx = cv.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return { cv, ctx, W, H };
}

const path = (ctx: CanvasRenderingContext2D, pts: [number, number][]) => {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
};

/* ── burn: the page burns away from a point ── */
async function burn(box: HTMLElement, from: HTMLElement, o: Required<TransitionOptions>) {
  const { cv, ctx, W, H } = overlayCanvas(box);
  const cx = o.x * W, cy = o.y * H;
  const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.25 + 40;
  const seed = Math.random() * 10;
  const smoke: { x: number; y: number; r: number; a: number; vx: number; vy: number }[] = [];
  const CHAR = 46;
  await frames(o.duration * 1000, (t) => {
    const R = 6 + maxR * ease.fire(t);
    const time = t * o.duration;
    holeMask(from, W, H, polygon(cx, cy, R, time, o.rough, seed));
    ctx.clearRect(0, 0, W, H);
    // char: browning and blackening just outside the hole, built from soft rings
    for (let k = CHAR; k > 0; k -= 2) {
      const a = Math.pow(1 - k / CHAR, 2.2);
      const wob = 0.75 + 0.25 * Math.sin(k * 1.7 + time * 3);
      ctx.strokeStyle = `rgba(${Math.max(20, 92 - k * 1.2)}, ${Math.max(10, 52 - k)}, ${Math.max(6, 24 - k * 0.4)}, ${(0.04 + a * 0.62) * wob})`;
      ctx.lineWidth = 3.2;
      path(ctx, polygon(cx, cy, R, time, o.rough, seed, k));
      ctx.stroke();
    }
    // the burnt lip
    ctx.strokeStyle = "rgba(22, 12, 6, 0.95)";
    ctx.lineWidth = 3.5;
    path(ctx, polygon(cx, cy, R, time, o.rough, seed, 2));
    ctx.stroke();
    // embers: a glowing line that flickers along its length
    const pts = polygon(cx, cy, R, time, o.rough, seed, 0.5, 220);
    ctx.save();
    ctx.shadowColor = "rgba(255, 120, 20, 0.9)";
    ctx.shadowBlur = 14;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const f = 0.55 + 0.45 * Math.sin(i * 0.9 + time * 18 + seed) * Math.sin(i * 0.23 + time * 7);
      ctx.strokeStyle = `rgba(255, ${140 + f * 90}, ${40 + f * 60}, ${0.55 + f * 0.45})`;
      ctx.lineWidth = 1.6 + f * 1.6;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255, 244, 200, 0.85)";
    ctx.lineWidth = 0.8;
    path(ctx, polygon(cx, cy, R, time, o.rough, seed, -0.5));
    ctx.stroke();
    // smoke rises from the rim and drifts
    if (o.smoke > 0) {
      for (let i = 0; i < 3 * o.smoke; i++) {
        const th = Math.random() * Math.PI * 2;
        const r = edgeRadius(R, th, time, o.rough, seed);
        smoke.push({ x: cx + Math.cos(th) * r, y: cy + Math.sin(th) * r, r: 6 + Math.random() * 10, a: 0.09 + Math.random() * 0.06, vx: (Math.random() - 0.5) * 0.4, vy: -0.4 - Math.random() * 0.7 });
      }
      for (const s of smoke) {
        s.x += s.vx; s.y += s.vy; s.r += 0.5; s.a *= 0.975;
        if (!Number.isFinite(s.x + s.y + s.r)) continue;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0, `rgba(70, 64, 58, ${s.a})`);
        g.addColorStop(1, "rgba(70, 64, 58, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
      }
      while (smoke.length > 500 || (smoke[0] && smoke[0].a < 0.004)) smoke.shift();
    }
  });
  cv.remove();
  clearMask(from);
}

/* ── ink: a wobbly blob of the next page spreads from a point ── */
async function ink(box: HTMLElement, from: HTMLElement, o: Required<TransitionOptions>) {
  const W = box.clientWidth, H = box.clientHeight;
  const cx = o.x * W, cy = o.y * H;
  const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.35;
  const seed = Math.random() * 10;
  await frames(o.duration * 1000, (t) => holeMask(from, W, H, polygon(cx, cy, maxR * ease.inOut(t), t * 3, 1.4, seed, 0, 160)));
  clearMask(from);
}

/* ── paper: the corner peels and the page folds over itself ── */
async function paper(box: HTMLElement, from: HTMLElement, o: Required<TransitionOptions>) {
  const { cv, ctx, W, H } = overlayCanvas(box);
  const paperColor = getComputedStyle(from).backgroundColor || "#f4f2ec";
  const C0: [number, number] = [W, H];
  const rect: [number, number][] = [[0, 0], [W, 0], [W, H], [0, H]];
  // keep the part of the page where side(X) holds
  const clip = (poly: [number, number][], f: (p: [number, number]) => number) => {
    const out: [number, number][] = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const fa = f(a), fb = f(b);
      if (fa <= 0) out.push(a);
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
    }
    return out;
  };
  await frames(o.duration * 1000, (t) => {
    const e = ease.paper(t);
    const P: [number, number] = [W - 2.05 * W * e, H - H * 0.28 * Math.sin(Math.PI * e)];
    const M: [number, number] = [(C0[0] + P[0]) / 2, (C0[1] + P[1]) / 2];
    let nx = C0[0] - P[0], ny = C0[1] - P[1];
    const L = Math.hypot(nx, ny) || 1;
    nx /= L; ny /= L;
    const d = (p: [number, number]) => (p[0] - M[0]) * nx + (p[1] - M[1]) * ny;
    const stay = clip(rect, d);                                   // the page still lying flat
    const folded = clip(rect, (p) => -d(p));                      // the part that has turned over
    const back = folded.map((p) => { const k = 2 * d(p); return [p[0] - k * nx, p[1] - k * ny] as [number, number]; });
    from.style.clipPath = stay.length > 2 ? `polygon(${stay.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})` : "polygon(0 0,0 0,0 0)";
    ctx.clearRect(0, 0, W, H);
    if (folded.length < 3) return;
    const lift = Math.sin(Math.PI * Math.min(1, e * 1.1));
    // the shadow the turning page casts on the next page
    ctx.save();
    const sh = ctx.createLinearGradient(M[0], M[1], M[0] + nx * 90, M[1] + ny * 90);
    sh.addColorStop(0, `rgba(0,0,0,${0.32 * lift})`);
    sh.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sh;
    path(ctx, folded); ctx.fill();
    ctx.restore();
    // a soft shadow on the flat page, just under the fold
    ctx.save();
    path(ctx, stay); ctx.clip();
    const s2 = ctx.createLinearGradient(M[0], M[1], M[0] - nx * 40, M[1] - ny * 40);
    s2.addColorStop(0, `rgba(0,0,0,${0.18 * lift})`);
    s2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = s2; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // the back of the page: paper, lit, darker at the crease
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${0.35 * lift})`;
    ctx.shadowBlur = 24;
    ctx.fillStyle = paperColor;
    path(ctx, back); ctx.fill();
    ctx.restore();
    ctx.save();
    path(ctx, back); ctx.clip();
    const bg = ctx.createLinearGradient(M[0], M[1], M[0] - nx * L * 0.5, M[1] - ny * L * 0.5);
    bg.addColorStop(0, "rgba(0,0,0,0.22)");
    bg.addColorStop(0.18, "rgba(255,255,255,0.10)");
    bg.addColorStop(0.6, "rgba(255,255,255,0.04)");
    bg.addColorStop(1, "rgba(0,0,0,0.06)");
    ctx.fillStyle = bg; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.restore();
  });
  cv.remove();
  from.style.clipPath = "";
}

/* ── the CSS ones ── */
async function reveal(box: HTMLElement, from: HTMLElement, to: HTMLElement, o: Required<TransitionOptions>) {
  const W = box.clientWidth, H = box.clientHeight;
  const r = Math.hypot(Math.max(o.x, 1 - o.x) * W, Math.max(o.y, 1 - o.y) * H);
  to.style.zIndex = "2";
  await to.animate([{ clipPath: `circle(0px at ${o.x * 100}% ${o.y * 100}%)` }, { clipPath: `circle(${r}px at ${o.x * 100}% ${o.y * 100}%)` }],
    { duration: o.duration * 1000, easing: "cubic-bezier(.76,0,.24,1)" }).finished;
  void from;
}

async function curtain(box: HTMLElement, from: HTMLElement, to: HTMLElement, o: Required<TransitionOptions>) {
  const N = 5, layer = document.createElement("div");
  Object.assign(layer.style, { position: "absolute", inset: "0", display: "flex", zIndex: "4", pointerEvents: "none" });
  const panels = Array.from({ length: N }, () => { const p = document.createElement("div"); Object.assign(p.style, { flex: "1", background: o.color, transform: "scaleY(0)" }); layer.appendChild(p); return p; });
  box.appendChild(layer);
  const half = (o.duration * 1000) / 2;
  const per = half * 0.6, gap = (half - per) / (N - 1);
  await Promise.all(panels.map((p, i) => p.animate([{ transform: "scaleY(0)", transformOrigin: "50% 100%" }, { transform: "scaleY(1)", transformOrigin: "50% 100%" }], { duration: per, delay: i * gap, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).finished));
  from.style.visibility = "hidden";
  to.style.visibility = "visible";
  await Promise.all(panels.map((p, i) => p.animate([{ transform: "scaleY(1)", transformOrigin: "50% 0%" }, { transform: "scaleY(0)", transformOrigin: "50% 0%" }], { duration: per, delay: i * gap, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).finished));
  layer.remove();
}

async function pixels(box: HTMLElement, from: HTMLElement, to: HTMLElement, o: Required<TransitionOptions>) {
  const W = box.clientWidth, H = box.clientHeight;
  const cols = 14, size = W / cols, rows = Math.ceil(H / size);
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: "absolute", inset: "0", zIndex: "4", pointerEvents: "none" });
  const cells: { el: HTMLDivElement; r: number }[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const el = document.createElement("div");
    Object.assign(el.style, { position: "absolute", left: `${x * size}px`, top: `${y * size}px`, width: `${size + 0.5}px`, height: `${size + 0.5}px`, background: o.color, opacity: "0" });
    layer.appendChild(el);
    cells.push({ el, r: Math.random() * 0.7 + ((x + y) / (cols + rows)) * 0.3 });
  }
  box.appendChild(layer);
  const half = (o.duration * 1000) / 2;
  await Promise.all(cells.map((c) => c.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: half * 0.25, delay: c.r * half * 0.75, fill: "forwards" }).finished));
  from.style.visibility = "hidden";
  to.style.visibility = "visible";
  await Promise.all(cells.map((c) => c.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: half * 0.25, delay: (1 - c.r) * half * 0.75, fill: "forwards" }).finished));
  layer.remove();
}

async function zoom(box: HTMLElement, from: HTMLElement, to: HTMLElement, o: Required<TransitionOptions>) {
  const ms = o.duration * 1000;
  from.style.zIndex = "2";
  from.style.transformOrigin = `${o.x * 100}% ${o.y * 100}%`;
  await Promise.all([
    from.animate([{ transform: "scale(1)", filter: "blur(0px)", opacity: 1 }, { transform: "scale(1.35)", filter: "blur(10px)", opacity: 0 }], { duration: ms, easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" }).finished,
    to.animate([{ transform: "scale(.92)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: ms * 0.85, delay: ms * 0.15, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }).finished,
  ]);
  void box;
}

async function tilt(box: HTMLElement, from: HTMLElement, to: HTMLElement, o: Required<TransitionOptions>) {
  const ms = o.duration * 1000;
  box.style.perspective = "1400px";
  to.style.zIndex = "2";
  await Promise.all([
    from.animate([{ transform: "translateX(0) rotateY(0deg) scale(1)", filter: "brightness(1)" }, { transform: "translateX(-14%) rotateY(18deg) scale(.86)", filter: "brightness(.45)" }], { duration: ms, easing: "cubic-bezier(.32,.72,0,1)", fill: "forwards" }).finished,
    to.animate([{ transform: "translateX(100%)", boxShadow: "-30px 0 60px rgba(0,0,0,.35)" }, { transform: "translateX(0)", boxShadow: "0 0 0 rgba(0,0,0,0)" }], { duration: ms, easing: "cubic-bezier(.32,.72,0,1)", fill: "backwards" }).finished,
  ]);
  box.style.perspective = "";
}

/** swap `from` for `to` inside `box` with a transition. Both should already be children of box */
export async function transition(kind: TransitionKind, box: HTMLElement, from: HTMLElement, to: HTMLElement, options: TransitionOptions = {}) {
  const clean = Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined && (typeof v !== "number" || Number.isFinite(v))));
  const o: Required<TransitionOptions> = { x: 0.5, y: 0.5, duration: DURATIONS[kind], color: "#34b562", rough: 0.5, smoke: 0.6, ...clean };
  if (getComputedStyle(box).position === "static") box.style.position = "relative";
  box.style.overflow = "hidden";
  for (const el of [from, to]) Object.assign(el.style, { position: "absolute", inset: "0" });
  from.style.zIndex = "1";
  to.style.zIndex = "0";
  to.style.visibility = "visible";
  if (still()) { from.style.visibility = "hidden"; return; }
  // the ones that cover the screen first keep the next page hidden until the swap
  if (kind === "curtain" || kind === "pixels") to.style.visibility = "hidden";
  if (kind === "burn") await burn(box, from, o);
  else if (kind === "paper") await paper(box, from, o);
  else if (kind === "ink") await ink(box, from, o);
  else if (kind === "reveal") await reveal(box, from, to, o);
  else if (kind === "curtain") await curtain(box, from, to, o);
  else if (kind === "pixels") await pixels(box, from, to, o);
  else if (kind === "zoom") await zoom(box, from, to, o);
  else await tilt(box, from, to, o);
  from.style.visibility = "hidden";
  from.style.zIndex = to.style.zIndex = "";
}
