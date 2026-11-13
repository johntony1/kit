// Nothing sweet yet: a round honey jar with a cloth cap tied at the neck and a hexagon on its label. Hover and honey wells up under the cap and runs down the side in two slow drips.
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
const S2 = Math.SQRT1_2;
/** a turned profile [r, z], walked by u in 0..1 */
const prof = (pts: [number, number][]) => (u: number): [number, number] => {
  const x = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(x)), k = x - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
};
const JAR = prof([[9.6, 0], [11.4, 1.2], [12.6, 4], [12.8, 9], [12, 13.5], [9.6, 16.4], [8.2, 17.2], [8.2, 18.6]]);
const CAP = prof([[9.8, 15.6], [10.2, 17.2], [9.8, 19.6], [8.2, 20.8], [4, 21.4], [0.01, 21.5]]);
function lathe(L: Q[], pr: (u: number) => [number, number], nu: number, tone?: (n: V3) => number) {
  surf(L, nu, 64, (u, v) => { const [r, z] = pr(u); return [Math.cos(v * TAU) * r, Math.sin(v * TAU) * r, z]; }, (u) => [0, 0, pr(u)[1]], tone);
}
/** a point on the jar's skin at angle a (pi/4 faces us), height z, a little proud of it */
const skin = (a: number, z: number, out = 0.25): V3 => { const r = JAR(Math.min(1, Math.max(0, (z / 18.6) * 0.999)))[0]; return [Math.cos(a) * (r + out), Math.sin(a) * (r + out), z]; };

export const honey: Illustration = {
  k: "honey", name: "Honey jar", title: "Nothing sweet yet", body: "Sweet things you add to your basket will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L: Q[] = [];
    p.translate(0, 0, -13);
    p.scale(1.32);
    p.shadow(0, 0, 26, 13, 0.12);
    // the jar: golden glass, dense on the lit side
    lathe(L, JAR, 18, (n) => (n[2] > 0.6 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065));
    flush(p, L);
    // the label: a bright band across the front with a hexagon on it
    const band: V3[] = [];
    for (let i = 0; i <= 16; i++) band.push(skin(Math.PI / 4 - 0.42 + (i / 16) * 0.84, 4.6));
    for (let i = 16; i >= 0; i--) band.push(skin(Math.PI / 4 - 0.42 + (i / 16) * 0.84, 11.2));
    p.face(band, 0.32, 0);
    const hex = Array.from({ length: 7 }, (_, i) => { const a = (i / 6) * TAU + Math.PI / 6, u = Math.cos(a) * 2.5, v = Math.sin(a) * 2.5; return [u * S2 + 12.95 * S2, -u * S2 + 12.95 * S2, 8.3 + v] as V3; });
    p.line(hex, 1, 0.9);
    p.dot([12.95 * S2, 12.95 * S2, 8.3], 0.7, 0);
    // drips: honey creeps out from under the cap and runs down, a bulb at each end
    const drip = (a: number, k: number, len: number, w: number) => {
      if (k <= 0) return;
      const zb = 16 - len * k, q: V3[] = [];
      for (let i = 0; i <= 8; i++) q.push(skin(a - w + (i / 8) * w * 2, 16 + Math.sin((i / 8) * Math.PI) * 0.6));
      for (let i = 0; i <= 10; i++) { const s = i / 10, z = 16 - (16 - zb) * s, ww = w * (0.45 + 0.25 * s); q.push(skin(a + ww, z)); }
      for (let i = 0; i <= 10; i++) { const s = i / 10, z = 16 - (16 - zb) * (1 - s), ww = w * (0.45 + 0.25 * (1 - s)); q.push(skin(a - ww, z)); }
      p.face(q, 0.5, 0);
      p.line(q.slice(9), 1, 0.55);
      const c = skin(a, zb - 0.4, 0.5);
      p.screen((g) => { const [x, y] = p.pt(c); g.beginPath(); g.ellipse(x, y, 2.1, 2.5, 0, 0, TAU); g.fillStyle = "#fff"; g.fill(); g.strokeStyle = "#000"; g.lineWidth = 0.5; g.stroke(); });
    };
    const k1 = ease(h / 0.7), k2 = ease((h - 0.25) / 0.7);
    drip(Math.PI / 4 + 0.66, k1, 10, 0.24);
    drip(Math.PI / 4 - 0.66, k2, 6.5, 0.22);
    // the cloth cap, a cord tied round the neck
    lathe(L, CAP, 10, (n) => (n[2] > 0.6 ? 0.24 : n[1] > n[0] ? 0.14 : 0.075));
    flush(p, L);
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * 10.3, Math.sin(a) * 10.3, 17] as V3; }), 1, 0.8);
    // the cap's frilled hem: little dark notches round the front
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 4 + 0.15 + (i / 8) * (Math.PI - 0.3); p.line([[Math.cos(a) * 10, Math.sin(a) * 10, 15.7], [Math.cos(a) * 10.15, Math.sin(a) * 10.15, 16.5]], 1, 0.6); }
    if (h > 0.85) p.dot(skin(Math.PI / 4 + 0.66, 16 - 10 - 1.6 - ((t * 2) % 1) * 1.2, 0.5), 0.6 * (1 - ((t * 2) % 1)), 1);
  },
};
