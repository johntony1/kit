// No reactions yet: a chunky thumbs up standing on a block. Hover and it hops up and gives a little pump, with sparkles.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = Math.SQRT1_2, K = 1 / 1.2247;
type P2 = [number, number];
// the hand in screen units (u right, v up), clockwise from the thumb's tip: thumb up on the left, fingers curled on the right
const HAND: P2[] = [
  [-4.6, 27], [-2.4, 27.2], [-0.8, 26], [-0.2, 23.5], [0.2, 19.5], [1.4, 16.4], [3.2, 15.2],
  [9.6, 15.2], [11.6, 14.4], [12.2, 13], [11.6, 11.6], [12.4, 10.4], [12.2, 8.6], [12.8, 7.4], [12.4, 5.6], [12.6, 4.4], [11.8, 2.8], [10.2, 2],
  [-5.4, 2], [-6.6, 3.2], [-7, 8], [-7, 13], [-6.6, 17], [-6.4, 21.5], [-6, 25.4],
];
const CUFF: P2[] = [[-13, 0.6], [-6.4, 0.6], [-6.4, 16.4], [-13, 16.4]];

/** a plane that looks at the viewer, turned by yaw: u right, v up, w toward us */
const at = (yaw: number, o: V3) => {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const e1: V3 = [S * c + S * s, -S * c + S * s, 0], e3: V3 = [S * c - S * s, S * c + S * s, 0];
  return (u: number, v: number, w: number): V3 => [o[0] + e1[0] * u * K + e3[0] * w, o[1] + e1[1] * u * K + e3[1] * w, o[2] + v];
};
const nrm = (a: V3, b: V3, c: V3) => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [-n[0] / l, -n[1] / l, -n[2] / l];
};
/** a flat shape cut from a slab D thick: its walls back to front, then its face */
function slab(p: Pen, pts: P2[], D: number, f: (u: number, v: number, w: number) => V3, front: number) {
  const walls: { q: V3[]; d: number; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const q: V3[] = [f(a[0], a[1], 0), f(b[0], b[1], 0), f(b[0], b[1], -D), f(a[0], a[1], -D)];
    const [nx, ny, nz] = nrm(q[0], q[1], q[2]);
    if (nx + ny + nz <= 0.02) continue;
    walls.push({ q, d: q.reduce((s, v) => s + v[0] + v[1] + v[2], 0), fill: nz > 0.45 ? 0.26 : ny > nx ? SH.left : SH.right });
  }
  walls.sort((a, b) => a.d - b.d).forEach((w) => p.face(w.q, w.fill, 0));
  p.face(pts.map(([u, v]) => f(u, v, 0)), front, 0);
  p.line([...pts, pts[0]].map(([u, v]) => f(u, v, 0.02)), SH.edge, 0.6);
}

export const thumbs: Illustration = {
  k: "thumbs", name: "Thumbs up", title: "No reactions yet", body: "When people react to your posts, you will see it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.scale(0.94);
    p.shadow(0, 0, 24, 11, 0.12);
    // the block: a lit top, a dense wall, a sparse wall
    const B = 9.5, BH = 6;
    p.box(-B, -B, 0, B * 2, B * 2, BH, { top: 0.2 });
    p.line([[-B + 1.4, B + 0.03, BH - 1.4], [B - 0.03, B + 0.03, BH - 1.4], [B + 0.03, -B + 1.4, BH - 1.4]], SH.edge, 0.55);
    // a hop, then a pump: it tips forward and back from the wrist while hovered
    const hop = Math.sin(Math.PI * Math.min(1, h)) * 5 + h * Math.max(0, Math.sin(t * 5)) * 1.6;
    const tip = h * Math.sin(t * 5) * 0.09;
    const o: V3 = [0.5, 0.5, BH + hop];
    p.push();
    p.rotate("y", tip, [0, 0, BH + hop]);
    p.rotate("x", -tip, [0, 0, BH + hop]);
    const f = (u: number, v: number, w: number) => at(-0.4, o)(u - 1.6, v, w);
    // the sleeve's cuff, then the hand in front of it
    slab(p, CUFF, 8, f, 0.14);
    p.line([f(-10.6, 1.4, 0.03), f(-10.6, 15.6, 0.03)], SH.edge, 0.6);
    slab(p, HAND, 6.5, f, 0.22);
    // the curled fingers and the thumb's crease and nail, cut
    for (const v of [11.6, 8.6, 5.6]) p.line([f(3.4, v, 0.03), f(11.8, v, 0.03)], SH.edge, 0.65);
    p.line([f(0.4, 15.6, 0.03), f(-1.6, 13.2, 0.03), f(-5.2, 12.6, 0.03)], SH.edge, 0.6);
    p.line([f(-4, 24.8, 0.03), f(-2, 24.8, 0.03)], SH.edge, 0.6);
    p.pop();
    // sparkles round it once it is up
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0) ([[-14, 6, 34], [10, -12, 40], [16, 4, 28], [-6, -14, 42]] as V3[]).forEach((q, i) => {
      const s = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7);
      p.dot(q, 0.7 + 0.6 * s, k);
    });
  },
};
