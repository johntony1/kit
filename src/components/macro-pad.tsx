// Macro pad: a little anodised aluminium device in two parts, drawn as a real 3/4 render.
// Every solid (lid, base tray, key caps, switch housings, USB plug) is modelled as lofted
// rounded rectangles in 3D, projected through one perspective camera and shaded per facet
// against one key light, so bevels, side faces and rim lights all agree. A lid with a black
// glass screen and four countersunk screws, a fabric strap for a hinge, a deep base tray with
// four mechanical keys (magenta 0, black 1, magenta 2, black enter), a USB-C plug on the left
// and a braided magenta cable looping behind. Each key travels down into its switch and springs
// back; 0, 1 and 2 type onto the screen, enter confirms and clears.
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { play } from "../sound/sound";

/* ── tiny 3D kit ─────────────────────────────────────────────────────── */

type V3 = [number, number, number];
type P2 = [number, number];
type RGB = [number, number, number];
const deg = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));

// world: x right, y away from the viewer, z up. Camera a little left of centre, looking down.
const AZ = -8 * deg, EL = 23 * deg, DIST = 1250;
const TGT: V3 = [0, 30, 60];
const DIR: V3 = [Math.sin(AZ) * Math.cos(EL), -Math.cos(AZ) * Math.cos(EL), Math.sin(EL)];
const CAM = add(TGT, mul(DIR, DIST));
const FWD = mul(DIR, -1);
const RGT = nrm(cross(FWD, [0, 0, 1]));
const UPV = cross(RGT, FWD);
const LIGHT = nrm([-0.5, -0.55, 0.9]);

function proj(p: V3): P2 {
  const d = sub(p, CAM);
  const z = dot(d, FWD);
  return [(dot(d, RGT) * DIST) / z, (-dot(d, UPV) * DIST) / z];
}

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB) => `rgb(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(",")})`;

type Mat = { dark: RGB; light: RGB; amb: number; ks: number; sh: number; rim: number };
const ALU: Mat = { dark: hex("#2b3245"), light: hex("#c2cbe2"), amb: 0.2, ks: 0.55, sh: 34, rim: 0.3 };
const ALU_IN: Mat = { dark: hex("#11141b"), light: hex("#5f6880"), amb: 0.12, ks: 0.12, sh: 16, rim: 0 };
const PINK: Mat = { dark: hex("#36031d"), light: hex("#dc3a86"), amb: 0.22, ks: 0.2, sh: 16, rim: 0.12 };
const BLACK: Mat = { dark: hex("#060608"), light: hex("#3a3c44"), amb: 0.14, ks: 0.24, sh: 22, rim: 0.14 };
const HOUSING: Mat = { dark: hex("#050608"), light: hex("#2c2f37"), amb: 0.12, ks: 0.1, sh: 12, rim: 0.05 };
const GLASSRIM: Mat = { dark: hex("#030305"), light: hex("#1d2028"), amb: 0.2, ks: 0.4, sh: 30, rim: 0.1 };
const PLUG: Mat = { dark: hex("#040405"), light: hex("#3a3c43"), amb: 0.1, ks: 0.5, sh: 40, rim: 0.2 };

function shade(n: V3, p: V3, m: Mat) {
  const nn = nrm(n);
  const lam = Math.max(0, dot(nn, LIGHT));
  const v = nrm(sub(CAM, p));
  const h = nrm(add(LIGHT, v));
  const spec = Math.pow(Math.max(0, dot(nn, h)), m.sh) * m.ks;
  const fr = Math.pow(1 - Math.max(0, dot(nn, v)), 3) * m.rim;
  let c = mix(m.dark, m.light, m.amb + (1 - m.amb) * lam);
  c = mix(c, [255, 255, 255], Math.min(1, spec));
  c = mix(c, [205, 218, 255], Math.min(1, fr));
  return css(c);
}

const f2 = (n: number) => n.toFixed(2);
const path = (pts: P2[], close = true) => "M" + pts.map((p) => `${f2(p[0])} ${f2(p[1])}`).join("L") + (close ? "Z" : "");

// rounded rectangle in a plane, counter clockwise: corners front right, back right, back left, front left
const NC = 7;
function rr(hw: number, hh: number, r: number): [number, number][] {
  r = Math.max(0.8, Math.min(r, hw, hh));
  const out: [number, number][] = [];
  const cs: [number, number, number][] = [[hw - r, -hh + r, -90], [hw - r, hh - r, 0], [-hw + r, hh - r, 90], [-hw + r, -hh + r, 180]];
  for (const [cx, cy, a0] of cs) for (let i = 0; i <= NC; i++) {
    const a = (a0 + (90 * i) / NC) * deg;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}
// the front half of a ring, side walls included up to where the back corners start
function front<T>(ring: T[]): T[] {
  const k = NC + 1;
  return [ring[3 * k - 1], ...ring.slice(3 * k), ...ring.slice(0, k), ring[k]];
}

type Face = { d: string; fill: string };
function walls(rings: V3[][], m: Mat, inward = false): Face[] {
  const out: (Face & { z: number })[] = [];
  for (let r = 0; r < rings.length - 1; r++) {
    const A = rings[r], B = rings[r + 1];
    for (let i = 0; i < A.length; i++) {
      const j = (i + 1) % A.length;
      let n = cross(sub(A[j], A[i]), sub(B[i], A[i]));
      if (inward) n = mul(n, -1);
      const c = mul(add(add(A[i], A[j]), add(B[i], B[j])), 0.25);
      if (dot(n, sub(CAM, c)) <= 0) continue;
      out.push({ d: path([A[i], A[j], B[j], B[i]].map(proj)), fill: shade(n, c, m), z: Math.hypot(...sub(c, CAM)) });
    }
  }
  if (inward) out.sort((a, b) => b.z - a.z);
  return out;
}
function normalOf(ring: V3[]): V3 {
  let n: V3 = [0, 0, 0];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    n = add(n, [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]);
  }
  return n;
}
const centroid = (ring: V3[]) => mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / ring.length);
const capFill = (ring: V3[], m: Mat) => shade(normalOf(ring), centroid(ring), m);
const rp = (ring: V3[]) => path(ring.map(proj));

function hull(pts: P2[]): P2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], up: P2[] = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
// affine map that lays flat 2D artwork onto a plane at o spanned by ex (svg x) and ey (svg y)
function plane(o: V3, ex: V3, ey: V3) {
  const p0 = proj(o), px = proj(add(o, mul(ex, 10))), py = proj(add(o, mul(ey, 10)));
  return `matrix(${f2((px[0] - p0[0]) / 10)} ${((px[1] - p0[1]) / 10).toFixed(4)} ${((py[0] - p0[0]) / 10).toFixed(4)} ${f2((py[1] - p0[1]) / 10)} ${f2(p0[0])} ${f2(p0[1])})`;
}
type Screw = { sink: string; head: string; slot: string };
function screw(c: V3, ex: V3, ey: V3): Screw {
  const ring = (r: number) => path(Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI * 2; return proj(add(c, add(mul(ex, Math.cos(a) * r), mul(ey, Math.sin(a) * r)))); }));
  const ln = (a: number, r: number) => { const d = add(mul(ex, Math.cos(a) * r), mul(ey, Math.sin(a) * r)); return path([proj(sub(c, d)), proj(add(c, d))], false); };
  return { sink: ring(4.6), head: ring(3.4), slot: ln(35 * deg, 2.1) + ln(125 * deg, 2.1) };
}

/* ── the model ───────────────────────────────────────────────────────── */

type KeyId = "0" | "1" | "2" | "enter";
const KEYS: { id: KeyId; tone: "pink" | "black"; label: string }[] = [
  { id: "0", tone: "pink", label: "0" },
  { id: "1", tone: "black", label: "1" },
  { id: "2", tone: "pink", label: "2" },
  { id: "enter", tone: "black", label: "Enter" },
];
const TRAVEL = 6.5;
const MAX = 9;
const INITIAL = "21.02-22.02";

const BW = 150, BD = 66, BR = 24, BZ = 36;
const LW = 146, LH = 150, LR = 22, LT = 16, TILT = 15 * deg;
const HINGE: V3 = [0, BD + 8, 60];
const VV: V3 = [0, Math.sin(TILT), Math.cos(TILT)];
const VW: V3 = [0, -Math.cos(TILT), Math.sin(TILT)];
const KX = [-96, -32, 32, 96], KCY = -2, KH = 29, KB = 33, KTOP = 55.5, KTILT = 0.08, KBACK = 1.5;

const baseRing = (ins: number, z: number): V3[] => rr(BW - ins, BD - ins, BR - ins).map(([a, b]) => [a, b, z]);
const lidPt = (u: number, v: number, w: number): V3 => add(add(add(HINGE, [u, 0, 0]), mul(VV, v)), mul(VW, w));
const lidRing = (ins: number, w: number): V3[] => rr(LW - ins, LH / 2 - ins, LR - ins).map(([a, b]) => lidPt(a, b + LH / 2, w));

type KeyModel = {
  id: KeyId; tone: "pink" | "black"; label: string; i: number;
  housing: Face[]; housingTop: Face; vents: string[];
  skirt: Face[]; top: string; topFill: string; topEdge: string; labelM: string;
  dx: number; dy: number; hit: P2[];
};

function buildKey(i: number): KeyModel {
  const k = KEYS[i];
  const kx = KX[i];
  const m = k.tone === "pink" ? PINK : BLACK;
  // switch housing: a dark box standing on the tray floor
  const hRing = (ins: number, z: number): V3[] => rr(24 - ins, 24 - ins, 3).map(([a, b]) => [kx + a, KCY + b, z]);
  const housing = walls([hRing(0, 12), hRing(0, KB + 1)], HOUSING);
  const hTop = hRing(0, KB + 1);
  const vents: string[] = [];
  for (let s = -1; s <= 1; s++) {
    const x0 = kx + s * 13 - 4.5, y = KCY - 24.05;
    vents.push(rp([[x0, y, 27], [x0 + 9, y, 27], [x0 + 9, y, 31], [x0, y, 31]]));
  }
  // cap: a tapered skirt, a rounded top edge and a top face tilted a touch toward the viewer
  const cRing = (ins: number, z: number, tilt: number, back: number): V3[] =>
    rr(KH - ins, KH - ins, 5 + ins * 0.35).map(([a, b]) => [kx + a, KCY + back + b, z + tilt * b]);
  const rings = [cRing(0, KB, 0, 0), cRing(0.4, KB + 1.2, 0, 0), cRing(3.4, KTOP - 4, KTILT * 0.7, KBACK * 0.8), cRing(4.8, KTOP - 0.8, KTILT, KBACK), cRing(6.3, KTOP, KTILT, KBACK)];
  const skirt = walls(rings, m);
  const top = rings[rings.length - 1];
  const tp = (a: number, b: number): V3 => [kx + a, KCY + KBACK + b, KTOP + KTILT * b];
  const c0 = proj(tp(0, 0)), c1 = proj(add(tp(0, 0), [0, 0, -TRAVEL]));
  const hit = hull([...rings[0], ...top].map(proj));
  return {
    id: k.id, tone: k.tone, label: k.label, i, housing,
    housingTop: { d: rp(hTop), fill: capFill(hTop, HOUSING) }, vents, skirt,
    top: rp(top), topFill: capFill(top, m), topEdge: path(front(top).map(proj), false),
    labelM: plane(tp(0, 0), [1, 0, 0], nrm([0, -1, -KTILT])),
    dx: c1[0] - c0[0], dy: c1[1] - c0[1], hit,
  };
}

function build() {
  // lid
  const lidWalls = walls([lidRing(3, 0), lidRing(0, 2.5), lidRing(0, LT - 3), lidRing(1.3, LT - 1), lidRing(3.2, LT)], ALU);
  const lidFace = { d: rp(lidRing(3.2, LT)) + rp(lidRing(11, LT)), fill: capFill(lidRing(3.2, LT), ALU) };
  const lidTopEdge = path(lidRing(3.2, LT).slice(NC + 1, 3 * (NC + 1)).map(proj), false);
  const bezelStep = walls([lidRing(12.5, LT - 2), lidRing(11, LT)], ALU, true);
  const ledge = { d: rp(lidRing(12.5, LT - 2)) + rp(lidRing(18, LT - 2)), fill: capFill(lidRing(12.5, LT - 2), ALU) };
  const ledgeFront = path(lidRing(12.5, LT - 2).slice(NC + 1, 3 * (NC + 1)).map(proj), false);
  const glassStep = walls([lidRing(19.2, LT - 3.5), lidRing(18, LT - 2)], GLASSRIM, true);
  const glass = rp(lidRing(19.2, LT - 3.5));
  const display = rp(lidRing(26, LT - 3.5));
  const GW = LT - 3.4;
  const refl = rp([lidPt(-70, 150, GW), lidPt(-18, 150, GW), lidPt(-92, 0, GW), lidPt(-144, 0, GW)]);
  const refl2 = rp([lidPt(-6, 150, GW), lidPt(6, 150, GW), lidPt(-68, 0, GW), lidPt(-80, 0, GW)]);
  const screenM = plane(lidPt(0, LH / 2 - 1, GW), [1, 0, 0], mul(VV, -1));
  const lidScrews = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sv]) =>
    screw(lidPt(sx * (LW - LR + (LR - 7.2) * 0.7071), LH / 2 + sv * (LH / 2 - LR + (LR - 7.2) * 0.7071), LT + 0.02), [1, 0, 0], VV));

  // fabric strap from the back of the base up behind the lid
  const strapAt = (t: number, u: number): V3 => {
    const a: V3 = [u, BD - 10, BZ - 2], b = lidPt(u, 14, 6), c: V3 = [u, BD + 16, (BZ + HINGE[2]) / 2 + 2];
    const s = 1 - t;
    return add(add(mul(a, s * s), mul(c, 2 * s * t)), mul(b, t * t));
  };
  const strapPts: P2[] = [];
  for (let t = 0; t <= 1.001; t += 0.1) strapPts.push(proj(strapAt(t, -30)));
  for (let t = 1; t >= -0.001; t -= 0.1) strapPts.push(proj(strapAt(t, 30)));
  const strap = path(strapPts);
  const strapSeams = [-26, 26].map((u) => path(Array.from({ length: 11 }, (_, i) => proj(strapAt(i / 10, u))), false));

  // base
  const baseWalls = walls([baseRing(4, 0), baseRing(0, 4), baseRing(0, BZ - 4), baseRing(1.3, BZ - 1), baseRing(3.2, BZ)], ALU);
  const baseFrontEdge = path(front(baseRing(3.2, BZ)).map(proj), false);
  const baseSeam = path(front(baseRing(0, BZ - 12)).map(proj), false);
  const rimTop = { d: rp(baseRing(3.2, BZ)) + rp(baseRing(13, BZ)), fill: capFill(baseRing(3.2, BZ), ALU) };
  const chamfer = walls([baseRing(16, BZ - 3), baseRing(13, BZ)], ALU, true);
  const trayWalls = walls([baseRing(16, 12), baseRing(16, BZ - 3)], ALU_IN, true);
  const floor = rp(baseRing(16, 12));
  const opening = rp(baseRing(16, BZ - 3));
  const frontClip = path([...front(baseRing(-2, BZ)).map(proj), ...front(baseRing(16, BZ - 3)).map(proj).reverse()]);
  const chamferEdge = path(front(baseRing(16, BZ - 3)).map(proj), false);
  const baseScrews = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy]) =>
    screw([sx * (BW - BR + (BR - 7.6) * 0.7071), sy * (BD - BR + (BR - 7.6) * 0.7071), BZ + 0.02], [1, 0, 0], [0, 1, 0]));
  const shadow = rp(baseRing(6, 0));

  // USB-C plug in the left end, with a strain relief
  const pRing = (x: number, hz: number, hy: number, r: number): V3[] => rr(hz, hy, r).map(([a, b]) => [x, b, 19 + a]);
  const plug = walls([pRing(-BW + 4, 8, 12, 6), pRing(-BW - 24, 8, 12, 6), pRing(-BW - 27, 7, 11, 5.4), pRing(-BW - 28, 5.6, 9.6, 4.6),
    pRing(-BW - 29, 5, 6.6, 4.4), pRing(-BW - 40, 4.6, 5.6, 4.2)], PLUG);
  const plugEnd = pRing(-BW - 40, 4.6, 5.6, 4.2);
  const plugCap = { d: rp(plugEnd), fill: capFill(plugEnd, PLUG) };
  const cableStart = proj([-BW - 40, 0, 19]);

  const keys = KEYS.map((_, i) => buildKey(i));
  const keyOrder = [...keys].sort((a, b) => Math.hypot(...sub([KX[b.i], KCY, 45], CAM)) - Math.hypot(...sub([KX[a.i], KCY, 45], CAM)));

  // frame: everything solid, then pad
  const all: P2[] = [...baseRing(0, 0), ...baseRing(0, BZ), ...lidRing(0, 0), ...lidRing(0, LT), ...plugEnd].map(proj);
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const PAD = 10;
  const vb = { x: minX - PAD, y: minY - PAD, w: maxX - minX + PAD * 2, h: maxY - minY + PAD * 2 + 6 };

  // braided cable: enters top right, loops behind the lid on the left, crosses behind the strap,
  // drops behind the right end and runs under the front of the base, out to the left
  const X = (t: number) => minX + (maxX - minX) * t, Y = (t: number) => minY + (maxY - minY) * t;
  const braid = sampleChain([X(1.12), Y(0.0)], [
    [[X(0.85), Y(-0.07)], [X(0.4), Y(-0.1)], [X(0.15), Y(0.02)]],
    [[X(-0.04), Y(0.1)], [X(-0.04), Y(0.42)], [X(0.25), Y(0.5)]],
    [[X(0.55), Y(0.58)], [X(0.98), Y(0.5)], [X(1.02), Y(0.7)]],
    [[X(1.06), Y(0.92)], [X(0.8), Y(1.06)], [X(0.45), Y(1.05)]],
    [[X(0.15), Y(1.04)], [X(-0.02), Y(1.0)], [X(-0.14), Y(1.08)]],
  ]);
  const usb = `M${f2(cableStart[0])} ${f2(cableStart[1])} C${f2(cableStart[0] - 30)} ${f2(cableStart[1] + 2)} ${f2(cableStart[0] - 48)} ${f2(cableStart[1] + 22)} ${f2(cableStart[0] - 58)} ${f2(cableStart[1] + 70)}`;

  return {
    vb, lidWalls, lidFace, lidTopEdge, bezelStep, ledge, ledgeFront, glassStep, glass, display, refl, refl2, screenM, lidScrews,
    strap, strapSeams, baseWalls, baseFrontEdge, baseSeam, rimTop, chamfer, chamferEdge, trayWalls, floor, opening, frontClip, baseScrews, shadow,
    plug, plugCap, usb, keys, keyOrder, braid,
  };
}

function sampleChain(p0: P2, segs: [P2, P2, P2][]) {
  const pts: P2[] = [p0];
  let a = p0;
  for (const [c1, c2, b] of segs) {
    for (let i = 1; i <= 40; i++) {
      const t = i / 40, s = 1 - t;
      pts.push([s * s * s * a[0] + 3 * s * s * t * c1[0] + 3 * s * t * t * c2[0] + t * t * t * b[0], s * s * s * a[1] + 3 * s * s * t * c1[1] + 3 * s * t * t * c2[1] + t * t * t * b[1]]);
    }
    a = b;
  }
  const lane = (off: number) => path(pts.map((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1;
    return [p[0] - (dy / l) * off, p[1] + (dx / l) * off] as P2;
  }), false);
  return { core: lane(0), lanes: [-2.9, -1.45, 0, 1.45, 2.9].map(lane), hi: lane(-2.6), lo: lane(3.1) };
}

const M = build();

/* ── components ──────────────────────────────────────────────────────── */

function ScrewG({ s, id }: { s: Screw; id: string }) {
  return (
    <g>
      <path d={s.sink} fill={`url(#${id}-sink)`} />
      <path d={s.head} fill={`url(#${id}-screw)`} stroke="rgba(20,24,34,.5)" strokeWidth={0.4} />
      <path d={s.slot} stroke="rgba(28,32,44,.75)" strokeWidth={0.75} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Key({ k, id, pressed, reduced }: { k: KeyModel; id: string; pressed: boolean; reduced: boolean | null }) {
  const t = useSpring(0, { stiffness: 1100, damping: 26, mass: 0.6 });
  useEffect(() => { if (reduced) t.jump(pressed ? 1 : 0); else t.set(pressed ? 1 : 0); }, [pressed, reduced, t]);
  const x = useTransform(t, (v) => v * k.dx);
  const y = useTransform(t, (v) => v * k.dy);
  const pink = k.tone === "pink";
  return (
    <motion.g style={{ x, y }}>
      {k.skirt.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} strokeLinejoin="round" />)}
      <path d={k.top} fill={k.topFill} />
      {/* the dish: darker toward the back, a soft pool of light toward the front */}
      <path d={k.top} fill={`url(#${id}-dish)`} />
      <path d={k.top} fill={`url(#${id}-${pink ? "pkspot" : "bkspot"})`} />
      <path d={k.topEdge} fill="none" stroke={pink ? "rgba(255,190,222,.55)" : "rgba(255,255,255,.22)"} strokeWidth={0.8} strokeLinecap="round" />
      <g transform={k.labelM}>
        {k.label === "Enter" ? (
          <path d="M8 -9 V2 H-8 M-3 -3.5 L-8.5 2 L-3 7.5" fill="none" stroke="#f1f1f4" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <text x={0} y={10} textAnchor="middle" fill="#f8f4f7" fontSize={29}
            style={{ fontFamily: '"DIN Condensed","DIN Alternate","Barlow Condensed","Roboto Condensed","Arial Narrow",sans-serif', fontWeight: 700 }}>{k.label}</text>
        )}
      </g>
    </motion.g>
  );
}

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const clear = size === "big" ? 170 : h >= 300 ? 150 : 30;
      const side = size === "big" ? Math.min(200, w * 0.14) : h >= 300 ? 110 : 220;
      setS(Math.max(0.2, Math.min((w - side) / M.vb.w, (h - clear) / M.vb.h, size === "big" ? 1.75 : 1)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

export default function MacroPad({ size = "card" }: { size?: "card" | "big" }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const { ref, s: scale } = useFit(size);
  const [pressed, setPressed] = useState<Record<KeyId, boolean>>({ "0": false, "1": false, "2": false, enter: false });
  const [text, setText] = useState<string>(INITIAL);
  const [fresh, setFresh] = useState(true);
  const [ok, setOk] = useState(false);
  const okTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(okTimer.current), []);

  const fire = useCallback((k: KeyId) => {
    play("key");
    window.clearTimeout(okTimer.current);
    if (k === "enter") {
      if (fresh || text === "") { setText(""); setFresh(false); setOk(false); return; }
      setOk(true);
      okTimer.current = window.setTimeout(() => { setOk(false); setText(""); }, 1100);
      return;
    }
    setOk(false);
    setText((cur) => ((fresh ? "" : cur) + k).slice(-MAX));
    setFresh(false);
  }, [fresh, text]);

  const down = (k: KeyId) => { setPressed((p) => (p[k] ? p : { ...p, [k]: true })); };
  const up = (k: KeyId) => { setPressed((p) => (p[k] ? { ...p, [k]: false } : p)); };

  const keyFor = (e: React.KeyboardEvent): KeyId | null =>
    e.key === "0" || e.key === "1" || e.key === "2" ? e.key : e.key === "Enter" ? "enter" : null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = keyFor(e); if (!k) return;
    e.preventDefault();
    if (e.repeat) return;
    down(k); fire(k);
  };
  const onKeyUp = (e: React.KeyboardEvent) => { const k = keyFor(e); if (k) { e.preventDefault(); up(k); } };

  const { vb } = M;
  const W = vb.w * scale, H = vb.h * scale;
  const shown = ok ? "" : text;
  const SCREEN_FONT = 'Futura,"Century Gothic","Avenir Next",Avenir,"Trebuchet MS",sans-serif';

  return (
    <div ref={ref} data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <style>{`
        .mp-dev{outline:none;user-select:none;-webkit-user-select:none;border-radius:24px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .mp-dev:focus-visible{box-shadow:0 0 0 2px #191a19,0 0 0 4px #e0408a}
        .mp-key{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .mp-key:focus{outline:none}
        .mp-caret{animation:mp-blink 1.05s steps(1) infinite}
        @keyframes mp-blink{50%{fill-opacity:0}}
        @media (prefers-reduced-motion: reduce){.mp-caret{animation:none}}
        .mp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
      `}</style>
      <div className="mp-dev" role="group" tabIndex={0} aria-label="Macro pad. Press 0, 1, 2 or Enter."
        onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={() => setPressed({ "0": false, "1": false, "2": false, enter: false })}
        style={{ width: W, height: H, position: "relative" }}>
        <svg viewBox={`${f2(vb.x)} ${f2(vb.y)} ${f2(vb.w)} ${f2(vb.h)}`} width={W} height={H} style={{ display: "block", overflow: "visible" }} aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-screw`} cx=".36" cy=".3" r=".85">
              <stop offset="0" stopColor="#f2f5fb" /><stop offset=".45" stopColor="#aab2c6" /><stop offset="1" stopColor="#5b6378" />
            </radialGradient>
            <radialGradient id={`${id}-sink`} cx=".5" cy=".62" r=".6">
              <stop offset=".55" stopColor="#3b4256" /><stop offset="1" stopColor="#8f98b1" />
            </radialGradient>
            <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2=".25">
              <stop offset="0" stopColor="#fff" stopOpacity=".12" /><stop offset=".35" stopColor="#fff" stopOpacity=".02" /><stop offset=".7" stopColor="#000" stopOpacity=".05" /><stop offset="1" stopColor="#000" stopOpacity=".2" />
            </linearGradient>
            <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0c0e13" /><stop offset="1" stopColor="#050609" />
            </linearGradient>
            <linearGradient id={`${id}-display`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#11141b" /><stop offset=".6" stopColor="#090a0e" /><stop offset="1" stopColor="#0c0e13" />
            </linearGradient>
            <linearGradient id={`${id}-refl`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#dfe6ff" stopOpacity="0" /><stop offset=".5" stopColor="#dfe6ff" stopOpacity=".07" /><stop offset="1" stopColor="#dfe6ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#07080b" /><stop offset="1" stopColor="#14171e" />
            </linearGradient>
            <linearGradient id={`${id}-dish`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity=".26" /><stop offset=".55" stopColor="#000" stopOpacity=".04" /><stop offset="1" stopColor="#fff" stopOpacity=".06" />
            </linearGradient>
            <radialGradient id={`${id}-pkspot`} cx=".4" cy=".72" r=".6">
              <stop offset="0" stopColor="#ff9cc8" stopOpacity=".28" /><stop offset="1" stopColor="#ff9cc8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-bkspot`} cx=".4" cy=".72" r=".6">
              <stop offset="0" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <pattern id={`${id}-weave`} width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
              <rect width="3.2" height="3.2" fill="#25272e" /><rect width="1.6" height="1.6" fill="#3d4049" /><rect x="1.6" y="1.6" width="1.6" height="1.6" fill="#33363e" />
            </pattern>
            <linearGradient id={`${id}-strapShade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity=".65" /><stop offset=".55" stopColor="#000" stopOpacity=".1" /><stop offset="1" stopColor="#000" stopOpacity=".45" />
            </linearGradient>
            <radialGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" cx={vb.x + vb.w / 2} cy={vb.y + vb.h / 2} r={Math.max(vb.w, vb.h) * 0.66}>
              <stop offset=".72" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={`${id}-cablemask`} maskUnits="userSpaceOnUse" x={vb.x - vb.w} y={vb.y - vb.h} width={vb.w * 3} height={vb.h * 3}>
              <rect x={vb.x - vb.w} y={vb.y - vb.h} width={vb.w * 3} height={vb.h * 3} fill={`url(#${id}-fade)`} />
            </mask>
            <filter id={`${id}-blur10`} x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
            <filter id={`${id}-blur3`} x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id={`${id}-glow`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="1.6" /></filter>
            <clipPath id={`${id}-opening`}><path d={M.opening} /></clipPath>
            <clipPath id={`${id}-front`}><path d={M.frontClip} /></clipPath>
            <clipPath id={`${id}-glassclip`}><path d={M.glass} /></clipPath>
          </defs>

          {/* braided cable, behind everything */}
          <g mask={`url(#${id}-cablemask)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={M.braid.core} stroke="#000" strokeOpacity={0.5} strokeWidth={12} transform="translate(0 4)" filter={`url(#${id}-blur3)`} />
            <path d={M.braid.core} stroke="#3e0420" strokeWidth={9.4} />
            {M.braid.lanes.map((d, j) => (
              <g key={j}>
                <path d={d} stroke="#a3205e" strokeWidth={1.9} strokeDasharray="2.4 2.4" strokeDashoffset={j * 0.95} strokeLinecap="butt" />
                <path d={d} stroke="#6c0d3b" strokeWidth={1.9} strokeDasharray="1.2 3.6" strokeDashoffset={j * 0.95 + 2.6} strokeLinecap="butt" />
              </g>
            ))}
            <path d={M.braid.hi} stroke="#ff9ccb" strokeOpacity={0.22} strokeWidth={1.3} />
            <path d={M.braid.lo} stroke="#1c010d" strokeOpacity={0.7} strokeWidth={1.6} />
          </g>

          {/* soft contact shadow */}
          <path d={M.shadow} fill="rgba(0,0,0,.85)" filter={`url(#${id}-blur10)`} transform="translate(0 10)" />
          <path d={M.shadow} fill="rgba(0,0,0,.9)" filter={`url(#${id}-blur3)`} transform="translate(0 3)" />

          {/* fabric strap hinge */}
          <path d={M.strap} fill={`url(#${id}-weave)`} />
          <path d={M.strap} fill={`url(#${id}-strapShade)`} />
          {M.strapSeams.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={0.7} strokeDasharray="1.4 1.2" />)}

          {/* lid */}
          {M.lidWalls.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} strokeLinejoin="round" />)}
          <path d={M.lidFace.d} fill={M.lidFace.fill} fillRule="evenodd" />
          <path d={M.lidFace.d} fill={`url(#${id}-sweep)`} fillRule="evenodd" />
          <path d={M.lidTopEdge} fill="none" stroke="rgba(235,242,255,.7)" strokeWidth={0.9} strokeLinecap="round" />
          {M.bezelStep.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} />)}
          <path d={M.ledge.d} fill={M.ledge.fill} fillRule="evenodd" />
          <path d={M.ledge.d} fill="rgba(20,26,44,.16)" fillRule="evenodd" />
          <path d={M.ledgeFront} fill="none" stroke="rgba(235,242,255,.4)" strokeWidth={0.7} />
          {M.glassStep.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} />)}
          <path d={M.glass} fill={`url(#${id}-glass)`} />
          <path d={M.display} fill={`url(#${id}-display)`} />
          <g clipPath={`url(#${id}-glassclip)`}>
            <path d={M.refl} fill={`url(#${id}-refl)`} />
            <path d={M.refl2} fill="#dfe6ff" fillOpacity={0.025} />
          </g>
          {M.lidScrews.map((s, i) => <ScrewG key={i} s={s} id={id} />)}

          {/* the screen text, laid onto the tilted glass */}
          <g transform={M.screenM}>
            {ok ? (
              <motion.g key="ok" initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 24 }}>
                <text x={0} y={0} dominantBaseline="central" textAnchor="middle" fontSize={30} fill="#f3f4f7" style={{ fontFamily: SCREEN_FONT, fontWeight: 500, letterSpacing: "0.02em" }}>
                  <tspan fill="#ff4f9c">{"✓ "}</tspan>Sent {text}
                </text>
              </motion.g>
            ) : (
              <g>
                <text x={0} y={0} dominantBaseline="central" textAnchor="middle" fontSize={33} fill="#fff" opacity={0.5} filter={`url(#${id}-glow)`}
                  style={{ fontFamily: SCREEN_FONT, fontWeight: 500, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums lining-nums" }}>{shown || " "}{!fresh && <tspan fillOpacity={0} fontWeight={300} dx={2}>|</tspan>}</text>
                <text x={0} y={0} dominantBaseline="central" textAnchor="middle" fontSize={33} fill="#f6f7fa"
                  style={{ fontFamily: SCREEN_FONT, fontWeight: 500, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums lining-nums" }}>
                  {shown}
                  {!fresh && <tspan className="mp-caret" fill="#ff4f9c" fontWeight={300} dx={2}>|</tspan>}
                </text>
              </g>
            )}
          </g>

          {/* base */}
          {M.baseWalls.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} strokeLinejoin="round" />)}
          <path d={M.baseSeam} fill="none" stroke="rgba(18,22,34,.35)" strokeWidth={0.7} />
          <path d={M.baseFrontEdge} fill="none" stroke="rgba(235,242,255,.75)" strokeWidth={0.9} strokeLinecap="round" />
          <g>
            <path d={M.rimTop.d} fill={M.rimTop.fill} fillRule="evenodd" />
            <path d={M.rimTop.d} fill={`url(#${id}-sweep)`} fillRule="evenodd" />
            {M.chamfer.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} />)}
          </g>
          {/* the tray: floor, shaded inner walls, switches */}
          <g clipPath={`url(#${id}-opening)`}>
            <path d={M.floor} fill={`url(#${id}-floor)`} />
            {M.trayWalls.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} />)}
            {M.keyOrder.map((k) => (
              <g key={k.id}>
                {k.housing.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.4} />)}
                <path d={k.housingTop.d} fill={k.housingTop.fill} />
                {k.vents.map((d, i) => <path key={i} d={d} fill="#010102" stroke="rgba(255,255,255,.07)" strokeWidth={0.4} />)}
              </g>
            ))}
          </g>
          {M.keyOrder.map((k) => <Key key={k.id} k={k} id={id} pressed={pressed[k.id]} reduced={reduced} />)}
          {/* the front of the rim, again, over the key skirts */}
          <g clipPath={`url(#${id}-front)`}>
            <path d={M.rimTop.d} fill={M.rimTop.fill} fillRule="evenodd" />
            <path d={M.rimTop.d} fill={`url(#${id}-sweep)`} fillRule="evenodd" />
            {M.chamfer.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} />)}
          </g>
          <path d={M.chamferEdge} fill="none" stroke="rgba(10,12,18,.5)" strokeWidth={0.6} />
          {M.baseScrews.map((s, i) => <ScrewG key={i} s={s} id={id} />)}

          {/* USB-C plug and its cable */}
          <g mask={`url(#${id}-cablemask)`} fill="none" strokeLinecap="round">
            <path d={M.usb} stroke="#030304" strokeWidth={10.5} />
            <path d={M.usb} stroke="rgba(255,255,255,.14)" strokeWidth={1.2} transform="translate(-1.6 -2.2)" />
          </g>
          {M.plug.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth={0.5} strokeLinejoin="round" />)}
          <path d={M.plugCap.d} fill={M.plugCap.fill} />
        </svg>

        <div className="mp-sr" aria-live="polite">{ok ? `Sent ${text}` : text}</div>

        {/* hit areas for the keys, shaped to each cap's outline */}
        {M.keys.map((k) => {
          const xs = k.hit.map((p) => (p[0] - vb.x) * scale), ys = k.hit.map((p) => (p[1] - vb.y) * scale);
          const l = Math.min(...xs), t = Math.min(...ys), r = Math.max(...xs), b = Math.max(...ys);
          const poly = xs.map((x, i) => `${(x - l).toFixed(1)}px ${(ys[i] - t).toFixed(1)}px`).join(",");
          return (
            <button key={k.id} type="button" className="mp-key" tabIndex={-1} aria-label={k.label}
              onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); down(k.id); fire(k.id); }}
              onPointerUp={() => up(k.id)} onPointerCancel={() => up(k.id)} onLostPointerCapture={() => up(k.id)}
              onClick={(e) => { if (e.detail === 0) { fire(k.id); } }}
              style={{ position: "absolute", left: l, top: t, width: r - l, height: b - t, padding: 0, border: 0, background: "transparent", clipPath: `polygon(${poly})` }} />
          );
        })}
      </div>
    </div>
  );
}
