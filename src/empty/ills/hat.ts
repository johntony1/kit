// No accessories yet: a wide brimmed hat with a band. Hover and it hops up and tips to one side, as if lifted in greeting.
import { type Illustration, type Pen, type V3 } from "../dots";

type Q = { d: number; pts: V3[]; f: number };
const S = Math.SQRT1_2;
/** a place given as across (screen right), near (towards us) and up */
const at = (e: number, n: number, z: number): V3 => [(e + n) * S, (n - e) * S, z];
const tone3 = (n: V3) => (n[2] > 0.45 ? 0.22 : n[1] >= n[0] ? 0.13 : 0.065);
/** a turned shape with an oval section: rings of [height, half width across, half width near] from the bottom up */
function turned(out: Q[], c: V3, rough: [number, number, number][], yaw = 0, tone: (n: V3) => number = tone3, nu = 40) {
  const prof = [rough[0]];
  for (let j = 1; j < rough.length; j++) {
    const a = rough[j - 1], b = rough[j], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], Math.max(Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]))) / 1.3));
    for (let s = 1; s <= n; s++) prof.push([a[0] + ((b[0] - a[0]) * s) / n, a[1] + ((b[1] - a[1]) * s) / n, a[2] + ((b[2] - a[2]) * s) / n]);
  }
  const cs = Math.cos(yaw), sn = Math.sin(yaw);
  const turn = (a: number, b: number, z: number) => at(a * cs - b * sn, a * sn + b * cs, z);
  const P = (u: number, k: number): V3 => { const q = turn(Math.cos(u) * prof[k][1], Math.sin(u) * prof[k][2], prof[k][0]); return [c[0] + q[0], c[1] + q[1], c[2] + q[2]]; };
  for (let k = 0; k < prof.length - 1; k++) for (let i = 0; i < nu; i++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2, um = (u0 + u1) / 2, lo = prof[k], hi = prof[k + 1];
    const hx = Math.cos(um) * (lo[2] + hi[2]), hy = Math.sin(um) * (lo[1] + hi[1]), hl = Math.hypot(hx, hy) || 1;
    const dr = (hi[1] - lo[1]) * Math.cos(um) ** 2 + (hi[2] - lo[2]) * Math.sin(um) ** 2, dz = hi[0] - lo[0], L = Math.hypot(dz, dr) || 1;
    const n = turn((hx / hl) * (dz / L), (hy / hl) * (dz / L), -dr / L);
    if (n[0] + n[1] + n[2] < -0.3) continue; // faces away from us
    const pts = [P(u0, k), P(u1, k), P(u1, k + 1), P(u0, k + 1)];
    const m = [0, 1, 2].map((e) => (pts[0][e] + pts[1][e] + pts[2][e] + pts[3][e]) / 4);
    out.push({ d: m[0] + m[1] + m[2], f: tone(n), pts: pts.map((q) => q.map((x, e) => m[e] + (x - m[e]) * 1.12) as V3) });
  }
}
const paint = (p: Pen, qs: Q[]) => qs.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));

const BR = 16.5; // the brim's radius

export const hat: Illustration = {
  k: "hat", name: "Hat", title: "No accessories yet", body: "Hats, bags and belts you add will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // it hops up past its rest and settles with a little bounce, then bobs while hovered
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 8.5 * back(h) + h * Math.sin(t * 3) * 0.7, tip = h * (0.3 + Math.sin(t * 3 + 0.8) * 0.04);
    p.translate(0, 0, -8 - 2.5 * h);
    p.shadow(0, 0, 30 - 5 * h, 15 - 2.5 * h, 0.12 - 0.04 * h);
    p.translate(0, 0, lift);
    p.rotate("z", -Math.PI / 4); p.rotate("y", tip, [0, 0, 0]); p.rotate("z", Math.PI / 4);
    // the brim: a wide thin round, with a cut where it meets the crown
    p.cylinder(0, 0, 0, BR, 1.1, { side: 0.1, top: 0.2, lw: 0.6 });
    const q: Q[] = [];
    // the crown, a little narrower at the top, and the band round its foot
    turned(q, [0, 0, 1.1], [[0, 9.2, 9.2], [3.2, 9.1, 9.1], [3.2, 8.6, 8.6], [8.6, 7.7, 7.7], [10.2, 6.6, 6.6], [10.9, 4.6, 4.6], [11, 0, 0]], 0, (n) => (n[2] > 0.45 ? 0.3 : n[1] >= n[0] ? 0.22 : 0.13), 44);
    paint(p, q);
    const ring = (r: number, z: number): V3[] => Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
    // the band: a dark strip round the foot of the crown, parting it from the brim
    const lo = ring(9.25, 1.2).slice(35).concat(ring(9.25, 1.2).slice(0, 16)), hi = ring(9.15, 4.3).slice(35).concat(ring(9.15, 4.3).slice(0, 16));
    p.clear([...lo, ...hi.reverse()]);
    // the dent in the top
    p.face(ring(4, 12.12).map(([x, y, z]) => [x * 1.25 + y * 0.25, y * 1.25 + x * 0.25, z] as V3), 0.08, 0);
  },
};
