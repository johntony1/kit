// No data to split: a thick pie chart standing on edge in a little cradle, three slices cut into it. Hover and the brightest slice slides out toward you.
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
    p.face(q, n[2] / l > 0.55 ? 0.16 : n[1] > n[0] ? 0.1 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
/** a slice of the disc, in the upright plane y: centre (cx, cz), from angle a0 to a1 */
const slice = (cx: number, cz: number, r: number, a0: number, a1: number, y: number): V3[] => {
  const n = Math.max(3, Math.round(((a1 - a0) / Math.PI) * 20)), out: V3[] = [[cx, y, cz]];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  return out;
};

export const piechart: Illustration = {
  k: "piechart", name: "Pie chart", title: "No data to split", body: "Once there is data, you will see how it splits up right here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 1, 22, 11, 0.12);
    p.rotate("z", -0.42);
    const R = 15, CZ = R + 3, T = 5;
    // the cradle it stands in
    p.box(-8, -5, 0, 16, 10, 3, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the two slices that stay: one lit, one in shade, a cut between them
    const A0 = 0.25, A1 = 1.45; // the slice that slides out
    prism(p, slice(0, CZ, R, A1, A1 + 2.3, -T / 2), [0, T, 0], 0.24);
    prism(p, slice(0, CZ, R, A1 + 2.3, A0 + Math.PI * 2, -T / 2), [0, T, 0], 0.12);
    const y = T / 2 + 0.03;
    for (const a of [A1, A1 + 2.3, A0]) p.line([[0, y, CZ], [Math.cos(a) * R, y, CZ + Math.sin(a) * R]], 1, 0.8);
    // the slice that slides out: along its middle, and toward us
    const k = back(Math.min(1, h * 1.1)), m = (A0 + A1) / 2;
    p.push();
    p.translate(Math.cos(m) * 3.5 * k, 4 * k, Math.sin(m) * 3.5 * k);
    prism(p, slice(0, CZ, R, A0, A1, -T / 2), [0, T, 0], 0.34);
    const s = slice(0, CZ, R, A0, A1, y);
    p.line([...s, s[0]], 1, 0.6);
    p.pop();
  },
};
