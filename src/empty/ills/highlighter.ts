// Highlighter: a chunky marker standing on a page of lines, a bright band started over one of them. Hover and it sweeps the band along the line.
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

const DU = Math.cos(1.08), DV = Math.sin(1.08); // the marker's lean, from the tip up the body
const at = (s: number, hw: number): P2 => [DU * s - DV * hw, DV * s + DU * hw];
const span = (q: [number, number][]): P2[] => [...q.map(([s, hw]) => at(s, hw)), ...q.slice().reverse().map(([s, hw]) => at(s, -hw))];
const TIP: P2[] = [at(0, 0.2), at(2.6, 2), at(4, 2), at(4, -2), at(1.4, -2)];
const NECK = span([[4, 2.8], [7.5, 4.6]]);
const BODY = span([[7.5, 5], [25, 5], [27, 4.2]]);
const LABEL = span([[12.5, 5.2], [19, 5.2]]);
const PZ = 0.9; // the top of the page

export const highlighter: Illustration = {
  k: "highlighter", name: "Highlighter", title: "Nothing highlighted", body: "Highlight a passage as you read and it will be collected here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const xe = -6 + 15 * easeInOut(h);
    p.translate(-3, 3, -10);
    p.shadow(0, 0, 29, 13, 0.1);
    p.box(-15, -11.5, 0, 30, 23, PZ, { top: 0.2 });
    // the band over the middle line, then the lines themselves
    p.face([[-12, -2.4, PZ + 0.02], [xe, -2.4, PZ + 0.02], [xe, 2.4, PZ + 0.02], [-12, 2.4, PZ + 0.02]], 0.62, 0);
    for (const [y, x1] of [[-6.5, 11], [0, 9], [6.5, 3]]) p.line([[-11, y, PZ + 0.04], [x1, y, PZ + 0.04]], SH.edge, 1.1);
    // the marker, standing on its chisel tip at the end of the band
    const f = stand([xe, 0, PZ], 0);
    slab(p, TIP, f, 2.4, 0.6, -1.8);
    slab(p, NECK, f, 5, 0.1, -0.5);
    slab(p, BODY, f, 6, 0.22);
    slab(p, LABEL, f, 6.2, 0.45, 0.1, 0);
  },
};
