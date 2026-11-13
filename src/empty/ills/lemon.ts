// Nothing squeezed: a whole lemon lying on its side. Hover and it splits, the near half sliding away to show the cut face with its segments.
import { type Illustration, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const TAU = Math.PI * 2;
const tone3 = (n: V3) => (n[2] > 0.6 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065);
/** a gridded surface P(u, v); O(u, v) lies inside it so normals point out. Quads facing us go into L */
function surf(L: Q[], nu: number, nv: number, P: (u: number, v: number) => V3, O: (u: number, v: number) => V3, tone: (n: V3) => number = tone3) {
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = i / nu, u1 = (i + 1) / nu, v0 = j / nv, v1 = (j + 1) / nv;
    const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
    const e = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], g = [d[0] - b[0], d[1] - b[1], d[2] - b[2]];
    const n: V3 = [e[1] * g[2] - e[2] * g[1], e[2] * g[0] - e[0] * g[2], e[0] * g[1] - e[1] * g[0]];
    const m: V3 = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4], o = O((u0 + u1) / 2, (v0 + v1) / 2);
    const l = Math.hypot(n[0], n[1], n[2]) || 1, s = ((m[0] - o[0]) * n[0] + (m[1] - o[1]) * n[1] + (m[2] - o[2]) * n[2] < 0 ? -1 : 1) / l;
    const k: V3 = [n[0] * s, n[1] * s, n[2] * s];
    if (k[0] + k[1] + k[2] <= 0.01) continue;
    const grow = (v: V3): V3 => [m[0] + (v[0] - m[0]) * 1.1, m[1] + (v[1] - m[1]) * 1.1, m[2] + (v[2] - m[2]) * 1.1];
    L.push({ q: [a, b, c, d].map(grow), f: tone(k), d: m[0] + m[1] + m[2] });
  }
}
const flush = (p: { face: (q: V3[], f: number, e?: number) => void }, L: Q[]) => { L.sort((x, y) => x.d - y.d).forEach((k) => p.face(k.q, k.f, 0)); L.length = 0; };
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const A = 13.5, RL = 9.6; // half length, radius
/** the lemon's radius at x: a fat oval with a nub at each end */
const rad = (x: number) => { const s = Math.min(1, Math.abs(x) / A); return RL * Math.sqrt(Math.max(0, 1 - Math.pow(s, 2.4))) + (s > 0.82 ? 1.3 * Math.sin(((s - 0.82) / 0.18) * Math.PI) * (1 - s) * 5 : 0); };
const rind = (n: V3) => (n[2] > 0.6 ? 0.22 : n[1] > n[0] ? 0.12 : 0.065);

export const lemon: Illustration = {
  k: "lemon", name: "Lemon", title: "Nothing squeezed", body: "Fresh juices you order will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L: Q[] = [], k = ease(h / 0.75), gap = 9 * k, zc = RL;
    p.translate(-3, -3, -9);
    p.scale(1.3);
    p.shadow(gap / 2, 0, 24 + gap * 0.6, 12, 0.12);
    // the lemon's axis runs along x (down to the right on the screen)
    const half = (x0: number, x1: number, dx: number, tilt: number) => surf(L, 26, 48, (u, v) => {
      const x = x0 + (x1 - x0) * u, w = v * TAU, r = rad(x) + 0.001;
      const y = Math.cos(w) * r, z = Math.sin(w) * r;
      return [x + dx - z * tilt, y, zc + z + x * tilt];
    }, (u) => { const x = x0 + (x1 - x0) * u; return [x + dx, 0, zc + x * tilt]; }, rind);
    // the far half
    half(-A, 0, 0, 0); flush(p, L);
    // its cut face: rind, pith ring and the segments, seen once the near half moves off
    if (k > 0.02) {
      const disc = (r: number): V3[] => Array.from({ length: 48 }, (_, i) => { const w = (i / 48) * TAU; return [0.02, Math.cos(w) * r, zc + Math.sin(w) * r]; });
      p.face(disc(RL), 0.2, 0);
      p.face(disc(RL - 1.1), 0.45, 0);
      for (let i = 0; i < 9; i++) { const w = (i / 9) * TAU + 0.2; p.line([[0.04, Math.cos(w) * 1.1, zc + Math.sin(w) * 1.1], [0.04, Math.cos(w) * (RL - 1.6), zc + Math.sin(w) * (RL - 1.6)]], 1, 0.9); }
      p.line(disc(RL - 1.1).concat([disc(RL - 1.1)[0]]).map(([x, y, z]) => [x + 0.02, y, z] as V3), 1, 0.6);
      p.dot([0.05, 0, zc], 1, 0);
    }
    // the near half slides off and rocks back a little
    half(0, A, gap, 0.1 * k + (h > 0.75 ? Math.sin(t * 3) * 0.02 * h : 0)); flush(p, L);
    // a highlight on the rind
    p.dot([-A * 0.35, RL * 0.35, zc + RL * 0.85], 1, 0.6);
  },
};
