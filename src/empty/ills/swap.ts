// Swap arrows: two thick arrows standing one over the other, pointing opposite ways. They slide past each other and back, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

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

const P = 3; // seconds per loop
/** a thick arrow centred on (cu, cv), pointing right (dir 1) or left (dir -1) */
const arrow = (cu: number, cv: number, dir: number): P2[] => {
  const q = ([[-15, 3.2], [4, 3.2], [4, 8], [15, 0], [4, -8], [4, -3.2], [-15, -3.2]] as P2[]).map(([u, v]) => [cu + u * dir, cv + v] as P2);
  return dir > 0 ? q : q.reverse();
};

export const swap: Illustration = {
  k: "swap", name: "Swap arrows", title: "No transactions yet", body: "Money you send, receive or swap will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const s = Math.sin(((t / P) % 1) * Math.PI * 2);
    p.translate(0, 0, -19);
    p.shadow(0, 0, 27, 11, 0.11);
    const f = stand([0, 0, 0], -0.3);
    slab(p, arrow(-2 - 4 * s, 12, -1), f, 6, 0.2);
    slab(p, arrow(2 + 4 * s, 29.5, 1), f, 6, 0.28);
  },
};
