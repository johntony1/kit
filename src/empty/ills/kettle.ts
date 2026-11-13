// Nothing brewing: a stovetop kettle with an arched handle and a curved spout. Hover and it comes to the boil, the lid rattles and puffs of steam rise from the spout.
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
const S2 = Math.SQRT1_2;
/** the plane that faces us: a across the screen, b up */
const at = (a: number, b: number, f = 0): V3 => [a * S2 + f * S2, -a * S2 + f * S2, b];
/** a turned profile [r, z], walked by u in 0..1 */
const prof = (pts: [number, number][]) => (u: number): [number, number] => {
  const x = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(x)), k = x - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
};
const BODY = prof([[11.2, 0], [12.2, 0.8], [12.6, 3.5], [11.8, 7.5], [9, 12.2], [6.4, 14.6], [5.8, 15.4]]);
const LID = prof([[6.2, 15.3], [5.6, 16.4], [4, 17.6], [2, 18.2], [0.01, 18.3]]);
const KNOB = prof([[1.4, 18.2], [2.2, 19.3], [2.1, 20.4], [1.2, 21.1], [0.01, 21.2]]);
/** the spout's centre line: out of the body on the right, curving up */
const SP = (u: number): V3 => { const a = (1 - u) * (1 - u) * 8 + 2 * u * (1 - u) * 17 + u * u * 20.5, b = (1 - u) * (1 - u) * 4.5 + 2 * u * (1 - u) * 5.5 + u * u * 14.5; return at(a, b); };

function lathe(L: Q[], pr: (u: number) => [number, number], z0: number, nu: number, tone?: (n: V3) => number) {
  surf(L, nu, 64, (u, v) => { const [r, z] = pr(u); return [Math.cos(v * TAU) * r, Math.sin(v * TAU) * r, z + z0]; }, (u) => [0, 0, pr(u)[1] + z0], tone);
}

export const kettle: Illustration = {
  k: "kettle", name: "Kettle", title: "Nothing brewing", body: "Drinks being made will show up here. Pick something to get the kettle on.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L: Q[] = [];
    p.translate(-2, 2, -15);
    p.scale(1.28);
    p.shadow(1, -1, 26, 13, 0.12);
    // the spout first: it sits beside the body, then the body over its root
    surf(L, 16, 14, (u, v) => {
      const c = SP(u), d = SP(Math.min(1, u + 0.02)), e = SP(Math.max(0, u - 0.02));
      const ta = (d[0] - e[0]) / S2, tb = d[2] - e[2], l = Math.hypot(ta, tb) || 1, r = 2.8 - 1.3 * u, a = v * TAU;
      const n = at(-tb / l, ta / l, 0), f = at(0, 0, 1);
      return [c[0] + (n[0] * Math.cos(a) + f[0] * Math.sin(a)) * r, c[1] + (n[1] * Math.cos(a) + f[1] * Math.sin(a)) * r, c[2] + n[2] * Math.cos(a) * r];
    }, (u) => SP(u));
    flush(p, L);
    const tip = SP(1);
    p.dot([tip[0], tip[1], tip[2] + 0.3], 1.2, 0);
    lathe(L, BODY, 0, 16, (n) => (n[2] > 0.8 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065));
    flush(p, L);
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * 12.7, Math.sin(a) * 12.7, 3.4] as V3; }), 1, 0.7);
    // the lid rattles as it boils
    const rat = h > 0.3 ? Math.max(0, Math.sin(t * 26)) * 0.7 * Math.min(1, (h - 0.3) * 3) : 0;
    p.push(); p.translate(0, 0, rat);
    lathe(L, LID, 0, 6, (n) => (n[2] > 0.5 ? 0.24 : n[1] > n[0] ? 0.13 : 0.07));
    lathe(L, KNOB, 0, 6, (n) => (n[2] > 0.5 ? 0.3 : n[1] > n[0] ? 0.16 : 0.08));
    flush(p, L);
    p.pop();
    // the handle: an arch over the top, from shoulder to shoulder
    surf(L, 40, 12, (u, v) => {
      const a = Math.PI * (0.06 + 0.88 * u), ca = Math.cos(a), sa = Math.sin(a), r = 1.8, w = v * TAU;
      const c = at(-9.5 * ca, 12.5 + 16.5 * sa), n = at(ca, sa), f = at(0, 0, 1);
      return [c[0] + (n[0] * Math.cos(w) + f[0] * Math.sin(w)) * r, c[1] + (n[1] * Math.cos(w) + f[1] * Math.sin(w)) * r, c[2] + n[2] * Math.cos(w) * r];
    }, (u) => { const a = Math.PI * (0.06 + 0.88 * u); return at(-9.5 * Math.cos(a), 12.5 + 16.5 * Math.sin(a)); }, (n) => (n[2] > 0.5 ? 0.3 : 0.16));
    flush(p, L);
    // steam: puffs leave the spout one after another and swell as they rise
    p.screen((g) => {
      for (let i = 0; i < 3; i++) {
        const k = Math.min(1, Math.max(0, (h - 0.25 - i * 0.16) / 0.45));
        if (k <= 0) continue;
        const w = h > 0.9 ? Math.sin(t * 3 + i * 2) * 0.6 : 0;
        const [x, y] = p.pt([tip[0] + (0.3 + i * 0.5 + w) * S2, tip[1] - (0.3 + i * 0.5 + w) * S2, tip[2] + 2.6 + i * 3.2 + k * 1.2]);
        g.beginPath(); g.arc(x, y, (1.3 + i * 0.5) * (0.3 + 0.7 * k) * 1.28, 0, TAU);
        g.fillStyle = "#fff"; g.fill(); g.strokeStyle = "#000"; g.lineWidth = 0.6; g.stroke();
      }
    });
  },
};
