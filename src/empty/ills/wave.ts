// Waving hand: an open hand on a cuffed wrist, waving side to side, with small swish marks at each end of the swing.
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

const P = 2.4; // seconds per loop
const PV = -8; // the turn's centre, at the bottom of the cuff
// the open hand, clockwise from the wrist: thumb out to the left, four fingers with stepped tops
const HAND: P2[] = [
  [-6, 0], [-6.6, 5.5], [-9, 8.5], [-13.4, 12.6], [-15.4, 16], [-14.8, 18.2], [-12.6, 18.2], [-9.8, 15.4], [-7.8, 14],
  [-7.8, 26.4], [-6.8, 28], [-4.9, 28], [-3.9, 26.8], [-3.9, 29.2], [-2.9, 30.6], [-1.1, 30.6], [-0.1, 29.2],
  [-0.1, 27.6], [0.9, 28.8], [2.7, 28.8], [3.7, 27.4], [3.7, 23.4], [4.7, 24.6], [6.6, 24.6], [7.6, 23.2],
  [7.6, 9], [6.8, 4], [6, 0],
];
const CUFF: P2[] = [[-7.6, -8], [-7.6, 0.6], [7.6, 0.6], [7.6, -8]];
const turn = (pts: P2[], a: number): P2[] => pts.map(([u, v]) => [u * Math.cos(a) - (v - PV) * Math.sin(a), PV + u * Math.sin(a) + (v - PV) * Math.cos(a)] as P2);

export const wave: Illustration = {
  k: "wave", name: "Waving hand", title: "Say hello", body: "Start a conversation. Your first message will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const s = Math.sin(((t / P) % 1) * Math.PI * 4), a = 0.24 * s; // two waves per loop
    p.translate(0, 0, -11);
    p.scale(0.9);
    p.shadow(0, 0, 20, 9, 0.12);
    const f = stand([0, 0, 0], -0.2);
    const on = (q: P2[]) => turn(q, a);
    slab(p, on(CUFF), f, 7.5, 0.13, 0.4);
    p.line(on([[-7.6, -1.6], [7.6, -1.6]]).map(([u, v]) => f(u, v, 0.43)), SH.edge, 0.6);
    slab(p, on(HAND), f, 5.5, 0.26);
    // the gaps between the fingers and a crease in the palm, cut
    for (const [u, v] of [[-3.9, 26.6], [-0.1, 27.4], [3.7, 23.2]]) p.line(on([[u, 16.5], [u, v]]).map(([x, y]) => f(x, y, 0.03)), SH.edge, 0.7);
    p.line(on([[-7, 13.4], [-4, 11], [-2.6, 7.4]]).map(([x, y]) => f(x, y, 0.03)), SH.edge, 0.6);
    // swish marks beside the fingertips, each side lighting as the hand swings to it
    p.screen((g) => {
      g.lineWidth = 1.2; g.lineCap = "round";
      for (const sgn of [1, -1]) {
        const k = Math.max(0, sgn * s);
        if (k < 0.05) continue;
        g.strokeStyle = `rgba(255,255,255,${k.toFixed(2)})`;
        for (const [rr, a0, a1] of [[33, 0.62, 0.86], [38.5, 0.56, 0.76]]) {
          g.beginPath();
          for (let i = 0; i <= 8; i++) {
            const b = sgn * (a0 + ((a1 - a0) * i) / 8);
            const [x, y] = p.pt(f(-rr * Math.sin(b), PV + rr * Math.cos(b), 0));
            if (i) g.lineTo(x, y); else g.moveTo(x, y);
          }
          g.stroke();
        }
      }
    });
  },
};
