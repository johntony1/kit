// Nothing to sort: a thick up arrow and a thick down arrow standing side by side. They keep trading places in height, one rising as the other sinks.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

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
const P = 3.2; // seconds per loop
/** an up arrow centred on the origin, in [u, v] */
const UP: [number, number][] = [[-2.8, -14], [2.8, -14], [2.8, 3], [7.4, 3], [0, 14], [-7.4, 3], [-2.8, 3]];

function arrow(p: Pen, cx: number, cz: number, dir: 1 | -1, cap: number) {
  const B = UP.map(([u, v]) => [cx + u, -2.5, cz + v * dir] as V3);
  prism(p, B, [0, 5, 0], cap);
  const c = B.map(([x, , z]) => [x, 2.53, z] as V3);
  p.line([...c, c[0]], 1, 0.7);
}

export const sort: Illustration = {
  k: "sort", name: "Sort", title: "Nothing to sort", body: "Add a few items and you can order them however you like.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // up, hold, down, hold
    const s = u < 0.35 ? easeInOut(u / 0.35) : u < 0.5 ? 1 : u < 0.85 ? 1 - easeInOut((u - 0.5) / 0.35) : 0;
    p.translate(0, 0, -17);
    p.shadow(0, 1, 28, 13, 0.12);
    p.rotate("z", -0.42);
    arrow(p, -8.6, 15 + 5 * s, 1, 0.3);
    arrow(p, 8.6, 20 - 5 * s, -1, 0.16);
  },
};
