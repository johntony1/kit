// No dim sum yet: one plump soup dumpling, its pleats twisting up to a little knot on top. It squishes softly as it steams, two wisps rising from the knot, over and over.
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
const P = 3; // seconds per loop
const R0 = 15, H0 = 12.5; // radius and height
/** the dumpling's profile: radius at height fraction s, a soft dome on a flat base */
const rad = (s: number) => (s < 0.12 ? R0 * (0.9 + 0.1 * Math.sin((s / 0.12) * Math.PI / 2)) : R0 * Math.pow(Math.cos(((s - 0.12) / 0.88) * Math.PI / 2), 0.8) * 0.98 + 1.2 * s);
const dough = (n: V3) => (n[2] > 0.62 ? 0.22 : n[1] > n[0] ? 0.12 : 0.065);

export const dumpling: Illustration = {
  k: "dumpling", name: "Dumpling", title: "No dim sum yet", body: "Dishes you order will show up here, fresh from the steamer.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, sq = Math.sin(ph * TAU), L: Q[] = [];
    p.translate(0, 0, -10);
    p.scale(1.3);
    p.shadow(0, 0, 30, 15, 0.12);
    const sx = 1 + 0.025 * sq, sz = 1 - 0.05 * sq, H = H0 * sz;
    const S = (s: number, a: number): V3 => { const r = rad(s) * sx; return [Math.cos(a) * r, Math.sin(a) * r, s * H]; };
    // the body, with shallow folds that twist as they climb
    surf(L, 18, 72, (u, v) => { const a = v * TAU, tw = a + u * 0.9, fold = 1 - 0.035 * Math.max(0, Math.cos(tw * 12)) * u; const q = S(u, a); return [q[0] * fold, q[1] * fold, q[2]]; }, (u) => [0, 0, u * H], dough);
    flush(p, L);
    // the pleats: cuts that spiral up from the shoulder to the knot, on the side facing us
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * TAU;
      const pts: V3[] = [];
      for (let j = 0; j <= 14; j++) {
        const s = 0.5 + (j / 14) * 0.47, a = a0 + (s - 0.5) * 1.6, q = S(s, a);
        if (Math.cos(a) + Math.sin(a) > -0.6) pts.push([q[0] * 1.01, q[1] * 1.01, q[2] + 0.1]);
      }
      if (pts.length > 2) p.line(pts, 1, 0.65);
    }
    // the knot on top
    surf(L, 6, 24, (u, v) => { const a = v * TAU, r = 2.2 * Math.sin((0.15 + u * 0.85) * Math.PI); return [Math.cos(a) * r, Math.sin(a) * r, H - 0.6 + u * 3.4]; }, (u) => [0, 0, H + u * 2.6], (n) => (n[2] > 0.5 ? 0.3 : n[1] > n[0] ? 0.16 : 0.08));
    flush(p, L);
    // steam: two wisps curl up from the knot and fade
    p.screen((g) => {
      g.lineCap = "round";
      for (let i = 0; i < 2; i++) {
        const k = (ph + i / 2) % 1, a = Math.sin(k * Math.PI);
        const pts = Array.from({ length: 12 }, (_, j) => { const s = j / 11; return p.pt([(i ? 1.6 : -1.6) * 0.7, (i ? -1.6 : 1.6) * 0.7, H + 4 + k * 4 + s * 6]); }).map(([x, y], j) => [x + Math.sin(j * 0.6 + k * 6 + i * 2) * 1.6, y] as [number, number]);
        const n = Math.round(255 * Math.min(1, a * 1.3));
        g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 1.6;
        g.beginPath(); pts.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      }
    });
  },
};
