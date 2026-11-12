// Nothing has landed yet: an empty nest woven from twigs. Hover and a single feather drifts down and settles in it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const S2 = Math.SQRT1_2;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
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
// the outside radius of the nest at height z
const rOf = (z: number) => (z < 2.5 ? 8 + 1.6 * z : z < 5.5 ? 12 + 0.5 * (z - 2.5) : 13.5 - 0.12 * (z - 5.5));
// a feather standing in the plane that faces us: base at b, pointing along the angle g
function feather(p: Pen, b: V3, g: number, k: number) {
  const L = 14 * k, W = 3.4 * k, c = Math.cos(g), s = Math.sin(g);
  const at = (u: number, v: number): V3 => [b[0] + (c * u - s * v) * S2, b[1] - (c * u - s * v) * S2, b[2] + s * u + c * v];
  const N = 12, edge: V3[] = [];
  for (let i = 0; i <= N; i++) { const u = i / N; edge.push(at(L * (0.14 + 0.86 * u), Math.sin(Math.PI * Math.pow(u, 0.7)) * W)); }
  for (let i = N; i >= 0; i--) { const u = i / N; edge.push(at(L * (0.14 + 0.86 * u), -Math.sin(Math.PI * Math.pow(u, 0.7)) * W * 0.75)); }
  p.face(edge, 0.5, SH.edge, 0.5);
  p.line([at(L * 0.14, 0), at(L * 0.94, 0)], SH.edge, 0.6);
  glow(p, [at(0, 0), at(L * 0.16, 0)], 0.7);
}

export const nest: Illustration = {
  k: "nest", name: "Empty nest", title: "Nothing has landed yet", body: "Nothing has arrived so far. New arrivals will settle here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -8);
    p.scale(1.22);
    p.shadow(0, 0, 23, 11.5, 0.12);
    const O: V3 = [0, 0, 0], Z: V3 = [0, 0, 1];
    // the hollow: the far inside wall and the dark floor
    let q: Q[] = [];
    turned(q, O, Z, [[9, 10.6], [4.5, 7.6]], [0.12, 0.085, 0.05]);
    paint(p, q);
    p.disc(0, 0, 4.5, 7.6, 0.035, 0);
    // the outside wall and the rounded rim
    q = [];
    turned(q, O, Z, [[0, 8], [2.5, 12], [5.5, 13.5], [8, 13.2], [9.3, 12], [9, 10.6]], [0.24, 0.14, 0.07]);
    paint(p, q);
    // woven twigs: cuts across the wall, and loose ends poking out past the rim
    for (let i = 0; i < 22; i++) {
      const f = Math.PI / 4 + (rnd(i) - 0.5) * 2.7, z = 0.8 + rnd(i + 30) * 6, d = (rnd(i + 60) > 0.5 ? 1 : -1) * (0.22 + 0.2 * rnd(i + 90)), z1 = z + 1.1 + rnd(i + 120);
      p.line([[Math.cos(f) * (rOf(z) + 0.06), Math.sin(f) * (rOf(z) + 0.06), z], [Math.cos(f + d) * (rOf(z1) + 0.06), Math.sin(f + d) * (rOf(z1) + 0.06), z1]], SH.edge, 0.85);
    }
    for (let i = 0; i < 13; i++) {
      const f = (i / 13) * Math.PI * 2 + rnd(i + 7) * 0.4, d = rnd(i + 3) > 0.5 ? 0.3 : -0.3, r1 = 16 + 2.4 * rnd(i + 11);
      glow(p, [[Math.cos(f) * 12.6, Math.sin(f) * 12.6, 8.4], [Math.cos(f + d) * r1, Math.sin(f + d) * r1, 9.8 + 3 * rnd(i + 17)]], 0.9);
    }
    // the feather: rocks from side to side as it falls, then lies in the hollow
    if (h > 0.02) {
      const k = clamp(h * 1.1), fall = ease(k), sw = Math.sin(k * Math.PI * 3) * 5.5 * (1 - fall);
      feather(p, [(sw - 6) * S2, -(sw - 6) * S2, 24 - 17.5 * fall + h * Math.sin(t * 2) * 0.2 * fall], 0.8 - 0.45 * fall + sw * 0.09, Math.min(1, h * 5));
    }
  },
};
