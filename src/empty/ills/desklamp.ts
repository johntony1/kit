// Nothing in the spotlight: a desk lamp with a jointed arm, switched off. Hover and it lights up, throwing a bright pool on the desk.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S2 = Math.SQRT1_2;
// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  if (v <= 0.02) return;
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a leg, an arm): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const along = (c: V3, k: V3, s: number): V3 => [c[0] + k[0] * s, c[1] + k[1] * s, c[2] + k[2] * s];
type Q = { d: number; pts: V3[]; f: number };
type Tone = [number, number, number]; // lit top, left, right
/** a turned solid on the axis from a towards b. prof: [distance along the axis, radius] pairs.
 *  Collects small quads, each in one of the three face tones; paint() draws them back to front */
function turned(out: Q[], a: V3, b: V3, prof: [number, number][], f: Tone = [0.22, 0.13, 0.065]) {
  const k = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const u = norm(cross(k, Math.abs(k[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), v = cross(k, u);
  const at = (s: number, r: number, g: number): V3 => { const c = Math.cos(g) * r, q = Math.sin(g) * r; return [a[0] + k[0] * s + u[0] * c + v[0] * q, a[1] + k[1] * s + u[1] * c + v[1] * q, a[2] + k[2] * s + u[2] * c + v[2] * q]; };
  for (let i = 0; i < prof.length - 1; i++) {
    const [s0, r0] = prof[i], [s1, r1] = prof[i + 1];
    const L = Math.hypot(s1 - s0, r1 - r0) || 1, nr = (s1 - s0) / L, nk = -(r1 - r0) / L;
    const M = Math.max(1, Math.ceil(L / 1.3)), N = Math.max(12, Math.ceil(Math.max(r0, r1) * 4.6));
    for (let m = 0; m < M; m++) {
      const sa = s0 + ((s1 - s0) * m) / M, sb = s0 + ((s1 - s0) * (m + 1)) / M, ra = r0 + ((r1 - r0) * m) / M, rb = r0 + ((r1 - r0) * (m + 1)) / M;
      for (let j = 0; j < N; j++) {
        const g0 = (j / N) * Math.PI * 2 - 0.01, g1 = ((j + 1) / N) * Math.PI * 2 + 0.01, g = (g0 + g1) / 2, c = Math.cos(g), s = Math.sin(g);
        const n: V3 = [(u[0] * c + v[0] * s) * nr + k[0] * nk, (u[1] * c + v[1] * s) * nr + k[1] * nk, (u[2] * c + v[2] * s) * nr + k[2] * nk];
        if (n[0] + n[1] + n[2] <= 0.02) continue; // faces away from us
        const mid = at((sa + sb) / 2, (ra + rb) / 2, g);
        out.push({ d: mid[0] + mid[1] + mid[2], pts: [at(sa, ra, g0), at(sa, ra, g1), at(sb, rb, g1), at(sb, rb, g0)], f: n[2] > 0.6 ? f[0] : n[1] > n[0] ? f[1] : f[2] });
      }
    }
  }
}
const paint = (p: Pen, q: Q[]) => q.sort((x, y) => x.d - y.d).forEach((s) => p.face(s.pts, s.f, 0));
/** a circle of radius r about the point c, square to the unit axis k */
const hoop = (c: V3, k: V3, r: number, n = 32): V3[] => {
  const u = norm(cross(k, Math.abs(k[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), v = cross(k, u);
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * r, y = Math.sin(a) * r; return [c[0] + u[0] * x + v[0] * y, c[1] + u[1] * x + v[1] * y, c[2] + u[2] * x + v[2] * y] as V3; });
};
export const desklamp: Illustration = {
  k: "desklamp", name: "Desk lamp", title: "Nothing in the spotlight", body: "Feature something and it will be shown here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-3, 3, -13);
    const R: V3 = [S2, -S2, 0];
    const B: V3 = [-8, 8, 0], J1: V3 = [-11, 11, 16], J2: V3 = [1, -1, 25 + 1.5 * e + h * Math.sin(t * 1.6) * 0.3];
    const kd = norm([S2 * 0.36 + 0.07, -S2 * 0.36 + 0.07, -0.9]);
    const M = along(J2, kd, 11), F = along(M, kd, M[2] / -kd[2]); // the shade's mouth, and where it points on the desk
    p.shadow(B[0], B[1], 14, 7, 0.11);
    // the pool of light and its beam
    if (e > 0.02) {
      p.disc(F[0], F[1], 0.02, 10.5, 0.1 + 0.3 * e, 0);
      const beam: V3[] = [along(M, R, -8), along(M, R, 8), along(F, R, 10.5), along(F, R, -10.5)];
      if (p.ink) { p.guide([beam[0], beam[3]], true); p.guide([beam[1], beam[2]], true); } else p.face(beam, 0.06 * e, 0);
    }
    // the base, the two arms and their joint
    p.cylinder(B[0], B[1], 0, 7, 2, { side: 0.13, top: 0.22 });
    rod(p, [[B[0], B[1], 2], J1], 1.6);
    rod(p, [J1, J2], 1.6);
    p.dot(J1, 1.5, 1);
    // the shade: a short neck flaring into a cone
    const a = along(J2, kd, -1.5);
    const q: Q[] = [];
    turned(q, a, M, [[0, 1.9], [3.2, 1.9], [3.2, 2.9], [12.5, 8]], [0.26, 0.16, 0.075]);
    paint(p, q);
    p.face(hoop(a, kd, 1.9), 0.22, SH.edge, 0.5);
    p.dot(J2, 1.3, 1);
  },
};
