// Tennis racket: a racket leaning on its handle with a ball beside it. Hover and the ball starts to bounce while the racket tips towards it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const TAU = Math.PI * 2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slab(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? SH.top : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, 0);
}
const HZ = 31, RA = 11.5, RB = 9; // the head: its centre up the racket, half height, half width
const oval = (ka: number, kb: number, a0 = 0, a1 = TAU, n = 40): P2[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.sin(a) * RB * kb, HZ - Math.cos(a) * RA * ka] as P2; });
// handle, throat and the hoop, as one outline
const BODY: P2[] = [[-1.8, 0], [-1.8, 14.5], ...oval(1, 1, -0.7, -TAU + 0.7).slice(), [1.8, 14.5], [1.8, 0]];

export const racket: Illustration = {
  k: "racket", name: "Tennis racket", title: "No courts booked", body: "Book a court and your upcoming games will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(2, -2, -19);
    p.shadow(0, 0, 26, 12, 0.12);
    p.push();
    p.rotate("z", -0.5);
    p.rotate("y", 0.5 - 0.12 * e + h * Math.sin(t * 4.4) * 0.02, [-9, 0, 0]);
    p.translate(-9, 0, 0);
    slab(p, BODY, 0.8, 1.6, 0.3);
    // the strings: a sparse field inside the hoop, crossed with fine cuts
    const Y = 0.83;
    p.face(oval(0.82, 0.78).map(([x, z]) => [x, Y, z] as V3), 0.075, 0);
    for (let i = -3; i <= 3; i++) {
      const u = i * 1.9, w = RA * 0.82 * Math.sqrt(1 - Math.pow(u / (RB * 0.78), 2)), v = i * 2.5, q = RB * 0.78 * Math.sqrt(1 - Math.pow(v / (RA * 0.82), 2));
      p.line([[u, Y + 0.02, HZ - w], [u, Y + 0.02, HZ + w]], 0.5, 0.3);
      p.line([[-q, Y + 0.02, HZ + v], [q, Y + 0.02, HZ + v]], 0.5, 0.3);
    }
    // the open throat, and the grip wound round the handle
    p.clear([[0, Y, 15.6], [3.4, Y, 20.6], [-3.4, Y, 20.6]]);
    for (const z of [2.2, 4.6, 7, 9.4]) p.line([[-1.8, Y, z], [1.8, Y, z + 1.6]], SH.edge, 0.5);
    p.pop();
    // the ball: at rest on the floor, bouncing while hovered
    const up = h * Math.abs(Math.sin(t * 3.6)) * 13 + 2 * e * (1 - h);
    const C: V3 = [13, 9, 4.2 + up], r = 5.1;
    const disc = (q: number, du: number, dv: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * TAU, u = Math.cos(a) * q + du; return [C[0] + u * 0.5774, C[1] - u * 0.5774, C[2] + Math.sin(a) * q + dv] as V3; });
    p.shadow(13, 9, 9 - up * 0.25, 4.5 - up * 0.12, 0.1);
    p.face(disc(r, 0, 0), 0.13, 0);
    p.face(disc(r * 0.84, -r * 0.1, r * 0.1), 0.34, 0);
    // its seam
    const tw = h * t * 2;
    p.line(Array.from({ length: 15 }, (_, i) => { const a = -1.2 + (i / 14) * 2.4, u = Math.sin(a) * r * 0.92, v = (Math.cos(a) * 0.55 - 0.1) * r * Math.cos(tw); return [C[0] + u * 0.5774, C[1] - u * 0.5774, C[2] + v] as V3; }), SH.edge, 0.35);
  },
};
