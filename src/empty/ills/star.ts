// No reviews yet: a faceted star floating over a rating bar whose five stars are still empty. Hover and it hops and spins once, with a shine.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = Math.SQRT1_2, K = 1 / 1.2247;
type P2 = [number, number];
const R = 11, r = 4.8; // the big star: outer and inner radius
const STAR = (ro: number, ri: number): P2[] => Array.from({ length: 10 }, (_, i) => {
  const a = Math.PI / 2 - (i * Math.PI) / 5, q = i % 2 ? ri : ro;
  return [Math.cos(a) * q, Math.sin(a) * q] as P2;
});

/** a plane that looks at the viewer, turned by yaw. u right, v up, w toward the viewer */
const at = (yaw: number, z0: number) => {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const e1: V3 = [S * c + S * s, -S * c + S * s, 0], e3: V3 = [S * c - S * s, S * c + S * s, 0];
  return (u: number, v: number, w: number): V3 => [e1[0] * u * K + e3[0] * w, e1[1] * u * K + e3[1] * w, z0 + v];
};
const nrm = (a: V3, b: V3, c: V3) => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [-n[0] / l, -n[1] / l, -n[2] / l];
};

/** the star as a thick slab: walls back to front, then whichever face looks at us, cut into ten facets */
function bigStar(p: Pen, f: (u: number, v: number, w: number) => V3, D: number) {
  const pts = STAR(R, r);
  const walls: { q: V3[]; d: number; fill: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const a = pts[i], b = pts[(i + 1) % 10];
    const q: V3[] = [f(a[0], a[1], 0), f(b[0], b[1], 0), f(b[0], b[1], -D), f(a[0], a[1], -D)];
    const [nx, ny, nz] = nrm(q[0], q[1], q[2]);
    if (nx + ny + nz <= 0.02) continue;
    walls.push({ q, d: q.reduce((s, v) => s + v[0] + v[1] + v[2], 0), fill: nz > 0.4 ? 0.26 : ny > nx ? SH.left : SH.right });
  }
  walls.sort((a, b) => a.d - b.d).forEach((w) => p.face(w.q, w.fill, 0));
  // the face toward us
  const fn = nrm(f(0, 0, 0), f(1, 0, 0), f(0, 1, 0));
  const w = fn[0] + fn[1] + fn[2] > 0 ? 0 : -D;
  for (let i = 0; i < 10; i++) {
    const a = pts[i], b = pts[(i + 1) % 10];
    // facets, as if the middle were raised: lit where the outer edge faces the light, up and to the left
    const lit = -(b[1] - a[1]) * -1 + (b[0] - a[0]) * 1;
    p.face([f(0, 0, w), f(a[0], a[1], w), f(b[0], b[1], w)], lit < 0 ? 0.3 : 0.14, 0);
  }
  for (let i = 0; i < 10; i += 2) p.line([f(0, 0, w), f(pts[i][0], pts[i][1], w)], SH.edge, 0.6);
  p.line([...pts, pts[0]].map(([u, v]) => f(u, v, w)), SH.edge, 0.6);
}

export const star: Illustration = {
  k: "star", name: "Star", title: "No reviews yet", body: "Once people start rating, their reviews will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 26, 11, 0.1);
    // the rating bar: a lit slab with five empty star outlines cut into its top
    const BW = 15.5, BD = 5, BH = 4;
    p.box(-BW, -BD, 0, BW * 2, BD * 2, BH, { top: 0.2 });
    for (let i = 0; i < 5; i++) {
      const cx = -12 + i * 6, o = STAR(2.7, 1.15);
      p.line([...o, o[0]].map(([x, y]) => [cx + y * 0.95, -x * 0.95, BH + 0.03] as V3), SH.edge, 0.6);
    }
    // the big star: hops and turns once round while hovered, then bobs
    const hop = Math.sin(Math.PI * Math.min(1, h)) * 4 + h * Math.sin(t * 2.4) * 0.8;
    const yaw = -0.35 + h * Math.PI * 2;
    const z0 = BH + 7.5 + R + hop;
    bigStar(p, at(yaw, z0), 3.6);
    // a shine on the top point once it faces us again, and sparkles
    const k = Math.max(0, (h - 0.7) / 0.3);
    if (k > 0) {
      const tw = 0.5 + 0.5 * Math.sin(t * 4);
      const [sx, sy] = p.pt(at(yaw, z0)(-2.4, R - 3.2, 0.1));
      p.screen((c) => {
        const n = Math.round(255 * k), L = 2.2 + 1.6 * tw;
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.9; c.lineCap = "round";
        c.beginPath(); c.moveTo(sx - L, sy); c.lineTo(sx + L, sy); c.moveTo(sx, sy - L); c.lineTo(sx, sy + L); c.stroke();
      });
      ([[-12, 8, 30], [10, -12, 36], [14, 4, 22]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.4 * Math.sin(t * 3 + i * 2), k));
    }
  },
};
