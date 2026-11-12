// Fountain pen: a fountain pen standing on its nib at the start of a written flourish. Hover and it writes the line out in loops across the floor.
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

const DU = Math.cos(1.0), DV = Math.sin(1.0); // the pen's lean, from the nib up the barrel
/** a point s along the pen from its tip and hw to the side of its axis */
const at = (s: number, hw: number): P2 => [DU * s - DV * hw, DV * s + DU * hw];
const span = (q: [number, number][]): P2[] => [...q.map(([s, hw]) => at(s, hw)), ...q.slice().reverse().map(([s, hw]) => at(s, -hw))];
const NIB = span([[0, 0.25], [6, 3], [8.5, 2.2]]);
const GRIP = span([[8.5, 2.5], [13, 3.1]]);
const BAND = span([[13, 3.6], [14.6, 3.6]]);
const BARREL = span([[14.6, 3.5], [30, 3.5], [32.6, 2.9], [33.8, 1.6]]);
// the written line on the floor: cursive loops running to the right
const path = (s: number): V3 => {
  const u = -21 + 25 * s - 1.5 * Math.sin(Math.PI * 8 * s), v = 2.3 * Math.cos(Math.PI * 8 * s) - 2.3;
  return [S * u - S * v, 3 - S * u - S * v, 0];
};

export const pen: Illustration = {
  k: "pen", name: "Fountain pen", title: "Nothing written yet", body: "Start writing and your words will be saved here as you go.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = 0.2 + 0.8 * easeInOut(h);
    const tip = path(k);
    p.translate(0, 0, -11);
    p.shadow(tip[0] + 3, tip[1] - 3, 16, 7, 0.1);
    // the ink: a bright stroke on the floor, up to where the nib is
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath();
      const n = Math.max(2, Math.round(120 * k));
      for (let i = 0; i <= n; i++) { const [x, y] = p.pt(path((i / n) * k)); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    });
    // the pen: nib, grip, a bright band, the barrel
    const f = stand([tip[0], tip[1], h * (0.3 + 0.3 * Math.sin(t * 9))], 0);
    slab(p, NIB, f, 1.6, 0.5, -1.7);
    p.line([f(...at(1, 0), -1.67), f(...at(4.6, 0), -1.67)], SH.edge, 0.7);
    p.dot(f(...at(5.4, 0), -1.66), 0.75, 0);
    slab(p, GRIP, f, 5, 0.1);
    slab(p, BARREL, f, 5.6, 0.22, 0.3);
    slab(p, BAND, f, 5.8, 0.5, 0.4, 0);
  },
};
