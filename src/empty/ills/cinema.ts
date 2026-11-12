// No movies yet: a cinema seat with its cushion folded up. Hover and the seat folds down, then a drink drops into the cup holder.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a box turned by f: only the faces that look at us are drawn, shaded by where they point */
function turned(p: Pen, a: V3, b: V3, f: (v: V3) => V3) {
  const c = (i: number, j: number, k: number): V3 => f([i ? b[0] : a[0], j ? b[1] : a[1], k ? b[2] : a[2]]);
  const faces: V3[][] = [
    [c(0, 0, 0), c(0, 1, 0), c(1, 1, 0), c(1, 0, 0)], [c(0, 0, 0), c(1, 0, 0), c(1, 0, 1), c(0, 0, 1)], [c(0, 0, 0), c(0, 0, 1), c(0, 1, 1), c(0, 1, 0)],
    [c(1, 0, 0), c(1, 1, 0), c(1, 1, 1), c(1, 0, 1)], [c(0, 1, 0), c(0, 1, 1), c(1, 1, 1), c(1, 1, 0)], [c(0, 0, 1), c(1, 0, 1), c(1, 1, 1), c(0, 1, 1)],
  ];
  for (const q of faces) {
    const u = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], v = [q[2][0] - q[1][0], q[2][1] - q[1][1], q[2][2] - q[1][2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    if (n[0] + n[1] + n[2] <= 0.001) continue;
    p.face(q, 0.1 + 0.135 * Math.max(0, n[2] / l) + 0.055 * Math.max(0, n[1] / l), SH.edge, 0.6);
  }
}
function drop(k: number) {
  if (k <= 0) return 30;
  if (k < 0.55) return 30 * (1 - Math.pow(k / 0.55, 2));
  if (k < 0.82) { const v = (k - 0.55) / 0.27; return 2.6 * 4 * v * (1 - v); }
  return 0;
}

export const cinema: Illustration = {
  k: "cinema", name: "Cinema seat", title: "No movies yet", body: "Book a film and your seat will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.scale(1.05);
    p.shadow(0, 0, 25, 12.5, 0.11);
    const W = 9, AW = 4.2, AH = 14, BY = -9; // half seat width, arm width, arm height, back of the chair
    // the far arm, then the backrest with a head cushion
    p.box(-W - AW, BY, 0, AW, 16, AH, { lw: 0.6 });
    p.box(-W, BY, 4, W * 2, 3.2, 24, { top: 0.24, left: 0.055, right: 0.04, lw: 0.65 });
    const y = BY + 3.23;
    p.line([[-W + 1.6, y, 21.5], [W - 1.6, y, 21.5]], SH.edge, 0.6);
    for (const x of [-3, 3]) p.line([[x, y, 7], [x, y, 21.5]], SH.edge, 0.4);
    // the cushion: hinged at the back, folding down with a small bounce
    const k = Math.min(1, h / 0.6);
    const e = k < 0.75 ? ease(k / 0.75) * 1.06 : 1.06 - 0.06 * ease((k - 0.75) / 0.25);
    const a = (Math.PI / 2 - 0.12) * (1 - e), cs = Math.cos(a), sn = Math.sin(a), hy = BY + 3.4, hz = 8.5;
    turned(p, [-W + 0.3, hy, hz], [W - 0.3, hy + 13.5, hz + 3.2], ([x, yy, z]) => [x, hy + cs * (yy - hy) - sn * (z - hz), hz + sn * (yy - hy) + cs * (z - hz)]);
    // the near arm with its cup holder and a seat number
    p.box(W, BY, 0, AW, 16, AH, { lw: 0.6 });
    const cx = W + AW / 2, cy = BY + 12.6;
    p.disc(cx, cy, AH + 0.03, 1.5, 0.02, SH.edge);
    p.face([[W + AW + 0.03, BY + 5, 8], [W + AW + 0.03, BY + 9.5, 8], [W + AW + 0.03, BY + 9.5, 11], [W + AW + 0.03, BY + 5, 11]], 0.4, SH.edge, 0.5);
    // the drink
    const d = Math.max(0, (h - 0.5) / 0.5);
    if (d > 0.01) {
      const z = AH - 0.6 + drop(d);
      p.cylinder(cx, cy, z, 1.75, 6.2, { side: 0.3, top: 0.5, lw: 0.5 });
      p.box(cx - 0.3, cy - 0.3, z + 6.2, 0.6, 0.6, 3.6, { top: 0.4, left: 0.4, right: 0.4, edge: 0 });
    }
  },
};
