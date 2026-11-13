// No snacks yet: a big salted pretzel, its two ends twisted and folded back over the loop. It sways gently from side to side and bobs.
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
const P = 3.4; // seconds per loop
/** the strand's path in the pretzel's own plane: [across, up, lift] */
const PATH: [number, number, number][] = [
  [-8.6, 1.6, 1.6], [-4, -1.6, 1.4], [0, -4.6, 1.2], [4.5, -8.4, 0], [9.5, -5, 0], [11.6, 2, 0], [9, 9.6, 0], [3, 10.6, 0], [0, 7.6, 0],
  [-3, 10.6, 0], [-9, 9.6, 0], [-11.6, 2, 0], [-9.5, -5, 0], [-4.5, -8.4, 0], [0, -4.6, -1.2], [4, -1.6, 1.4], [8.6, 1.6, 1.6],
];
/** a smooth open curve through PATH (Catmull Rom) */
const along = (u: number): [number, number, number] => {
  const n = PATH.length - 1, x = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(x), t = x - i;
  const q = (k: number) => PATH[Math.min(n, Math.max(0, k))];
  const a = q(i - 1), b = q(i), c = q(i + 1), d = q(i + 2);
  return [0, 1, 2].map((j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t)) as [number, number, number];
};
const bake = (n: V3) => (n[2] > 0.7 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065);

export const pretzel: Illustration = {
  k: "pretzel", name: "Pretzel", title: "No snacks yet", body: "Snacks you add to your order will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, turn = 0.22 * Math.sin(ph * TAU), bob = Math.sin(ph * TAU * 2) * 0.8, L: Q[] = [];
    p.translate(0, 0, -16);
    p.scale(1.45);
    p.shadow(0, 0, 18, 8, 0.12);
    // the pretzel stands leaning back a little, turned by `turn` about the upright
    const lean = 0.5, cl = Math.cos(lean), sl = Math.sin(lean), ct = Math.cos(turn - Math.PI / 4), st = Math.sin(turn - Math.PI / 4);
    const W = (a: number, b: number, f: number): V3 => {
      const fw = -b * sl + f * cl, z = 12 + bob + b * cl + f * sl; // f: out of the plane, toward us
      return [a * ct - fw * st, a * st + fw * ct, z];
    };
    const R = (u: number) => 2.35 * Math.min(1, Math.sqrt(Math.min(u, 1 - u) / 0.012));
    const C = (u: number): V3 => { const [a, b, f] = along(u); return W(a, b, f); };
    surf(L, 220, 12, (u, v) => {
      const [a, b, f] = along(u), [a2, b2] = along(Math.min(1, u + 0.003)), [a1, b1] = along(Math.max(0, u - 0.003));
      const ta = a2 - a1, tb = b2 - b1, l = Math.hypot(ta, tb) || 1, w = v * TAU, r = R(u);
      return W(a - (tb / l) * Math.cos(w) * r, b + (ta / l) * Math.cos(w) * r, f + Math.sin(w) * r);
    }, C, bake);
    flush(p, L);
    // salt: bright grains on the parts that face up toward us
    for (let i = 0; i < 26; i++) {
      const u = 0.03 + (i / 26) * 0.94 + 0.011 * Math.sin(i * 7), w = 1.1 + 0.5 * Math.sin(i * 3.3);
      const [a, b, f] = along(u), [a2, b2] = along(u + 0.003), ta = a2 - a, tb = b2 - b, l = Math.hypot(ta, tb) || 1, r = R(u) + 0.15;
      p.dot(W(a - (tb / l) * Math.cos(w) * r, b + (ta / l) * Math.cos(w) * r, f + Math.sin(w) * r), 0.55, 1);
    }
  },
};
