// No drinks ordered: a cup of bubble tea with a domed lid and a fat straw, dark pearls at the bottom. The pearls swirl slowly round the cup and the straw bobs, over and over.
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
const P = 3.6, S2 = Math.SQRT1_2; // seconds per loop
const RB = 8.6, RT = 11, HC = 23; // cup radius at the bottom and top, height
const cupR = (z: number) => RB + ((RT - RB) * z) / HC;
const tea = (n: V3) => (n[1] > n[0] ? 0.2 : 0.11);
const NP = 7; // pearls in a ring

export const boba: Illustration = {
  k: "boba", name: "Bubble tea", title: "No drinks ordered", body: "Drinks you order will show up here while they are being made.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, L: Q[] = [];
    p.translate(0, 0, -20);
    p.scale(1.12);
    p.shadow(0, 0, 22, 11, 0.12);
    // the straw's line: out of the top of the dome, leaning left
    const bob = Math.sin(ph * TAU) * 0.8;
    const s0: V3 = [-1, 1, HC + 6.6 + bob], s1: V3 = [-5.5, 5.5, HC + 18 + bob];
    const SC = (u: number): V3 => [s0[0] + (s1[0] - s0[0]) * u, s0[1] + (s1[1] - s0[1]) * u, s0[2] + (s1[2] - s0[2]) * u];
    // the cup: tea in a clear cup, a band of pearls at the bottom
    surf(L, 12, 64, (u, v) => { const z = u * HC, r = cupR(z), w = v * TAU; return [Math.cos(w) * r, Math.sin(w) * r, z]; }, (u) => [0, 0, u * HC], tea);
    flush(p, L);
    // the pearls: dark balls against the tea, two rings turning round the cup
    for (let ring = 0; ring < 2; ring++) for (let i = 0; i < NP; i++) {
      const a = ((i + ph * (ring ? -1 : 1)) / NP) * TAU + ring * 0.45, z = 2.2 + ring * 3.2;
      const face = Math.cos(a - Math.PI / 4);
      if (face < 0.1) continue;
      const r = cupR(z) + 0.1;
      p.dot([Math.cos(a) * r, Math.sin(a) * r, z], 1.55 * (0.6 + 0.4 * face), 0);
    }
    // a line where the tea meets the clear top of the cup
    p.line(Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 4 + (i / 24) * Math.PI, r = cupR(HC - 3.5) + 0.05; return [Math.cos(a) * r, Math.sin(a) * r, HC - 3.5] as V3; }), 1, 0.7);
    // the rim and the dome lid
    surf(L, 2, 64, (u, v) => { const w = v * TAU, r = RT + 0.5; return [Math.cos(w) * r, Math.sin(w) * r, HC - 0.4 + u * 1.4]; }, () => [0, 0, HC], () => 0.3);
    flush(p, L);
    surf(L, 10, 64, (u, v) => { const b = (u * Math.PI) / 2, w = v * TAU, r = RT * Math.cos(b); return [Math.cos(w) * r, Math.sin(w) * r, HC + 1 + 6.5 * Math.sin(b)]; }, (u) => [0, 0, HC + 1 + 6.5 * Math.sin((u * Math.PI) / 2) - 1], (n) => (n[2] > 0.6 ? 0.12 : n[1] > n[0] ? 0.075 : 0.05));
    flush(p, L);
    // the straw: a fat tube through the lid, cut at a slant on top
    surf(L, 14, 16, (u, v) => { const c = SC(u), w = v * TAU, r = 1.8; return [c[0] + Math.cos(w) * r * S2 - Math.sin(w) * r * 0.657, c[1] + Math.cos(w) * r * S2 + Math.sin(w) * r * 0.657, c[2] - Math.sin(w) * r * 0.369]; }, (u) => SC(u), (n) => (n[2] > 0.6 ? 0.4 : n[1] > n[0] ? 0.3 : 0.18));
    flush(p, L);
    p.dot(s1, 1.2, 0);
  },
};
