// Resume: a page with a portrait, a name and lines of experience, a second sheet behind it. Hover and the page lifts, the sheet fans out and a tick pops in.
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
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35));
// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.04); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

const W = 13, T = 35; // half width and height of the page
const SHEET: P2[] = [[-W, 0], [-W, T], [W, T], [W, 0]];
const turn = (pts: P2[], a: number): P2[] => pts.map(([u, v]) => [W + (u - W) * Math.cos(a) - v * Math.sin(a), (u - W) * Math.sin(a) + v * Math.cos(a)] as P2);

export const resume: Illustration = {
  k: "resume", name: "Resume", title: "No applications yet", body: "Apply to a role and your application will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = easeInOut(clamp(h / 0.6)), lift = 3 * e;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 23 - lift, 10 - lift * 0.4, 0.12);
    const g = stand([0, 0, 0], -0.28), f: F = (u, v, w) => g(u, v + lift, w);
    // the sheet behind, fanning out to the left
    slab(p, turn(SHEET, 0.05 + 0.13 * e), f, 0.8, 0.13, -1.4);
    slab(p, SHEET, f, 0.8, 0.22);
    const on = (u: number, v: number) => f(u, v, 0.03);
    // the portrait: a dark window with a head and shoulders
    p.face([on(-10, 22.5), on(-2, 22.5), on(-2, 31.5), on(-10, 31.5)], 0.03, 0);
    p.face(Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return f(-6 + Math.cos(a) * 3.1, 22.6 + Math.sin(a) * 3.3, 0.05); }), 0.6, 0);
    p.dot(f(-6, 28.4, 0.06), 1.75, 1);
    // the name beside it, then the experience below
    p.line([on(1, 29.6), on(10, 29.6)], SH.edge, 1.5);
    p.line([on(1, 25.4), on(7, 25.4)], SH.edge, 0.9);
    for (const [v, u1] of [[18, 10], [14.5, 10], [11, 4], [6.5, 10], [3, 6]]) p.line([on(-10, v), on(u1, v)], SH.edge, 0.9);
    const b = clamp((h - 0.6) / 0.4);
    if (b > 0) badge(p, f(W - 0.5, T - 1, 1.5), 5 * pop(b));
  },
};
