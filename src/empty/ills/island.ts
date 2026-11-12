// Nothing on the horizon: a tiny desert island with a single palm. The palm sways and ripples spread out across the water.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S2 = Math.SQRT1_2;
// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  if (v <= 0.02) return;
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
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
const P = 3.6; // seconds per loop
const ring = (r: number, z: number, n = 48): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const island: Illustration = {
  k: "island", name: "Desert island", title: "Nothing on the horizon", body: "Nothing is coming up yet. What you plan will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 25, 12.5, 0.08);
    p.disc(0, 0, 0, 19, 0.05, 0); // the sea
    // ripples spreading from the shore
    for (let i = 0; i < 2; i++) { const f = (u + i / 2) % 1; glow(p, ring(10.5 + 8 * f, 0.02), 0.7, 0.9 * Math.sin(f * Math.PI)); }
    // the sand: a low mound
    const q: Q[] = [];
    turned(q, [0, 0, 0], [0, 0, 1], [[0, 9.5], [1.4, 8.7], [2.8, 6.9], [3.7, 4.2], [4.1, 0.05]], [0.24, 0.15, 0.08]);
    paint(p, q);
    glow(p, ring(9.5, 0.03), 0.6, 0.85);
    // the palm: a leaning trunk
    const sway = Math.sin(w) * 0.9;
    const trunk: V3[] = Array.from({ length: 9 }, (_, i) => { const f = i / 8, l = -2.5 + (6 + sway) * f * f; return [l * S2, -l * S2, 3.6 + 24 * f] as V3; });
    const tq: Q[] = [];
    for (let i = 0; i < 8; i++) turned(tq, trunk[i], trunk[i + 1], [[-0.2, 1.9 - 0.09 * i], [3.4, 1.8 - 0.09 * i]], [0.34, 0.24, 0.1]);
    paint(p, tq);
    for (let i = 1; i < 8; i++) { const c = trunk[i], r = 1.95 - 0.09 * i; p.line([[c[0] - r * 0.3, c[1] + r, c[2]], [c[0] + r * 0.8, c[1] + r * 0.8, c[2] - 0.3], [c[0] + r, c[1] - r * 0.3, c[2]]], SH.edge, 0.5); }
    // the fronds: arching out from the crown and drooping, far ones first
    const K = trunk[8];
    Array.from({ length: 6 }, (_, i) => i).map((i) => ({ i, a: (i / 6) * Math.PI * 2 + 0.25 })).sort((a, b) => Math.cos(a.a) + Math.sin(a.a) - Math.cos(b.a) - Math.sin(b.a)).forEach(({ i, a }) => {
      const cx = Math.cos(a), cy = Math.sin(a), N = 10, L = 14.5, lift = Math.sin(w + i * 0.9) * 0.9;
      const mid = (f: number): V3 => [K[0] + cx * L * f, K[1] + cy * L * f, K[2] + 6 * f - (9 - lift) * f * f];
      const side = (f: number, s: number): V3 => { const m = mid(f), wd = Math.sin(Math.PI * Math.pow(f, 0.75)) * 2.3 * s; return [m[0] - cy * wd, m[1] + cx * wd, m[2] - Math.abs(wd) * 0.35]; };
      const edge: V3[] = [];
      for (let j = 0; j <= N; j++) edge.push(side(j / N, 1));
      for (let j = N; j >= 0; j--) edge.push(side(j / N, -1));
      p.face(edge, cx + cy < -0.2 ? 0.13 : i % 2 ? 0.26 : 0.2, SH.edge, 0.5);
      p.line(Array.from({ length: N }, (_, j) => mid((j + 0.5) / N)), SH.edge, 0.5);
    });
    p.dot([K[0] + 1, K[1] + 1, K[2] - 1.2], 1.3, 0.7);
  },
};
