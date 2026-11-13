// Nothing cooking: an empty frying pan with a long handle. Hover and an egg drops in, splats and sets, yolk up.
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
const ring = (cx: number, cy: number, z: number, r: number, n = 48): V3[] => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * TAU) * r, cy + Math.sin((i / n) * TAU) * r, z] as V3);
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

const CX = 3, CY = 2, R = 13, H = 4.6;
/** the pan's wall: from the floor out and up to the rim */
const wall = (u: number) => [R - 2.4 + 2.4 * Math.sin(u * Math.PI / 2), u * H] as [number, number];

export const frypan: Illustration = {
  k: "frypan", name: "Frying pan", title: "Nothing cooking", body: "Start an order and what is on the stove will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const L: Q[] = [];
    p.translate(0, 0, -6);
    p.scale(1.22);
    p.shadow(CX - 5, CY, 30, 15, 0.12);
    // inside: the far wall facing us and the dark floor
    surf(L, 6, 48, (u, v) => { const [r, z] = wall(u); return [CX + Math.cos(v * TAU) * (r - 0.9), CY + Math.sin(v * TAU) * (r - 0.9), z + 0.6]; }, (u, v) => { const [r, z] = wall(u); return [CX + Math.cos(v * TAU) * (r + 4), CY + Math.sin(v * TAU) * (r + 4), z]; }, () => 0.09);
    flush(p, L);
    p.face(ring(CX, CY, 0.6, R - 3.2), 0.025, 0);
    // the egg: falls, splats, the white spreads and the yolk sits up
    const fall = ease(h / 0.4), spread = ease((h - 0.38) / 0.4);
    if (h > 0.38) {
      const s = 0.25 + 0.75 * spread + 0.06 * Math.sin(spread * Math.PI);
      const white = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * TAU, r = 7.2 * s * (1 + 0.12 * Math.sin(3 * a + 0.6) + 0.06 * Math.sin(5 * a)); return [CX - 0.5 + Math.cos(a) * r, CY + 0.5 + Math.sin(a) * r, 0.8] as V3; });
      p.face(white, 0.5, 0);
      surf(L, 6, 24, (u, v) => { const r = 2.9 * Math.cos(u * Math.PI / 2); return [CX - 1.5 + Math.cos(v * TAU) * r, CY + 1.5 + Math.sin(v * TAU) * r, 0.9 + 1.9 * Math.sin(u * Math.PI / 2)]; }, () => [CX - 1.5, CY + 1.5, 0.4], (n) => (n[2] > 0.75 ? 0.3 : n[1] > n[0] ? 0.16 : 0.09));
      flush(p, L);
      p.line(ring(CX - 1.5, CY + 1.5, 0.95, 3, 32).concat([[CX + 1.5, CY + 1.5, 0.95]]), 1, 0.5);
    } else if (h > 0.01) {
      const z = 26 * (1 - fall) + 2;
      const [x, y] = p.pt([CX - 1, CY + 1, z]);
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, y, 3.2, 4, 0, 0, TAU); g.fill(); g.strokeStyle = "#000"; g.lineWidth = 0.6; g.stroke(); });
    }
    // outside wall, front half
    surf(L, 6, 48, (u, v) => { const [r, z] = wall(u); return [CX + Math.cos(v * TAU) * r, CY + Math.sin(v * TAU) * r, z]; }, (u) => [CX, CY, wall(u)[1]], (n) => (n[1] > n[0] ? 0.13 : 0.07));
    flush(p, L);
    // the rim: a bright lip
    const ro = ring(CX, CY, H + 0.6, R + 0.2), ri = ring(CX, CY, H + 0.6, R - 0.9);
    p.face([...ro, ro[0], ri[0], ...ri.slice().reverse()], 0.3, 0);
    // the handle: a long bar out to the left, rising a little, with a hole at its end
    const D: V3 = [-1, 0, 0];
    const C = (u: number): V3 => [CX + D[0] * (R - 1 + u * 17), CY + D[1] * (R - 1 + u * 17), H - 1 + u * 4];
    const rad = (u: number) => (u > 0.9 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.9) / 0.1, 2))) : 1) * (u < 0.15 ? 1.3 : 1.7);
    surf(L, 30, 14, (u, v) => { const c = C(u), a = v * TAU, r = rad(u); return [c[0], c[1] + Math.cos(a) * r, c[2] + Math.sin(a) * r * 0.75]; }, (u) => C(u));
    flush(p, L);
    p.dot(C(0.88).map((v, i) => v + [0, 0, 1][i] * 1.25) as V3, 0.8, 0);
  },
};
