// Keycap: one white sculpted keycap riding in a slot, seen from above at an angle.
// The cap is a real little 3D model (rings lofted from the rounded base, up the tapered walls,
// over a soft fillet and down into a cylindrical dish), projected and shaded per facet, so the
// rounded corners and the dish catch the light the way a moulded cap does.
// Press it and it sinks. Drag it and it slides along the slot like a slider thumb and stays where
// you leave it (0 to 1); a plain click sends it to the far end.
// The slot behind it fills as it goes (lit white in dark, ink in light), the slot ahead stays an empty groove.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { play } from "../sound/sound";

/* ---------- projection: orthographic, azimuth 38deg, the camera ~41deg above the ground ---------- */
const S = 100; // one keycap width, in svg units
const AL = (38 * Math.PI) / 180, SE = 0.655, CE = Math.sqrt(1 - SE * SE);
const CA = Math.cos(AL), SA = Math.sin(AL);
type V3 = [number, number, number];
const proj = ([a, b, z]: V3): [number, number] => [S * (a * CA + b * SA), S * (-a * SA * SE + b * CA * SE - z * CE)];
const VIEW: V3 = [-SA * CE, CA * CE, SE]; // toward the viewer
const TRAVEL = 2.2; // how far the cap slides, in cap widths
const SLOT0 = -0.35, SLOT1 = TRAVEL + 0.75;

/* ---------- the cap model ---------- */
const H = 0.45, DISH = 0.11, BT = 0.32;
const zTop = (b: number) => { const t = Math.min(1, Math.abs(b) / BT); return H - DISH * (1 - t * t); };

const ARC = 12, EDGE = 14;
/** a rounded rectangle sampled with the same point count whatever its size, so rings line up */
function ring(hx: number, hy: number, r: number): [number, number][] {
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [[hx - r, hy - r, 0], [-(hx - r), hy - r, 90], [-(hx - r), -(hy - r), 180], [hx - r, -(hy - r), 270]];
  corners.forEach(([cx, cy, a0], i) => {
    for (let k = 0; k < ARC; k++) { const a = ((a0 + (90 * k) / ARC) * Math.PI) / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    const [nx, ny] = corners[(i + 1) % 4];
    const a1 = ((a0 + 90) * Math.PI) / 180;
    const sx = cx + r * Math.cos(a1), sy = cy + r * Math.sin(a1);
    const ex = nx + r * Math.cos(a1), ey = ny + r * Math.sin(a1);
    for (let k = 0; k < EDGE; k++) pts.push([sx + ((ex - sx) * k) / EDGE, sy + ((ey - sy) * k) / EDGE]);
  });
  return pts;
}

type Ring = V3[];
function buildRings(): Ring[] {
  const rings: Ring[] = [];
  const flat = (hx: number, hy: number, r: number, z: number) => ring(hx, hy, r).map(([a, b]) => [a, b, z] as V3);
  const top = (hx: number, hy: number, r: number, drop: number) => ring(hx, hy, r).map(([a, b]) => [a, b, zTop(b) - drop] as V3);
  rings.push(flat(0.47, 0.47, 0.11, 0));
  rings.push(flat(0.495, 0.495, 0.135, 0.018));
  rings.push(flat(0.5, 0.5, 0.14, 0.045));
  // the fillet over the top edge: a quarter ellipse from the wall to the rim of the dish
  for (let k = 0; k <= 9; k++) {
    const t = (k / 9) * (Math.PI / 2), c = Math.cos(t), sn = Math.sin(t);
    rings.push(top(0.326 + 0.034 * c, 0.312 + 0.036 * c, 0.122 + 0.02 * c, 0.065 * (1 - sn)));
  }
  return rings;
}

const sub = (p: V3, q: V3): V3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (u: V3, v: V3): V3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const dot = (u: V3, v: V3) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const norm = (u: V3): V3 => { const l = Math.hypot(...u) || 1; return [u[0] / l, u[1] / l, u[2] / l]; };

// studio light: a big soft key from the front right and above, a sky fill, a cool shadow tone
const KEY = norm([0.5, -0.6, 0.62]);
const FILL = norm([0, 0.8, 0.6]);
const RIM = norm([0.6, -0.5, 0.5]);
const SHADE = [128, 138, 156], LIT = [252, 253, 255];

function shadeColor(n: V3, c: V3) {
  let i = 0.34 + 0.4 * Math.max(0, dot(n, KEY)) + 0.16 * (n[2] * 0.5 + 0.5) + 0.2 * Math.max(0, dot(n, FILL)) + 0.08 * Math.max(0, dot(n, RIM));
  i -= 0.16 * (c[0] + 0.5) * (n[2] < 0.6 ? 1 : 0.25); // farther along the cap, a touch less light
  if (c[2] < 0.12) i -= 0.2 * (1 - c[2] / 0.12) * (1 - Math.max(0, n[2])); // contact occlusion at the foot
  const spec = Math.pow(Math.max(0, dot(norm([KEY[0] + VIEW[0], KEY[1] + VIEW[1], KEY[2] + VIEW[2]]), n)), 24) * 0.05;
  i = Math.max(0, Math.min(1, i));
  const col = SHADE.map((s, k) => Math.round(Math.min(255, s + (LIT[k] - s) * i + 255 * spec)));
  return `rgb(${col[0]},${col[1]},${col[2]})`;
}

type Facet = { d: string; fill: string; depth: number };
function buildFacets(): Facet[] {
  const rings = buildRings(), out: Facet[] = [];
  for (let r = 0; r < rings.length - 1; r++) {
    const A = rings[r], B = rings[r + 1], N = A.length;
    for (let j = 0; j < N; j++) {
      const p0 = A[j], p1 = A[(j + 1) % N], p2 = B[(j + 1) % N], p3 = B[j];
      let n = cross(sub(p1, p0), sub(p3, p0));
      if (Math.hypot(...n) < 1e-9) n = cross(sub(p2, p3), sub(p3, p0));
      if (Math.hypot(...n) < 1e-9) continue;
      n = norm(n);
      if (dot(n, VIEW) <= -0.02) continue;
      const c: V3 = [(p0[0] + p1[0] + p2[0] + p3[0]) / 4, (p0[1] + p1[1] + p2[1] + p3[1]) / 4, (p0[2] + p1[2] + p2[2] + p3[2]) / 4];
      const d = "M" + [p0, p1, p2, p3].map((p) => proj(p).map((v) => v.toFixed(2)).join(" ")).join("L") + "Z";
      out.push({ d, fill: shadeColor(n, c), depth: dot(c, VIEW) });
    }
  }
  return out.sort((x, y) => x.depth - y.depth);
}

const FACETS = buildFacets();

// the dish: a cylinder, so its light only changes across the cap. Thin bands across it, each
// filled with the colour of its own normal, clipped to the rim
const RIM_HX = 0.326, RIM_HY = 0.312, RIM_R = 0.122;
const DISH_CLIP = "M" + ring(RIM_HX, RIM_HY, RIM_R).map(([a, b]) => proj([a, b, zTop(b)]).map((v) => v.toFixed(2)).join(" ")).join("L") + "Z";
const DISH_BANDS = (() => {
  const n = 48, out: { d: string; fill: string }[] = [];
  for (let i = 0; i < n; i++) {
    const b0 = -RIM_HY + (2 * RIM_HY * i) / n, b1 = -RIM_HY + (2 * RIM_HY * (i + 1)) / n, bm = (b0 + b1) / 2;
    const slope = (2 * DISH * bm) / (BT * BT);
    const nrm = norm([0, -slope, 1]);
    const pts: V3[] = [[-0.5, b0 - 0.004, zTop(b0)], [0.5, b0 - 0.004, zTop(b0)], [0.5, b1 + 0.004, zTop(b1)], [-0.5, b1 + 0.004, zTop(b1)]];
    out.push({ d: "M" + pts.map((p) => proj(p).map((v) => v.toFixed(2)).join(" ")).join("L") + "Z", fill: shadeColor(nrm, [0, bm, H]) });
  }
  return out;
})();
const FOOT = "M" + ring(0.5, 0.5, 0.13).map(([a, b]) => proj([a, b, 0]).map((v) => v.toFixed(2)).join(" ")).join("L") + "Z";
const UNIT = proj([1, 0, 0]); // one cap width along the slot, on screen
const P0 = proj([SLOT0, 0, 0]), P1 = proj([SLOT1, 0, 0]);

// the frame: the real outline of the cap at both ends of its travel, the whole slot, and the
// shadow that falls below and to the right, so the piece can be centred as one object
const BOX = (() => {
  const xs: number[] = [], ys: number[] = [];
  const pts = buildRings().flat();
  for (const off of [0, TRAVEL]) for (const [a, b, z] of pts) { const [x, y] = proj([a + off, b, z]); xs.push(x); ys.push(y); }
  [P0, P1].forEach(([x, y]) => { xs.push(x - 5, x + 5); ys.push(y - 5, y + 5); });
  const x0 = Math.min(...xs) - 6, x1 = Math.max(...xs) + 12, y0 = Math.min(...ys) - 6, y1 = Math.max(...ys) + 18;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
})();

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ULEN = Math.hypot(UNIT[0], UNIT[1]);
const UDIR = [UNIT[0] / ULEN, UNIT[1] / ULEN];

export function Keycap({ value, onChange, width }: { value: number; onChange: (v: number) => void; width: number }) {
  const reduced = useReducedMotion();
  const [down, setDown] = useState(false);
  const pos = useSpring(value, { stiffness: 210, damping: 24, mass: 1 });
  const dip = useSpring(0, { stiffness: 900, damping: 30, mass: 0.6 });
  const drag = useRef<{ id: number; x: number; y: number; v0: number; moved: boolean; step: number } | null>(null);
  const live = useRef(false); // while dragging, the cap follows the pointer exactly
  useEffect(() => { if (reduced || live.current) pos.jump(value); else pos.set(value); }, [value, pos, reduced]);
  useEffect(() => { if (reduced) dip.jump(down ? 1 : 0); else dip.set(down ? 1 : 0); }, [down, dip, reduced]);

  const tx = useTransform(pos, (p) => UNIT[0] * TRAVEL * p);
  const ty = useTransform([pos, dip], ([p, d]: number[]) => UNIT[1] * TRAVEL * p + d * 0.085 * S * CE);
  const sx = tx, sy = useTransform(pos, (p) => UNIT[1] * TRAVEL * p);
  const shadowO = useTransform(dip, (d) => 0.55 + 0.25 * d);
  const shadowS = useTransform(dip, (d) => 1 - 0.04 * d);
  // the lit part of the slot runs from its start to under the cap
  const litX2 = useTransform(pos, (p) => P0[0] + (UNIT[0] * (TRAVEL * p - SLOT0)));
  const litY2 = useTransform(pos, (p) => P0[1] + (UNIT[1] * (TRAVEL * p - SLOT0)));
  const litO = useTransform(pos, (p) => Math.min(1, Math.max(0, p * 3)));

  // a plain click (or Space/Enter) sends the cap to the far end from where it sits
  const jump = () => { live.current = false; onChange(value >= 0.5 ? 0 : 1); };
  const press = () => { if (!down) { setDown(true); play("key"); } };
  const release = (commit: boolean) => { if (!down) return; setDown(false); if (commit) jump(); };
  const nudge = (v: number) => { live.current = false; const n = clamp01(Math.round(v * 100) / 100); if (n !== value) { play("detent", { gap: 40 }); onChange(n); } };

  // the cap's screen scale: svg units to css px
  const scale = width / BOX.w;
  const pct = Math.round(value * 100);

  const vectorCaps = useMemo(() => (
    <g filter="url(#kc-soft)">
      {FACETS.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.7} strokeLinejoin="round" />)}
      <g clipPath="url(#kc-dish)">{DISH_BANDS.map((f, i) => <path key={i} d={f.d} fill={f.fill} />)}</g>
    </g>
  ), []);

  return (
    <div role="slider" tabIndex={0} aria-label="Keycap slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${pct}%`}
      aria-orientation="horizontal" className="kc-btn"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, v0: value, moved: false, step: Math.floor(value * 10 + 1e-6) };
        press();
      }}
      onPointerMove={(e) => {
        const d = drag.current; if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.moved && Math.hypot(dx, dy) < 4) return;
        d.moved = true; live.current = true;
        const along = dx * UDIR[0] + dy * UDIR[1]; // the pointer projected onto the slot
        const v = clamp01(d.v0 + along / (ULEN * TRAVEL * scale));
        const step = Math.floor(v * 10 + 1e-6);
        if (step !== d.step) { d.step = step; play("detent", { gap: 40 }); }
        pos.jump(v);
        onChange(v);
      }}
      onPointerUp={(e) => {
        const d = drag.current; if (!d || d.id !== e.pointerId) return;
        drag.current = null;
        if (d.moved) { setDown(false); live.current = false; } else release(true);
      }}
      onPointerCancel={() => { drag.current = null; live.current = false; release(false); }}
      onKeyDown={(e) => {
        const k = e.key;
        if (k === "ArrowRight" || k === "ArrowUp") { e.preventDefault(); nudge(value + 0.05); }
        else if (k === "ArrowLeft" || k === "ArrowDown") { e.preventDefault(); nudge(value - 0.05); }
        else if (k === "PageUp") { e.preventDefault(); nudge(value + 0.1); }
        else if (k === "PageDown") { e.preventDefault(); nudge(value - 0.1); }
        else if (k === "Home") { e.preventDefault(); nudge(0); }
        else if (k === "End") { e.preventDefault(); nudge(1); }
        else if ((k === " " || k === "Enter") && !e.repeat) { e.preventDefault(); press(); }
      }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(true); } }}
      onBlur={() => { if (!drag.current) release(false); }}
      style={{ padding: 0, border: 0, background: "none", cursor: down ? "grabbing" : "grab", display: "block", borderRadius: 18, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTapHighlightColor: "transparent" }}>
      <style>{`.kc-btn{--kc-focus:rgba(255,255,255,.55);--kc-lip:rgba(255,255,255,.09);--kc-cut:rgba(0,0,0,.55);--kc-bed:#0c0d0c;--kc-floor:#1a1c1a;--kc-far:rgba(0,0,0,.7);
--kc-bloom:rgba(225,234,255,.42);--kc-lit:#dfe6f0;--kc-core:#ffffff;--kc-cast:#000}
:root[data-theme="light"] .kc-btn{--kc-focus:oklch(0.22 0.008 264 / .55);--kc-lip:oklch(1 0 0);--kc-cut:oklch(0.22 0.008 264 / .12);--kc-bed:oklch(0.905 0.004 264);--kc-floor:oklch(0.94 0.003 264);--kc-far:oklch(0.22 0.008 264 / .16);
--kc-bloom:oklch(0.22 0.008 264 / .1);--kc-lit:oklch(0.3 0.009 264);--kc-core:oklch(0.22 0.008 264);--kc-cast:oklch(0.3 0.011 264 / .38)}
.kc-btn:focus-visible{outline:2px solid var(--kc-focus);outline-offset:4px}`}</style>
      <svg viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`} width={width} height={(width * BOX.h) / BOX.w} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <filter id="kc-blur-l" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="kc-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" /></filter>
          <filter id="kc-glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.8" /></filter>
          <filter id="kc-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.3" /></filter>
          <clipPath id="kc-dish"><path d={DISH_CLIP} /></clipPath>
        </defs>

        {/* the slot: a groove cut into the surface. A soft sunk bed, the far wall in
            shadow, a thin lip of light on the near edge where the surface turns down into it */}
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} style={{ stroke: "var(--kc-lip)" }} strokeWidth={7.6} strokeLinecap="round" transform="translate(0.5 1.3)" />
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} style={{ stroke: "var(--kc-cut)" }} strokeWidth={7.6} strokeLinecap="round" transform="translate(0 -0.4)" />
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} style={{ stroke: "var(--kc-bed)" }} strokeWidth={6.2} strokeLinecap="round" />
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} style={{ stroke: "var(--kc-floor)" }} strokeWidth={3} strokeLinecap="round" transform="translate(0.2 1)" />
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} style={{ stroke: "var(--kc-far)" }} strokeWidth={1.6} strokeLinecap="round" transform="translate(-0.2 -1.3)" />
        {/* the lit slot behind the cap: a soft bloom in the groove and a clean core */}
        <motion.g style={{ opacity: litO }}>
          <motion.line x1={P0[0]} y1={P0[1]} x2={litX2} y2={litY2} style={{ stroke: "var(--kc-bloom)" }} strokeWidth={8} strokeLinecap="round" filter="url(#kc-glow)" />
          <motion.line x1={P0[0]} y1={P0[1]} x2={litX2} y2={litY2} style={{ stroke: "var(--kc-lit)" }} strokeWidth={4} strokeLinecap="round" />
          <motion.line x1={P0[0]} y1={P0[1]} x2={litX2} y2={litY2} style={{ stroke: "var(--kc-core)" }} strokeWidth={2} strokeLinecap="round" transform="translate(0 -0.4)" />
        </motion.g>

        {/* contact shadow: a wide soft one and a tight one at the foot */}
        <motion.g style={{ x: sx, y: sy, opacity: shadowO }}>
          <motion.path d={FOOT} filter="url(#kc-blur-l)" transform="translate(4 9)" style={{ scale: shadowS, fill: "var(--kc-cast)" }} />
          <path d={FOOT} style={{ fill: "var(--kc-cast)" }} opacity={0.8} filter="url(#kc-blur-s)" transform="translate(1 2.5)" />
        </motion.g>

        {/* the cap */}
        <motion.g style={{ x: tx, y: ty }}>
          {vectorCaps}
        </motion.g>
      </svg>
    </div>
  );
}

/** the block: one keycap slider in its slot, with a key sound on press and soft detents as it slides.
 * It measures its tile and sizes the whole travel (cap at both ends, slot, shadow) to fit, centred. */
export default function KeycapBlock({ size = "card" }: { size?: "card" | "big" }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(size === "big" ? 640 : 300);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const update = () => {
      const W = el.clientWidth, Hh = el.clientHeight; if (!W || !Hh) return;
      const big = size === "big";
      const side = big ? 96 : 40, clear = big ? 140 : Hh < 260 ? 68 : 128;
      setW(Math.max(80, Math.min(big ? 820 : 340, W - 2 * side, ((Hh - clear) * BOX.w) / BOX.h)));
    };
    const ro = new ResizeObserver(update); ro.observe(el); update();
    return () => ro.disconnect();
  }, [size]);
  return (
    <div ref={ref} data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <Keycap value={value} onChange={setValue} width={w} />
    </div>
  );
}
