// Brain: a brain seen from the side, folds cut into it, floating over its shadow. Hover and it lifts while sparks run along the folds and sparkles pop around it.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type P2 = [number, number];
// corner cutting, twice: turns a few points into a smooth fold
const smooth = (pts: P2[]): P2[] => {
  let q = pts;
  for (let n = 0; n < 2; n++) {
    const r: P2[] = [q[0]];
    for (let i = 0; i < q.length - 1; i++) { const [a, b] = [q[i], q[i + 1]]; r.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
    r.push(q[q.length - 1]);
    q = r;
  }
  return q;
};
// the folds, in dots from the middle of the brain (it faces left)
const FOLDS: P2[][] = ([
  [[-10.5, -4.6], [-5, -3], [0, -2.4], [5, -0.4], [8.5, 2]],
  [[-1.5, 10.6], [-0.2, 7.6], [-2.2, 5], [-0.4, 2.4], [-1.6, 0]],
  [[-12, 2], [-9.2, 4.6], [-7.4, 1.8], [-5.2, 4.4], [-4.6, 8]],
  [[3.4, 9.8], [4.8, 6.6], [3, 4.2], [5.6, 2.4]],
  [[9.4, 7.4], [8.2, 4.6], [10.8, 3], [11.8, 0.4], [10, -2.4]],
  [[-6.4, -6.4], [-2, -5.2], [2, -5.8], [5.4, -4.4]],
  [[-8.6, 8], [-6.6, 6], [-9, 5.2]],
] as P2[][]).map(smooth);
const OUT: P2[] = Array.from({ length: 72 }, (_, i) => { const a = (i / 72) * Math.PI * 2, m = 1 + 0.05 * Math.cos(9 * a + 0.6), s = Math.sin(a); return [15 * Math.cos(a) * m, 11.5 * s * m * (s < 0 ? 0.74 : 1)] as P2; });
const BELLUM: P2[] = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2, m = 1 + 0.07 * Math.cos(7 * a); return [9.6 + 5.8 * Math.cos(a) * m, -8.8 + 3.7 * Math.sin(a) * m] as P2; });

export const brain: Illustration = {
  k: "brain", name: "Brain", title: "No insights yet", body: "Keep adding data and insights will show here as patterns appear.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, -15);
    p.scale(1.12);
    p.shadow(0, 0, 21 - 3 * e, 10 - 1.5 * e, 0.12);
    // a plane that faces the viewer: u runs right, v runs up
    const zc = 15.5 + 2.6 * e + h * 0.6 * Math.sin(t * 2.2);
    const f = (du = 0, dv = 0) => ([u, v]: P2): V3 => [0.5774 * (u + du), -0.5774 * (u + du), zc + v + dv];
    // the stem and the cerebellum behind and below
    p.face(([[2.6, -6], [6.8, -6], [8.2, -15], [4.8, -15]] as P2[]).map(f()), 0.14, SH.edge, 0.55);
    p.face(BELLUM.map(f()), 0.2, SH.edge, 0.55);
    for (const dv of [-1.2, 1]) p.line(smooth([[5, -8.8 + dv], [9.6, -9.8 + dv * 1.5], [14.6, -8.8 + dv]]).map(f()), SH.edge, 0.5);
    // the cerebrum: its thickness a step back, then the lit face with its folds
    p.face(OUT.map(f(1.4, 1)), 0.08, 0);
    p.face(OUT.map(f()), 0.3, SH.edge, 0.6);
    for (const fold of FOLDS) p.line(fold.map(f()), SH.edge, 0.85);
    // sparks running along three of the folds
    if (h > 0.08) [0, 2, 4].forEach((fi, i) => {
      const fold = FOLDS[fi], q = ((t * 0.55 + i * 0.37) % 1) * (fold.length - 1), j = Math.floor(q), a = fold[j], b = fold[Math.min(fold.length - 1, j + 1)], m = q - j;
      p.dot(f()([a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m]), 1.25 * h, 1);
    });
    // sparkles around it
    const k = clamp((h - 0.45) / 0.55);
    if (k > 0) ([[-18, 9], [17, 13], [20, -2]] as P2[]).forEach((q, i) => {
      const [x, y] = p.pt(f()(q)), r = k * (2.8 + 0.8 * Math.sin(t * 3.2 + i * 2.1));
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 0.8; g.lineCap = "round"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); });
    });
  },
};
