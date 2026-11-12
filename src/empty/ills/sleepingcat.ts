// Nothing to do right now: a cat curled up asleep, its tail wrapped round to its chin. It breathes slowly and z marks drift up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";


const P = 3.6; // seconds per loop
const ROT = -Math.PI / 4, CR = Math.cos(ROT), SR = Math.sin(ROT); // turned to face us: x runs across the screen
const world = (n: V3): V3 => [n[0] * CR - n[1] * SR, n[0] * SR + n[1] * CR, n[2]];
type Q = { d: number; pts: V3[]; f: number };
type Tone = [number, number, number]; // lit top, left, right

/** an ellipsoid as small quads, each in one of the three face tones */
function blob(out: Q[], c: V3, r: V3, f: Tone, nu: number, nv: number) {
  const at = (u: number, v: number): V3 => [c[0] + r[0] * Math.cos(v) * Math.cos(u), c[1] + r[1] * Math.cos(v) * Math.sin(u), c[2] + r[2] * Math.sin(v)];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2, v0 = -Math.PI / 2 + (j / nv) * Math.PI, v1 = -Math.PI / 2 + ((j + 1) / nv) * Math.PI;
    const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    const n: V3 = [(Math.cos(vm) * Math.cos(um)) / r[0], (Math.cos(vm) * Math.sin(um)) / r[1], Math.sin(vm) / r[2]];
    const l = Math.hypot(n[0], n[1], n[2]), w = world([n[0] / l, n[1] / l, n[2] / l]);
    if (w[0] + w[1] + w[2] < -0.05) continue; // faces away from us
    const m = at(um, vm), mw = world(m);
    const pts = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((q) => q.map((x, k) => m[k] + (x - m[k]) * 1.1) as V3);
    out.push({ d: mw[0] + mw[1] + mw[2], pts, f: w[2] > 0.5 ? f[0] : w[1] >= w[0] - 0.25 ? f[1] : f[2] });
  }
}
// a z mark, flat to the screen
const zed = (p: Pen, at: V3, s: number, v: number) => {
  if (v <= 0.03) return;
  const [x, y] = p.pt(at), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = Math.max(0.7, s * 0.32); g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y - s); g.lineTo(x - s, y + s); g.lineTo(x + s, y + s); g.stroke(); });
};
const BC: V3 = [2, -1.5, 7], RX = 13, RY = 9.5; // the body: centre, half length, half depth
const HC: V3 = [-10.5, 5.5, 6.6], HR = 6.6; // the head

export const sleepingcat: Illustration = {
  k: "sleepingcat", name: "Sleeping cat", title: "Nothing to do right now", body: "You are all caught up. New tasks will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, br = Math.sin(u * Math.PI * 2);
    p.translate(-1, -1, -12);
    p.shadow(0, 2, 26, 12.5, 0.12);
    p.rotate("z", ROT);
    const RZ = 6.6 + 0.5 * br;
    const q: Q[] = [];
    // the body, rising and falling as it breathes
    blob(q, [BC[0], BC[1], RZ], [RX, RY, RZ], [0.17, 0.1, 0.055], 40, 20);
    // the tail, wrapped round the front
    for (let i = 0; i < 15; i++) { const a = -0.45 + (i / 14) * 1.75; blob(q, [BC[0] + Math.cos(a) * 13.4, BC[1] + Math.sin(a) * 10.8, 2.1], [2.1, 2.1, 2.1], [0.3, 0.2, 0.1], 10, 6); }
    // the head, resting on the floor
    blob(q, HC, [HR, HR, HR * 0.92], [0.36, 0.3, 0.17], 28, 14);
    q.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
    // ears
    const ez = HC[2] + HR * 0.92;
    for (const s of [-1, 1]) {
      const e: V3[] = [[HC[0] + s * 5.6, HC[1], ez - 3.4], [HC[0] + s * 1.3, HC[1], ez - 0.4], [HC[0] + s * 5.4, HC[1], ez + 4.2]];
      p.face(e, s < 0 ? 0.4 : 0.3, SH.edge, 0.7);
    }
    // closed eyes and a nose, cut into the face
    const fy = HC[1] + HR + 0.02;
    for (const s of [-1, 1]) p.line(Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (1.15 + (i / 6) * 0.7); return [HC[0] + s * 2.7 + Math.cos(a) * 1.7, fy - 0.5, HC[2] + 1.9 + Math.sin(a) * 1.7] as V3; }), SH.edge, 1);
    p.dot([HC[0], fy, HC[2] - 1.6], 0.8, 0);
    // stripes over the back
    for (const x of [3, 8]) {
      const k = Math.sqrt(1 - (x / RX) * (x / RX)) * 1.01;
      p.line(Array.from({ length: 10 }, (_, i) => { const a = 0.95 + (i / 9) * 0.8; return [BC[0] + x, BC[1] + RY * k * Math.cos(a), RZ + RZ * k * Math.sin(a)] as V3; }), SH.edge, 0.6);
    }
    // z marks drifting up from the head
    for (let i = 0; i < 2; i++) { const f = (u + i / 2) % 1; zed(p, [HC[0] + 2 + 9 * f, HC[1], 20 + 12 * f], 1.6 + 2 * f, Math.sin(f * Math.PI)); }
  },
};
