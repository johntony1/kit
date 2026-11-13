// No breakdown yet: a bold donut chart standing up, cut into three parts of different shades with dark gaps between. Hover and the bright part slides out toward you.
import { type Illustration, type Pen, type V3 } from "../dots";

const facing = (p: Pen, q: V3[]) => {
  const s = q.map((v) => p.pt(v));
  let a = 0;
  for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; }
  return a;
};
const depth = (q: V3[]) => q.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / q.length;
/** a slab: the outline B pushed along d. The sides it shows are shaded by where they face, then the cap */
function prism(p: Pen, B: V3[], d: V3, cap: number) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < B.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  if (nx * d[0] + ny * d[1] + nz * d[2] < 0) B = B.slice().reverse();
  const F = B.map(([x, y, z]) => [x + d[0], y + d[1], z + d[2]] as V3);
  const sides = B.map((b, i) => [b, B[(i + 1) % B.length], F[(i + 1) % B.length], F[i]] as V3[]).filter((q) => facing(p, q) > 0).sort((a, b) => depth(a) - depth(b));
  for (const q of sides) {
    const e = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]];
    const n = [e[1] * d[2] - e[2] * d[1], e[2] * d[0] - e[0] * d[2], e[0] * d[1] - e[1] * d[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    p.face(q, n[2] / l > 0.55 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const S = 0.82, RO = 21, RI = 11, T = 5, CZ = 22; // x squeeze, outer and inner radius, thickness, height of the centre
/** a ring segment in the upright plane y, from angle a0 to a1 */
const seg = (a0: number, a1: number, y: number): V3[] => {
  const n = Math.max(4, Math.round(((a1 - a0) / Math.PI) * 22)), out: V3[] = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([Math.cos(a) * RO * S, y, CZ + Math.sin(a) * RO]); }
  for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; out.push([Math.cos(a) * RI * S, y, CZ + Math.sin(a) * RI]); }
  return out;
};

export const donutchart: Illustration = {
  k: "donutchart", name: "Donut chart", title: "No breakdown yet", body: "Once there is data, you will see how it breaks down here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -18);
    p.shadow(0, 0, 26, 9, 0.12);
    p.rotate("z", -0.7);
    const G = 0.06, TOP = Math.PI / 2, TAU = Math.PI * 2;
    // clockwise from the top: the bright part, a dense part, a sparse part
    const A1 = TOP - 0.3 * TAU, A2 = A1 - 0.42 * TAU;
    const part = (a0: number, a1: number, tone: number) => prism(p, seg(a0 + G, a1 - G, -T / 2), [0, T, 0], tone);
    part(A2 - 0.28 * TAU, A2, 0.065);
    part(A2, A1, 0.13);
    // the bright part: out along its middle, and toward us
    const k = back(Math.min(1, h * 1.1)), m = (A1 + TOP) / 2;
    p.push();
    p.translate(Math.cos(m) * 3.6 * k * S, 2.5 * k, Math.sin(m) * 3.6 * k);
    part(A1, TOP, 0.32);
    p.pop();
  },
};
