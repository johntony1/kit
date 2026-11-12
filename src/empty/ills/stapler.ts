// Stapler: a desk stapler seen from the side, its arm raised over a sheet of paper. Hover and the arm presses down and springs back, leaving a staple.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
type P2 = [number, number];
type F = (u: number, v: number, w: number) => V3;
const S = Math.SQRT1_2, K = 1 / 1.2247;
/** a plane standing up and turned by yaw: u right, v up (both in screen dots), w toward us */
const stand = (o: V3, yaw = 0): F => {
  const c = Math.cos(yaw), s = Math.sin(yaw), ax = S * c + S * s, ay = S * s - S * c, bx = S * c - S * s, by = S * c + S * s;
  return (u, v, w) => [o[0] + ax * u * K + bx * w, o[1] + ay * u * K + by * w, o[2] + v];
};
const nrm = (a: V3, b: V3, c: V3) => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [-n[0] / l, -n[1] / l, -n[2] / l];
};
/** a clockwise outline cut from a slab D thick, its face at w0: the walls back to front, then the face */
function slab(p: Pen, pts: P2[], f: F, D: number, front: number, w0 = 0, lw = 0.6) {
  const walls: { q: V3[]; d: number; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const q: V3[] = [f(a[0], a[1], w0), f(b[0], b[1], w0), f(b[0], b[1], w0 - D), f(a[0], a[1], w0 - D)];
    const [nx, ny, nz] = nrm(q[0], q[1], q[2]);
    if (nx + ny + nz <= 0.02) continue;
    walls.push({ q, d: q.reduce((s, v) => s + v[0] + v[1] + v[2], 0), fill: nz > 0.45 ? 0.26 : ny > nx ? SH.left : SH.right });
  }
  walls.sort((a, b) => a.d - b.d).forEach((w) => p.face(w.q, w.fill, 0));
  p.face(pts.map(([u, v]) => f(u, v, w0)), front, 0);
  if (lw) p.line([...pts, pts[0]].map(([u, v]) => f(u, v, w0 + 0.02)), SH.edge, lw);
}

const HX = -15, HV = 7.5; // the hinge
const BASE: P2[] = [[-19, 0], [-19, 2.6], [17.5, 2.6], [19, 1.4], [19, 0]];
const POST: P2[] = [[-19, 2.6], [-19, 9.5], [-17.5, 11], [-12.5, 11], [-11.5, 9.5], [-11.5, 2.6]];
const TRAY: P2[] = [[-13, 4.6], [-13, 6.4], [17, 6.4], [17, 4.6]];
const COVER: P2[] = [[-18, 6.2], [-18, 10.5], [-15, 12.6], [8, 12.6], [15, 11], [18.5, 8.4], [18.5, 6.2]];
const turn = (pts: P2[], a: number): P2[] => pts.map(([u, v]) => [HX + (u - HX) * Math.cos(a) - (v - HV) * Math.sin(a), HV + (u - HX) * Math.sin(a) + (v - HV) * Math.cos(a)] as P2);

export const stapler: Illustration = {
  k: "stapler", name: "Stapler", title: "Nothing attached", body: "Attach a file and it will be kept here with the rest.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // the arm's angle: open at rest, pressed at the middle of the hover, open again
    const press = h < 0.45 ? easeInOut(h / 0.45) : 1 - easeInOut(clamp((h - 0.45) / 0.4));
    const a = 0.3 - 0.36 * press;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 28, 12, 0.11);
    const g = stand([0, 0, 0], -0.34), f: F = (u, v, w) => g(u - 1, v, w);
    slab(p, BASE, f, 9, 0.16);
    // a sheet of paper lying over the front of the base, and the staple left in it
    slab(p, [[4, 2.6], [4, 3.4], [25, 3.4], [25, 2.6]], f, 17, 0.2, 5, 0);
    if (h > 0.45) p.face([f(13, 3.43, -1.8), f(14.6, 3.43, -1.8), f(14.6, 3.43, -7.2), f(13, 3.43, -7.2)], 0.95, 0);
    slab(p, POST, f, 8, 0.13, -0.5);
    slab(p, turn(TRAY, a), f, 6, 0.05, -1.5);
    slab(p, turn(COVER, a), f, 9, 0.24);
    p.line(turn([[-13, 9.2], [12, 9.2]], a).map(([u, v]) => f(u, v, 0.03)), SH.edge, 0.7);
    p.dot(f(HX, HV + 1.2, 0.03), 0.9, 0);
  },
};
