// Keycap: one white sculpted keycap riding in a slot, seen from above at an angle.
// The cap is a real little 3D model (rings lofted from the rounded base, up the tapered walls,
// over a soft fillet and down into a cylindrical dish), projected and shaded per facet, so the
// rounded corners and the dish catch the light the way a moulded cap does.
// Press it and it sinks; let go and it slides along the slot to the other end and stays there.
// The slot behind it lights up white as it goes, the slot ahead stays a dark groove.
import { useEffect, useState } from "react";
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

// the frame: both ends of the travel, with room for the shadow
const BOX = (() => {
  const xs: number[] = [], ys: number[] = [];
  for (const a of [-0.55, TRAVEL + 0.55]) for (const b of [-0.55, 0.55]) for (const z of [0, H]) { const [x, y] = proj([a, b, z]); xs.push(x); ys.push(y); }
  [P0, P1].forEach(([x, y]) => { xs.push(x); ys.push(y); });
  const m = 18;
  return { x: Math.min(...xs) - m, y: Math.min(...ys) - m, w: Math.max(...xs) - Math.min(...xs) + 2 * m, h: Math.max(...ys) - Math.min(...ys) + 2 * m + 10 };
})();

export function Keycap({ on, onToggle, width }: { on: boolean; onToggle: () => void; width: number }) {
  const reduced = useReducedMotion();
  const [down, setDown] = useState(false);
  const pos = useSpring(on ? 1 : 0, { stiffness: 210, damping: 24, mass: 1 });
  const dip = useSpring(0, { stiffness: 900, damping: 30, mass: 0.6 });
  useEffect(() => { if (reduced) pos.jump(on ? 1 : 0); else pos.set(on ? 1 : 0); }, [on, pos, reduced]);
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

  const press = () => { if (!down) { setDown(true); play("key"); } };
  const release = (commit: boolean) => { if (!down) return; setDown(false); if (commit) onToggle(); };

  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Keycap" className="kc-btn"
      onPointerDown={(e) => { if (e.button === 0) { e.currentTarget.setPointerCapture(e.pointerId); press(); } }}
      onPointerUp={() => release(true)} onPointerCancel={() => release(false)}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(); } }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(true); } }}
      onBlur={() => release(false)}
      onClick={(e) => { if (e.detail === 0 && !down) { play("key"); onToggle(); } }}
      style={{ padding: 0, border: 0, background: "none", cursor: "pointer", display: "block", borderRadius: 18, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
      <style>{`.kc-btn:focus-visible{outline:2px solid rgba(255,255,255,.55);outline-offset:4px}`}</style>
      <svg viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`} width={width} height={(width * BOX.h) / BOX.w} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <filter id="kc-blur-l" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="kc-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" /></filter>
          <filter id="kc-glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
          <filter id="kc-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.3" /></filter>
          <clipPath id="kc-dish"><path d={DISH_CLIP} /></clipPath>
        </defs>

        {/* the slot: a groove cut in the surface, a lip of light on its far edge */}
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke="rgba(255,255,255,.07)" strokeWidth={6.4} strokeLinecap="round" transform="translate(0.6 1.2)" />
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke="#0b0c0c" strokeWidth={5.2} strokeLinecap="round" />
        <line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke="#2a2f36" strokeWidth={2.6} strokeLinecap="round" transform="translate(0 0.7)" />
        {/* the lit slot behind the cap */}
        <motion.g style={{ opacity: litO }}>
          <motion.line x1={P0[0]} y1={P0[1]} x2={litX2} y2={litY2} stroke="rgba(235,241,255,.5)" strokeWidth={6} strokeLinecap="round" filter="url(#kc-glow)" />
          <motion.line x1={P0[0]} y1={P0[1]} x2={litX2} y2={litY2} stroke="#f4f7fb" strokeWidth={3.4} strokeLinecap="round" />
        </motion.g>

        {/* contact shadow: a wide soft one and a tight one at the foot */}
        <motion.g style={{ x: sx, y: sy, opacity: shadowO }}>
          <motion.path d={FOOT} fill="#000" filter="url(#kc-blur-l)" transform="translate(4 9)" style={{ scale: shadowS }} />
          <path d={FOOT} fill="#000" opacity={0.8} filter="url(#kc-blur-s)" transform="translate(1 2.5)" />
        </motion.g>

        {/* the cap */}
        <motion.g style={{ x: tx, y: ty }}>
          <g filter="url(#kc-soft)">
            {FACETS.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.7} strokeLinejoin="round" />)}
            <g clipPath="url(#kc-dish)">{DISH_BANDS.map((f, i) => <path key={i} d={f.d} fill={f.fill} />)}</g>
          </g>
        </motion.g>
      </svg>
    </button>
  );
}

/** the block: one keycap that slides from end to end of its slot, with a key sound on each press */
export default function KeycapBlock({ size = "card" }: { size?: "card" | "big" }) {
  const [on, setOn] = useState(false);
  return (
    <div data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <Keycap on={on} onToggle={() => setOn((v) => !v)} width={size === "big" ? 860 : 330} />
    </div>
  );
}
