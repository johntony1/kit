// Tape dispenser: a desk dispenser with a roll of tape and a strip running to its cutter. Hover and a length of tape pulls out as the roll turns.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

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

const BODY: P2[] = [[-17, 0], [-17, 9], [-14.5, 11.6], [3, 11.6], [10, 7.2], [15.5, 7.6], [18, 10.8], [19.2, 10.2], [19.2, 0]];
const RC: P2 = [-5.5, 15.5], RR = 9.2;
const circle = (r: number, n = 32): P2[] => Array.from({ length: n }, (_, i) => { const a = -(i / n) * Math.PI * 2; return [RC[0] + Math.cos(a) * r, RC[1] + Math.sin(a) * r] as P2; });

export const tape: Illustration = {
  k: "tape", name: "Tape dispenser", title: "Nothing taped together", body: "Join two or more items and the bundle will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L = 2.4 + 10.5 * easeInOut(h);
    p.translate(0, 0, -13);
    p.shadow(0, 0, 27, 12, 0.12);
    const g = stand([0, 0, 0], -0.32), f: F = (u, v, w) => g(u - 4, v, w);
    slab(p, BODY, f, 8, 0.15);
    // the roll, its core and hub
    slab(p, circle(RR), f, 5, 0.25, -1.5);
    p.line([...circle(5.6), circle(5.6)[0]].map(([u, v]) => f(u, v, -1.47)), SH.edge, 0.6);
    p.clear(circle(3).map(([u, v]) => f(u, v, -1.47)));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - L / 4;
      p.line([f(RC[0] + Math.cos(a) * 3.2, RC[1] + Math.sin(a) * 3.2, -1.46), f(RC[0] + Math.cos(a) * 5.4, RC[1] + Math.sin(a) * 5.4, -1.46)], SH.edge, 0.7);
    }
    // the strip from the roll to the cutter, then the free end pulled out past it
    slab(p, [[-3.2, 24.6], [18, 11.2], [18, 10.5], [-3.6, 23.9]], f, 5, 0.34, -1.5, 0);
    const b = 0.3 + h * Math.sin(t * 2.2) * 0.05, eu = 18 + L * Math.cos(b), ev = 10.85 + L * Math.sin(b);
    slab(p, [[18, 11.2], [eu, ev + 0.35], [eu, ev - 0.35], [18, 10.5]], f, 5, 0.5, -1.5, 0);
  },
};
