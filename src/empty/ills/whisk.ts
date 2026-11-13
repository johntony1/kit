// Nothing mixed yet: a big balloon whisk on a diagonal, a fat handle down to the left and bright wire loops swelling up to the right. The wires turn round and round as if beating, the whisk rocking gently.
import { type Illustration, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const TAU = Math.PI * 2;
/** a gridded surface P(u, v); O(u, v) lies inside it so normals point out. Quads facing us go into L */
function surf(L: Q[], nu: number, nv: number, P: (u: number, v: number) => V3, O: (u: number, v: number) => V3, tone: (n: V3) => number) {
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
const ad = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const PER = 2.8, LEN = 30, HL = 17; // loop seconds, wire length, handle length
/** the balloon's radius from the collar (x 0) to the tip (x 1) */
const prof = (x: number) => { const y = 1 - x; return 1.4 * y + 10.5 * Math.sin(Math.PI * Math.pow(y, 0.62)) * (1 - 0.12 * y); };

export const whisk: Illustration = {
  k: "whisk", name: "Whisk", title: "Nothing mixed yet", body: "Recipes you start will show up here. Pick one and get mixing.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / PER) % 1, L: Q[] = [];
    p.translate(0, 0, -6);
    p.shadow(0, 0, 26, 9, 0.1);
    // the axis runs from the handle's end (low, left) up through the collar to the balloon's tip (high, right)
    const rock = 0.06 * Math.sin(ph * TAU);
    const A = norm([0.55 + rock, -0.62 + rock, 0.56]);
    const N = norm(cross(A, [0, 0, 1])), F = cross(N, A);
    const C: V3 = [-3, 3, 11]; // the collar
    const ax = (s: number) => ad(C, A, s);
    // the wires: loops in planes through the axis, turning as if beating
    const spin = ph * (Math.PI / 3), W = 3;
    const wires: { d: number; q: V3[] }[] = [];
    for (let k = 0; k < W * 2; k++) {
      const phi = spin + (k * Math.PI) / W, dir = ad(ad([0, 0, 0], N, Math.cos(phi)), F, Math.sin(phi));
      const q = Array.from({ length: 33 }, (_, i) => { const x = i / 32; return ad(ax(x * LEN), dir, prof(x)); });
      wires.push({ d: dir[0] + dir[1] + dir[2] * 0.5, q });
    }
    wires.sort((a, b) => a.d - b.d);
    const stroke = (set: { d: number; q: V3[] }[]) => p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      for (const { d, q } of set) {
        g.beginPath(); q.forEach((v, i) => { const [x, y] = p.pt(v); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
        g.strokeStyle = "#000"; g.lineWidth = 4; g.stroke();
        const n = d > 0 ? 255 : 175;
        g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 2.1; g.stroke();
      }
    });
    stroke(wires.filter((w) => w.d <= 0));
    // the handle: a fat round grip running down to the left, a hanging hole near its end
    const R = (u: number) => (u < 0.06 ? 2.2 + u * 10 : u > 0.92 ? 2.8 - (u - 0.92) * 9 : 2.8 + Math.sin(u * Math.PI) * 0.35);
    const tone = (n: V3) => (n[2] > 0.55 ? 0.28 : n[1] > n[0] ? 0.14 : 0.07);
    surf(L, 22, 18, (u, v) => { const a = v * TAU, s = 0.5 - u * HL; return ad(ad(ax(s), N, Math.cos(a) * R(u)), F, Math.sin(a) * R(u)); }, (u) => ax(0.5 - u * HL), tone);
    flush(p, L);
    p.dot(ad(ax(-HL + 2.2), F, 1.6), 1, 0);
    stroke(wires.filter((w) => w.d > 0));
    // the collar where the wires meet the handle: a short bright band
    surf(L, 3, 18, (u, v) => { const a = v * TAU, r = 2.4; return ad(ad(ax(-0.8 + u * 3), N, Math.cos(a) * r), F, Math.sin(a) * r); }, (u) => ax(-0.8 + u * 3), (n) => (n[2] > 0.4 ? 0.34 : 0.2));
    flush(p, L);
  },
};
