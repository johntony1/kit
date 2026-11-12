// Scissors: a pair of scissors standing open across a dashed cut line. Hover and they snip shut and ease open again, and the line parts where they cut.
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

// one arm, its pivot at the origin: the blade runs right, the shank back to a ring handle
const ARM: P2[] = [[-8, -0.2], [-2, 2.8], [20, 0.6], [19.4, -1], [-2, -2.8], [-8, -4.6]];
const RC: P2 = [-12.6, -4];
const RING: P2[] = [
  ...Array.from({ length: 25 }, (_, i) => { const a = -(i / 24) * Math.PI * 2; return [RC[0] + Math.cos(a) * 6.6, RC[1] + Math.sin(a) * 6.6] as P2; }),
  ...Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [RC[0] + Math.cos(a) * 3, RC[1] + Math.sin(a) * 3] as P2; }),
];
const PV = 19; // the pivot's height
/** stand an outline on its end, turned by a; flip it over first for the second arm */
const place = (pts: P2[], a: number, flip: boolean): P2[] => {
  const b = Math.PI / 2 + a;
  const q = pts.map(([u, v]) => { const w = flip ? -v : v; return [u * Math.cos(b) - w * Math.sin(b), PV + u * Math.sin(b) + w * Math.cos(b)] as P2; });
  return flip ? q.reverse() : q;
};

export const scissors: Illustration = {
  k: "scissors", name: "Scissors", title: "Nothing clipped", body: "Clip a part of any page and it will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const th = 0.42 - 0.38 * easeInOut(clamp(h / 0.5)) + 0.22 * easeInOut(clamp((h - 0.58) / 0.42));
    const cut = easeInOut(clamp((h - 0.4) / 0.5));
    p.translate(0, 0, -20);
    p.shadow(0, 0, 22, 10, 0.12);
    const f = stand([0, 0, 0], -0.25);
    // the cut line behind the blades: dashes, the right part dropping away once it is cut
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.1; g.setLineDash([2.4, 2.2]);
      const seg = (u0: number, v0: number, u1: number, v1: number) => { const [x0, y0] = p.pt(f(u0, v0, -2)), [x1, y1] = p.pt(f(u1, v1, -2)); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
      seg(-24, 30, 0, 30); seg(0.5 + cut, 30 - 2 * cut, 24, 30 - 8 * cut);
    });
    // the back arm, then the front one over it
    slab(p, place(RING, -th, true), f, 1.8, 0.3, -1.8);
    slab(p, place(ARM, -th, true), f, 1.8, 0.36, -1.8);
    slab(p, place(RING, th, false), f, 1.8, 0.3);
    slab(p, place(ARM, th, false), f, 1.8, 0.46);
    p.dot(f(0, PV, 0.05), 1, 0);
  },
};
