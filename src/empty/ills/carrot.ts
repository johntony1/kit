// No veg yet: a big carrot lying on its side, ridged, with a tuft of leaves. Hover and it hops up and lands with a little bounce, its leaves waving.
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
/** u along the carrot (tip toward us, down to the left), f across it, z up */
const CA = Math.cos(Math.PI / 2 + 0.25), SA = Math.sin(Math.PI / 2 + 0.25);
const at = (u: number, f: number, z: number): V3 => [u * CA - f * SA, u * SA + f * CA, z];
const LEN = 30, RC = 6.4; // length and radius at the crown
/** radius at u (0 at the crown, 1 at the tip): a rounded shoulder, then a long taper to a blunt point */
const rad = (u: number) => (u < 0.08 ? RC * Math.sqrt(Math.sin((u / 0.08) * Math.PI / 2)) : RC * Math.pow(1 - (u - 0.08) / 0.92, 0.85) * 0.97 + 0.25);
/** the axis sinks toward the tip so the carrot lies on the floor */
const zc = (u: number) => RC * 0.35 + rad(u) * 0.65;
const skin = (n: V3) => (n[2] > 0.6 ? 0.22 : n[1] > n[0] ? 0.12 : 0.065);
/** the hop: up and down, a smaller bounce, rest */
const hop = (k: number) => (k <= 0 ? 0 : k < 0.55 ? 9 * Math.sin((k / 0.55) * Math.PI) : k < 0.8 ? 2 * Math.sin(((k - 0.55) / 0.25) * Math.PI) : 0);

export const carrot: Illustration = {
  k: "carrot", name: "Carrot", title: "No veg yet", body: "Vegetables you add to your basket will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L: Q[] = [], z0 = hop(h), wave = h * Math.sin(t * 7) * 0.25 + Math.sin(h * Math.PI) * 0.3;
    p.translate(0, 0, -9);
    p.scale(1.25);
    p.shadow(0, 0, 26 - z0, 12 - z0 / 2, 0.12);
    const U0 = -LEN / 2;
    // the leaves: three flat blades fanning up and back from the crown
    const crown = at(U0 - 0.5, 0, RC + z0);
    const blade = (ang: number, len: number, wid: number, tone: number) => {
      const a = ang + wave, d: V3 = [-CA * Math.cos(a) * 0.55, -SA * Math.cos(a) * 0.55, Math.sin(a)];
      const side: V3 = [-SA, CA, 0];
      const pt = (s: number, w: number): V3 => [crown[0] + d[0] * s * len + side[0] * w, crown[1] + d[1] * s * len + side[1] * w, crown[2] + d[2] * s * len];
      const pts: V3[] = [];
      for (let i = 0; i <= 10; i++) { const s = i / 10; pts.push(pt(s, Math.sin(s * Math.PI) * wid)); }
      for (let i = 10; i >= 0; i--) { const s = i / 10; pts.push(pt(s, -Math.sin(s * Math.PI) * wid * 0.6)); }
      p.face(pts, tone, 0);
      p.line([pt(0.05, 0), pt(0.85, 0)], 1, 0.6);
    };
    blade(1.25, 17, 3.6, 0.13);
    blade(0.75, 16, 3.4, 0.24);
    blade(1.75, 15, 3.4, 0.2);
    // the root: a long taper lying on the floor
    surf(L, 40, 36, (u, v) => { const w = v * TAU, r = rad(u); return at(U0 + u * LEN, Math.cos(w) * r, zc(u) + z0 + Math.sin(w) * r * 0.95); }, (u) => at(U0 + u * LEN, 0, zc(u) + z0), skin);
    flush(p, L);
    // ridges: short cuts across the top and the near side
    for (const [u, a0, a1] of [[0.2, 1.4, 3.5], [0.34, 1.9, 3.9], [0.48, 1.3, 3.4], [0.62, 1.9, 3.8], [0.76, 1.5, 3.3]] as [number, number, number][]) {
      const r = rad(u) + 0.05;
      p.line(Array.from({ length: 8 }, (_, i) => { const w = a0 + ((a1 - a0) * i) / 7; return at(U0 + u * LEN, Math.cos(w) * r, zc(u) + z0 + Math.sin(w) * r * 0.95); }), 1, 0.65);
    }
  },
};
