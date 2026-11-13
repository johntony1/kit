// No points yet: a scatter plot standing up, two thick axes and a handful of bright round points. Hover and more points pop in, then a trend line draws through them.
import { type Illustration, type Pen, type V3 } from "../dots";

const facing = (p: Pen, q: V3[]) => {
  const s = q.map((v) => p.pt(v));
  let a = 0;
  for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; }
  return a;
};
const depth = (q: V3[]) => q.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / q.length;
/** a slab: the outline B pushed along d. The sides it shows are shaded by where they face, then the cap */
function prism(p: Pen, B: V3[], d: V3, cap: number) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < B.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  if (nx * d[0] + ny * d[1] + nz * d[2] < 0) B = B.slice().reverse();
  const F = B.map(([x, y, z]) => [x + d[0], y + d[1], z + d[2]] as V3);
  const sides = B.map((b, i) => [b, B[(i + 1) % B.length], F[(i + 1) % B.length], F[i]] as V3[]).filter((q) => facing(p, q) > 0).sort((a, b) => depth(a) - depth(b));
  for (const q of sides) {
    const e = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]];
    const n = [e[1] * d[2] - e[2] * d[1], e[2] * d[0] - e[0] * d[2], e[0] * d[1] - e[1] * d[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    p.face(q, n[2] / l > 0.55 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
const back = (x: number) => 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2);
const circ = (cu: number, cv: number, r: number, y: number): V3[] => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [cu + Math.cos(a) * r, y, cv + Math.sin(a) * r] as V3; });
const rect = (u0: number, v0: number, u1: number, v1: number, y: number): V3[] => [[u0, y, v0], [u1, y, v0], [u1, y, v1], [u0, y, v1]];
/** points [u, v, r]; the first six stand at rest, the rest pop in on hover */
const PTS: [number, number, number][] = [[-7.5, 9.5, 3.4], [-0.5, 15.5, 3], [6, 12, 3.6], [8.5, 23, 3.2], [-6.5, 21, 2.9], [14, 27, 3.3], [1.5, 6.5, 2.6], [14.5, 17, 2.7]];

export const scatter: Illustration = {
  k: "scatter", name: "Scatter plot", title: "No points yet", body: "Add some data and each record will land here as a point.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 1, 30, 12, 0.12);
    p.rotate("z", -0.42);
    // the axes: a thick upright bar and a thick base bar, lit
    prism(p, rect(-17, 0, -13.5, 31, -2), [0, 4, 0], 0.26);
    prism(p, rect(-13.5, 0, 18, 3.5, -2), [0, 4, 0], 0.26);
    p.line([[-13.5, 2.03, 3.5], [-13.5, 2.03, 31]], 1, 0.6);
    // the trend line, drawn left to right once the points are in
    const tr = Math.max(0, Math.min(1, (h - 0.55) / 0.4));
    if (tr > 0) {
      const a = p.pt([-11, 0, 5.5]), b = p.pt([17, 0, 28.5]);
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.lineCap = "round"; c.setLineDash([2.2, 2]);
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] + (b[0] - a[0]) * tr, a[1] + (b[1] - a[1]) * tr); c.stroke();
      });
    }
    // the points: bright beads with a dark rim
    PTS.forEach(([u, v, r], i) => {
      const k = i < 6 ? 1 : back(Math.min(1, Math.max(0, (h - (i - 6) * 0.14) / 0.45)));
      if (k < 0.02) return;
      p.push();
      p.scale(k, [u, 0, v]);
      prism(p, circ(u, v, r, -1.2), [0, 2.4, 0], 0.45);
      const o = circ(u, v, r, 1.23);
      p.line([...o, o[0]], 1, 0.6);
      p.pop();
    });
  },
};
