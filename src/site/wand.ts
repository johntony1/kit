// wand.ts: the magic wand. Over a phrase marked .mw-words (see <Magic> in Bento.tsx) the cursor
// gives way to a small wand that hangs from the pointer and sways as it moves.
// Built after the wand on timothymaarv.me, which this follows closely.
//
//   140ms on the words   the wand pops in, a band of colour starts sweeping through the words
//   moving               the wand lags and swings (a spring on its angle), dust falls from its tip
//   click                the wand flicks forward (a spring on its pitch), 30 motes fly out, and a
//                        ring of colour spreads through the words from where it touched
//   leaving              the sweep finishes its pass, the wand shrinks away
//   once, on load        the heading sweeps by itself, trailing dust, as a hint
//
// One fixed layer (a canvas for the dust, the wand itself) that only draws while something is
// alive. Off for touch and for reduced motion.
import { play } from "../sound/sound";

const DEG = Math.PI / 180;
const REST_ANGLE = -35;   // deg the wand leans at rest
const REST_PITCH = 24;    // deg it tips toward the viewer at rest
const GRIP = 70;          // px from the grip to the tip
const ARM = 140;          // ms on the words before the wand appears
const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#facc15", "#3fc06c", "#3fc06c"];

type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; color: string; star: boolean; phase: number; twinkle: number };

/** how long the grip-to-tip length looks once the wand is pitched (it is drawn in perspective) */
const reach = (pitch: number) => { const t = pitch * DEG; return (GRIP * Math.cos(t) * 300) / (300 + GRIP * Math.sin(t)); };
const REST_REACH = reach(REST_PITCH);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** how far along a phrase (0 to 1, across its wrapped lines) a point sits */
function along(el: Element, x: number, y: number) {
  const rects = Array.from(el.getClientRects());
  const total = rects.reduce((s, r) => s + r.width, 0);
  if (!total) return 0.5;
  const off = (r: DOMRect) => Math.max(r.top - y, y - r.bottom, 0);
  const line = rects.reduce((a, b) => (off(b) < off(a) ? b : a));
  let w = Math.max(0, Math.min(line.width, x - line.left));
  for (const r of rects) { if (r === line) break; w += r.width; }
  return w / total;
}
/** the point on a phrase at a fraction of its length */
function pointAt(rects: DOMRect[], f: number) {
  if (f < 0 || f > 1) return null;
  let w = f * rects.reduce((s, r) => s + r.width, 0);
  for (const r of rects) { if (w <= r.width) return { x: r.left + w, y: r.top + rnd(0.25, 0.75) * r.height }; w -= r.width; }
  return null;
}
/** each word paints its own slice of one gradient that spans the whole phrase */
function measure(el: HTMLElement) {
  const total = Array.from(el.getClientRects()).reduce((s, r) => s + r.width, 0);
  el.style.setProperty("--mw-t", `${total}px`);
  for (const w of el.querySelectorAll<HTMLElement>(".mw-word")) {
    const b = w.getBoundingClientRect();
    w.style.setProperty("--mw-o", `${along(el, b.left, b.top + b.height / 2) * total}px`);
  }
}

export function startWand() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const layer = document.createElement("span");
  layer.className = "mw-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<canvas class="mw-dust"></canvas><span class="mw-wand is-away"><span class="mw-lift"><span class="mw-stick"><span class="mw-cap mw-cap--tip"></span><span class="mw-shaft"></span><span class="mw-cap mw-cap--butt"></span><span class="mw-star"></span></span></span></span>';
  document.body.appendChild(layer);
  const cv = layer.querySelector("canvas")!, wand = layer.querySelector<HTMLElement>(".mw-wand")!, stick = layer.querySelector<HTMLElement>(".mw-stick")!;
  const ctx = cv.getContext("2d")!;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size();

  const motes: Mote[] = [];
  const mote = (x: number, y: number, vx: number, vy: number) => motes.push({ x: x + rnd(-2, 2), y: y + rnd(-2, 2), vx, vy, age: 0, life: rnd(0.7, 1.5), size: rnd(0.8, 2.2), color: COLORS[(Math.random() * COLORS.length) | 0], star: Math.random() < 0.35, phase: rnd(0, Math.PI * 2), twinkle: rnd(8, 16) });

  const ptr = { x: 0, y: 0 };
  let words: HTMLElement | null = null;   // the phrase the wand is on
  let armed = false;                      // the wand is out
  let armTimer = 0;
  let flick = false, burst = false;       // set by a click, used up by the next frame
  let hint: HTMLElement | null = null;    // a phrase sweeping by itself, trailing dust
  let ring: { el: HTMLElement; at: number } | null = null;
  const sway = { a: REST_ANGLE, va: 0, p: REST_PITCH, vp: 0 };
  const vel = { x: 0, y: 0 };
  let grip: { x: number; y: number } | null = null, tip: { x: number; y: number } | null = null;
  let raf = 0, last = 0, idleSince = 0, tipDebt = 0, edgeDebt = 0;

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.max(0.001, Math.min((now - last) / 1000, 0.032));
    last = now;

    // the wand: its grip follows the pointer so that, at rest, the tip is exactly on it
    const lean = REST_ANGLE * DEG;
    const gx = ptr.x - REST_REACH * Math.sin(lean), gy = ptr.y + REST_REACH * Math.cos(lean);
    if (grip) { vel.x += ((gx - grip.x) / dt - vel.x) * 0.35; vel.y += ((gy - grip.y) / dt - vel.y) * 0.35; }
    grip = { x: gx, y: gy };
    // it swings against the way it is carried, and springs back
    const a0 = sway.a * DEG;
    const push = Math.max(-32, Math.min(32, 0.045 * (vel.x * Math.cos(a0) + vel.y * Math.sin(a0))));
    sway.va += ((REST_ANGLE - push - sway.a) * 170 - 11 * sway.va) * dt;
    sway.a += sway.va * dt;
    if (flick) sway.vp += 1100;
    flick = false;
    sway.vp += ((REST_PITCH - sway.p) * 240 - 13 * sway.vp) * dt;
    sway.p = Math.max(-10, Math.min(72, sway.p + sway.vp * dt));
    const a = sway.a * DEG, len = reach(sway.p);
    const tx = gx + len * Math.sin(a), ty = gy - len * Math.cos(a);
    wand.style.transform = `translate(${gx}px, ${gy}px)`;
    stick.style.transform = `perspective(300px) rotate(${sway.a}deg) rotateX(${sway.p}deg)`;
    wand.style.setProperty("--mw-lift", Math.max(0.15, 1 - (sway.p - REST_PITCH) / 48).toFixed(3));
    wand.classList.toggle("is-away", !armed);
    if (armed) {
      // dust from the tip: a steady trickle, more the faster it moves
      const vx = tip ? (tx - tip.x) / dt : 0, vy = tip ? (ty - tip.y) / dt : 0;
      for (tipDebt += (10 + 0.06 * Math.min(Math.hypot(vx, vy), 1600)) * dt; tipDebt >= 1; tipDebt--) {
        const d = rnd(0, Math.PI * 2), s = rnd(15, 70);
        mote(tx, ty, 0.22 * vx + Math.cos(d) * s, 0.22 * vy + Math.sin(d) * s - 20);
      }
    }
    tip = { x: tx, y: ty };

    // dust along the moving edges of colour: the hint's sweep, and a click's ring
    const edges: { el: HTMLElement; at: number; drift: number }[] = [];
    if (hint) edges.push({ el: hint, at: parseFloat(getComputedStyle(hint).getPropertyValue("--mw-beam")) / 100 - 0.03, drift: 30 });
    if (ring) { const r = parseFloat(getComputedStyle(ring.el).getPropertyValue("--mw-r")) / 100; edges.push({ el: ring.el, at: ring.at - r, drift: -40 }, { el: ring.el, at: ring.at + r, drift: 40 }); }
    if (edges.length) {
      for (edgeDebt += 60 * dt; edgeDebt >= 1; edgeDebt--) for (const e of edges) {
        const p = pointAt(Array.from(e.el.getClientRects()), e.at);
        if (!p) continue;
        const d = rnd(-Math.PI, 0), s = rnd(20, 90);
        mote(p.x, p.y, Math.cos(d) * s + e.drift, Math.sin(d) * s);
      }
    }
    if (burst) { burst = false; for (let i = 0; i < 30; i++) { const d = rnd(0, Math.PI * 2), s = rnd(60, 280); mote(tx, ty, Math.cos(d) * s, Math.sin(d) * s); } }
    if (motes.length > 320) motes.splice(0, motes.length - 320);

    // draw: motes fall, slow, twinkle and fade; on dark they add up to a glow
    const dark = document.documentElement.dataset.theme !== "light";
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.age += dt;
      if (m.age >= m.life) { motes.splice(i, 1); continue; }
      m.vy += 260 * dt; m.vx *= 1 - 1.8 * dt; m.vy *= 1 - 1.8 * dt; m.x += m.vx * dt; m.y += m.vy * dt;
      const k = m.age / m.life;
      const alpha = (1 - k) ** 1.5 * (0.55 + 0.45 * Math.sin(m.phase + m.age * m.twinkle));
      const r = m.size * (1 - 0.35 * k) * (m.star ? 2.6 : 1);
      ctx.fillStyle = m.color; ctx.globalAlpha = alpha;
      ctx.beginPath();
      if (m.star) { ctx.moveTo(m.x, m.y - r); ctx.quadraticCurveTo(m.x, m.y, m.x + r, m.y); ctx.quadraticCurveTo(m.x, m.y, m.x, m.y + r); ctx.quadraticCurveTo(m.x, m.y, m.x - r, m.y); ctx.quadraticCurveTo(m.x, m.y, m.x, m.y - r); }
      else ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
      ctx.fill();
      if (dark) { ctx.globalAlpha = 0.18 * alpha; ctx.beginPath(); ctx.arc(m.x, m.y, r * 3, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;

    // sleep once the wand is away and the last mote has gone
    if (armed || hint || ring || motes.length) idleSince = 0;
    else if (!idleSince) idleSince = now;
    else if (now - idleSince > 220) { grip = tip = null; return; }
    raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  const leave = () => {
    clearTimeout(armTimer); armTimer = 0;
    armed = false; words = null;   // the sweep ends itself on its next pass (see "iteration")
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    ptr.x = e.clientX; ptr.y = e.clientY;
    const el = (e.target as Element | null)?.closest?.<HTMLElement>(".mw-words") ?? null;
    if (el !== words) { leave(); words = el; }
    if (!el || armed || armTimer) return;
    armTimer = window.setTimeout(() => {
      armTimer = 0;
      if (!words) return;
      armed = true;
      measure(words);
      words.classList.add("is-beaming");
      // start the wand at the pointer, at rest, so it pops in rather than flying in
      sway.a = REST_ANGLE; sway.va = 0; sway.p = REST_PITCH; sway.vp = 0; vel.x = vel.y = 0; grip = tip = null;
      wake();
    }, ARM);
  };
  const down = (e: PointerEvent) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>(".mw-words");
    if (!el || e.pointerType === "touch") return;
    ptr.x = e.clientX; ptr.y = e.clientY;
    flick = burst = true;
    play("chime", { vol: 0.6 });
    measure(el);
    const at = along(el, e.clientX, e.clientY);
    el.style.setProperty("--mw-x", `${at * 100}%`);
    el.classList.remove("is-bursting");
    void el.offsetWidth;   // restart the ring
    el.classList.add("is-bursting");
    ring = { el, at };
    if (hint === el) hint = null;
    wake();
  };
  // a sweep that is no longer wanted stops at the end of its pass, never mid-way
  const iteration = (e: AnimationEvent) => {
    const el = e.target as HTMLElement;
    if (e.animationName !== "mw-beam" || !el.classList?.contains("mw-words")) return;
    if (hint === el) hint = null;
    if (el !== words || !armed) el.classList.remove("is-beaming");
  };
  const ended = (e: AnimationEvent) => {
    const el = e.target as HTMLElement;
    if (e.animationName !== "mw-burst") return;
    el.classList.remove("is-bursting");
    if (ring?.el === el) ring = null;
    if (el !== words || !armed) el.classList.remove("is-beaming");
  };
  // no double-click selection of the words while casting
  const noSelect = (e: MouseEvent) => { if (e.detail > 1 && (e.target as Element | null)?.closest?.(".mw-words")) e.preventDefault(); };

  addEventListener("pointermove", move, { passive: true });
  addEventListener("pointerdown", down, { passive: true });
  addEventListener("mousedown", noSelect);
  document.addEventListener("animationiteration", iteration);
  document.addEventListener("animationend", ended);
  document.addEventListener("pointerleave", leave);
  addEventListener("resize", size, { passive: true });

  // the hint: the first phrase on the page sweeps once by itself
  const hintTimer = window.setTimeout(() => {
    const el = document.querySelector<HTMLElement>(".mw-words");
    if (!el || armed) return;
    measure(el);
    hint = el;
    el.classList.add("is-beaming");
    wake();
  }, 800);

  return () => {
    clearTimeout(hintTimer); clearTimeout(armTimer); cancelAnimationFrame(raf);
    removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("mousedown", noSelect);
    document.removeEventListener("animationiteration", iteration); document.removeEventListener("animationend", ended); document.removeEventListener("pointerleave", leave);
    removeEventListener("resize", size);
    layer.remove();
  };
}
