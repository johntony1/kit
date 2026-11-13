// Nothing baked yet: a fat wooden rolling pin lying on a diagonal across a round sheet of dough, a handle at each end. Hover and it rolls toward us, turning, and the dough spreads out under it.
import { type Illustration, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const TAU = Math.PI * 2;
/** a gridded surface P(u, v); O(u, v) lies inside it so normals point out. Quads facing us go into L */
function surf(L: Q[], nu: number, nv: number, P: (u: number, v: number) => V3, O: (u: number) => V3, tone: (n: V3) => number) {
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = i / nu, u1 = (i + 1) / nu, v0 = j / nv, v1 = (j + 1) / nv;
    const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
    const e = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], g = [d[0] - b[0], d[1] - b[1], d[2] - b[2]];
    const n: V3 = [e[1] * g[2] - e[2] * g[1], e[2] * g[0] - e[0] * g[2], e[0] * g[1] - e[1] * g[0]];
    const m: V3 = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4], o = O((u0 + u1) / 2);
    const l = Math.hypot(n[0], n[1], n[2]) || 1, s = ((m[0] - o[0]) * n[0] + (m[1] - o[1]) * n[1] + (m[2] - o[2]) * n[2] < 0 ? -1 : 1) / l;
    const k: V3 = [n[0] * s, n[1] * s, n[2] * s];
    if (k[0] + k[1] + k[2] <= 0.01) continue;
    const grow = (v: V3): V3 => [m[0] + (v[0] - m[0]) * 1.1, m[1] + (v[1] - m[1]) * 1.1, m[2] + (v[2] - m[2]) * 1.1];
    L.push({ q: [a, b, c, d].map(grow), f: tone(k), d: m[0] + m[1] + m[2] });
  }
}
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
/** u along the pin, f the way it rolls, z up; the pin lies turned so it runs from upper left to lower right */
const CA = Math.cos(-0.42), SA = Math.sin(-0.42);
const at = (u: number, f: number, z: number): V3 => [u * CA - f * SA, u * SA + f * CA, z];
// the lit top of the wood, a dense middle, a dark underside
const wood = (n: V3) => (n[2] > 0.4 ? 0.32 : n[2] > -0.3 ? 0.16 : 0.03);
const RB = 4.6; // barrel radius

export const rollingpin: Illustration = {
  k: "rollingpin", name: "Rolling pin", title: "Nothing baked yet", body: "Bakes you plan will show up here. Add a recipe to get started.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const L: Q[] = [], e = ease(h), roll = 4 * e;
    p.translate(0, 0, -8);
    p.shadow(0, 0, 32, 14, 0.12);
    // the dough: a round sheet, a thin edge in shade and a lit top; it spreads as the pin rolls
    const DT = 1.8, rx = 16 + 1.5 * e, ry = 16 + 1.5 * e;
    const rim = (z: number): V3[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * TAU; return [Math.cos(a) * rx + 0.5, Math.sin(a) * ry + 0.5, z]; });
    const lo = rim(0), hi = rim(DT);
    const side: V3[] = [];
    for (let i = -6; i <= 18; i++) side.push(lo[(i + 48) % 48]);
    for (let i = 18; i >= -6; i--) side.push(hi[(i + 48) % 48]);
    p.face(side, 0.22, 0);
    p.face(hi, 0.045, 0);
    const spin = roll / RB;
    // the pin: a fat barrel, slim handles with round knobs, one turned piece
    const R = (x: number) => {
      const ax = Math.abs(x);
      if (ax < 13) return RB - (0.03 * ax * ax) / 13;
      if (ax < 14) return RB - 0.4 - (ax - 13) * 2.6;
      if (ax < 19.5) return 1.6 + (ax - 14) * 0.05;
      return Math.sqrt(Math.max(0, 1 - Math.pow((ax - 19.5) / 3, 2))) * 2.4 + 0.3;
    };
    const X = (u: number) => -22.5 + u * 45;
    surf(L, 88, 20, (u, v) => { const a = v * TAU + spin, r = R(X(u)); return at(X(u), roll + Math.cos(a) * r, DT + RB + Math.sin(a) * r); }, (u) => at(X(u), roll, DT + RB), wood);
    L.sort((x, y) => x.d - y.d).forEach((k) => p.face(k.q, k.f, 0));
    // two cuts where the barrel meets its handles
    for (const s of [-1, 1]) {
      const pts: V3[] = Array.from({ length: 9 }, (_, i) => { const a = -0.3 + (i / 8) * 2.4; return at(s * 13.2, roll + Math.cos(a) * (RB - 0.4), DT + RB + Math.sin(a) * (RB - 0.4)); });
      p.line(pts, 1, 1);
    }
  },
};
