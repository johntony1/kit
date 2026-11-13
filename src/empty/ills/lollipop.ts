// No treats yet: a big swirl lollipop on a white stick, a bow tied under it. The swirl turns round and round and the lollipop sways a little.
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
const S2 = Math.SQRT1_2, P = 3.2; // seconds per loop
const RD = 12.5, TH = 2.6, ZC = 25; // disc radius, thickness, centre height

export const lollipop: Illustration = {
  k: "lollipop", name: "Lollipop", title: "No treats yet", body: "Sweets you add to your order will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, sway = 0.12 * Math.sin(ph * TAU), L: Q[] = [];
    p.translate(0, 0, -20);
    p.scale(1.12);
    p.shadow(0, 0, 12, 6, 0.12);
    // everything hangs off the foot of the stick and leans with the sway
    const at = (a: number, b: number, f = 0): V3 => { const c = Math.cos(sway), s = Math.sin(sway), u = a * c + b * s, z = -a * s + b * c; return [u * S2 + f * S2, -u * S2 + f * S2, z]; };
    // the stick
    surf(L, 12, 12, (u, v) => { const w = v * TAU, z = u * (ZC - 2); const c = at(0, z), n = at(1.1 * Math.cos(w), 0, 1.1 * Math.sin(w)); const o = at(0, 0); return [c[0] + n[0] - o[0], c[1] + n[1] - o[1], c[2] + n[2] - o[2]]; }, (u) => at(0, u * (ZC - 2)), (n) => (n[2] > 0.5 ? 0.3 : n[0] + n[1] > 0.3 ? 0.22 : 0.1));
    flush(p, L);
    // the disc: a thick round, its rim first, then the face with the swirl
    surf(L, 2, 72, (u, v) => { const w = v * TAU; return at(Math.cos(w) * RD, ZC + Math.sin(w) * RD, TH * (u - 0.5)); }, () => at(0, ZC, 0), (n) => (n[2] > 0.4 ? 0.22 : n[1] > n[0] ? 0.12 : 0.065));
    flush(p, L);
    p.face(Array.from({ length: 72 }, (_, i) => { const w = (i / 72) * TAU; return at(Math.cos(w) * RD, ZC + Math.sin(w) * RD, TH / 2); }), 0.3, 0);
    // the swirl: two arms winding out from the middle, turning
    const spin = -ph * TAU;
    for (const k of [0, Math.PI]) {
      p.line(Array.from({ length: 70 }, (_, i) => { const s = i / 69, r = 0.6 + s * (RD - 1.6), w = spin + k + s * Math.PI * 3.2; return at(Math.cos(w) * r, ZC + Math.sin(w) * r, TH / 2 + 0.05); }), 1, 1.5);
    }
    p.dot(at(0, ZC, TH / 2 + 0.1), 1, 0);
    // a bow at the top of the stick: two loops and a knot
    const bz = ZC - RD - 1.6;
    for (const sd of [-1, 1]) p.face([at(0, bz, TH / 2 + 0.4), at(sd * 5.4, bz + 2.6, TH / 2 + 0.4), at(sd * 5.8, bz - 2, TH / 2 + 0.4)], 0.2, 0);
    for (const sd of [-1, 1]) p.face([at(sd * 0.6, bz, TH / 2 + 0.5), at(sd * 2.6, bz - 5, TH / 2 + 0.5), at(sd * 0.6, bz - 4.4, TH / 2 + 0.5)], 0.14, 0);
    p.dot(at(0, bz, TH / 2 + 0.6), 1.3, 0.35);
  },
};
