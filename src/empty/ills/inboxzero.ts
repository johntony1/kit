// You reached inbox zero: an empty envelope lying open, its flap standing up behind. Hover and a big bright tick springs up out of it and settles.
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
const back = (x: number) => 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2);
/** the tick's outline in (u, v): a thick check mark */
const TICK: [number, number][] = [[-8.6, 2.6], [-5.8, 5.4], [-2.2, 1.8], [6.6, 10.6], [9.4, 7.8], [-2.2, -3.8]];

export const inboxzero: Illustration = {
  k: "inboxzero", name: "Inbox zero", title: "You reached inbox zero", body: "Every message is dealt with. New ones will land here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", -0.4);
    const W = 16, D = 10, H = 2.6;
    // the flap, open and standing up along the back edge, leaning back a little
    p.push();
    p.rotate("x", -0.2, [0, -D, H]);
    p.face([[-W, -D, H], [W, -D, H], [0, -D, H + 15]], 0.065, 0);
    p.line([[-W + 3.2, -D + 0.03, H + 1.2], [W - 3.2, -D + 0.03, H + 1.2], [0, -D + 0.03, H + 12.2], [-W + 3.2, -D + 0.03, H + 1.2]], 1, 0.7);
    p.pop();
    // the tick: rises out of the envelope past its rest and settles back
    const k = h <= 0 ? 0 : back(Math.min(1, h * 1.15));
    if (k > 0.02) {
      const z = H - 14 + 22 * k;
      prism(p, TICK.map(([u, v]) => [u * 1.3, -3, z + v * 1.3] as V3), [0, 3, 0], 0.34);
    }
    // the envelope: a low slab, the flap folds meeting in the middle as cuts
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    const Z = H + 0.03;
    p.line([[-W, D, Z], [0, -1, Z], [W, D, Z]], 1, 0.9);
    p.line([[-W, -D, Z], [-3, 0.6, Z]], 1, 0.7);
    p.line([[W, -D, Z], [3, 0.6, Z]], 1, 0.7);
  },
};
