// Nothing sketched yet: a page wireframe standing up, a raised crossed image box beside text bars and a button cut into the page. Hover and the bars and button pop up out of the page one after another.
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
const Y = 1.5; // the page's face
const rect = (u0: number, v0: number, u1: number, v1: number, y: number): V3[] => [[u0, y, v0], [u1, y, v0], [u1, y, v1], [u0, y, v1]];

/** a block of the layout: a dark slot at rest, a raised lit slab once it pops (k > 0) */
function block(p: Pen, u0: number, v0: number, u1: number, v1: number, k: number, cap: number, cross = false) {
  p.clear(rect(u0, v0, u1, v1, Y + 0.03));
  if (k <= 0.01) return;
  const lift = 3 * k;
  prism(p, rect(u0, v0, u1, v1, Y - 0.5), [0, 0.5 + lift, 0], cap);
  const y = Y + lift + 0.03;
  p.line(rect(u0, v0, u1, v1, y).concat([[u0, y, v0]]), 1, 0.7);
  if (cross) {
    const i = 1.2;
    p.line([[u0 + i, y, v0 + i], [u1 - i, y, v1 - i]], 1, 0.8);
    p.line([[u0 + i, y, v1 - i], [u1 - i, y, v0 + i]], 1, 0.8);
    p.line(rect(u0 + i, v0 + i, u1 - i, v1 - i, y).concat([[u0 + i, y, v0 + i]]), 1, 0.7);
  }
}

export const wireframe: Illustration = {
  k: "wireframe", name: "Wireframe", title: "Nothing sketched yet", body: "Start a sketch and your layouts will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const g = (d: number) => back(Math.min(1, Math.max(0, (h - d) / 0.55)));
    p.translate(0, 0, -16);
    p.shadow(0, 1, 30, 13, 0.12);
    p.rotate("z", -0.42);
    // the page: a lit board on a low foot
    p.box(-15, -4, 0, 30, 8, 1.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    prism(p, rect(-18, 1.4, 18, 33, -Y), [0, Y * 2, 0], 0.22);
    // the crossed image box stands proud already; it hops a little on hover
    block(p, -15, 15, -1, 30, 0.6 + 0.4 * g(0), 0.3, true);
    // three text bars beside it, a long bar and a button below: dark slots that pop up in turn
    block(p, 2, 26.5, 15, 29, g(0.12), 0.3);
    block(p, 2, 21.5, 15, 24, g(0.2), 0.3);
    block(p, 2, 16.5, 11, 19, g(0.28), 0.3);
    block(p, -15, 9, 15, 11.5, g(0.36), 0.3);
    block(p, -15, 3.5, -5, 6.5, g(0.45), 0.42);
  },
};
