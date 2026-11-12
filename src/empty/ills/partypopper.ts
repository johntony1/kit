// You are all set: a striped party popper resting on its tip. Hover and it kicks back as confetti and streamers burst out.
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
export const partypopper: Illustration = {
  k: "partypopper", name: "Party popper", title: "You are all set", body: "Everything is done. New things to do will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h), out = 1 - Math.pow(1 - clamp(h * 1.25), 3);
    p.translate(-3, 3, -16);
    p.shadow(-3, 3, 20, 10, 0.11);
    const el = 0.9;
    const k = norm([S2 * Math.cos(el) - 0.2, -S2 * Math.cos(el) - 0.2, Math.sin(el)]);
    const u = norm(cross(k, [0, 0, 1])), v = cross(k, u);
    const kick = Math.sin(Math.PI * clamp(h * 1.6)) * 1.6;
    const a = along([-6, 10, 1.2], k, -kick), b = along(a, k, 24);
    // two pieces left on the floor
    p.face([[6, 6, 0.05], [8.4, 6.6, 0.05], [7.8, 9, 0.05], [5.4, 8.4, 0.05]], 0.28, SH.edge, 0.5);
    p.dot([-1, 13, 0.3], 0.9, 1);
    // the cone, in five bands
    const q: Q[] = [];
    const r = (s: number) => 0.4 + (s / 24) * 9.6;
    for (let i = 0; i < 5; i++) turned(q, a, b, [[i * 4.8, r(i * 4.8)], [i * 4.8 + 4.8, r(i * 4.8 + 4.8)]], i % 2 ? [0.4, 0.34, 0.2] : [0.16, 0.09, 0.045]);
    paint(p, q);
    const mouth = hoop(b, k, 10);
    p.face(mouth, 0.04, 0);
    glow(p, [...mouth, mouth[0]], 0.9);
    if (out < 0.04) return;
    // streamers
    for (const s of [-1, 1]) glow(p, Array.from({ length: 22 }, (_, j) => {
      const f = j / 21, far = f * 17 * out, lat = s * (5 * f + Math.sin(f * 9 + t * 2 * h) * 1.5) * out;
      return [b[0] + k[0] * far + u[0] * lat, b[1] + k[1] * far + u[1] * lat, b[2] + k[2] * far + u[2] * lat - 5 * f * f * e] as V3;
    }), 0.9);
    // confetti: dots and little squares that turn as they fly
    for (let i = 0; i < 16; i++) {
      const ph = rnd(i) * Math.PI * 2, sp = 0.35 + 0.75 * rnd(i + 20), far = (6 + 12 * rnd(i + 40)) * out;
      const d = norm([k[0] + (u[0] * Math.cos(ph) + v[0] * Math.sin(ph)) * sp, k[1] + (u[1] * Math.cos(ph) + v[1] * Math.sin(ph)) * sp, k[2] + (u[2] * Math.cos(ph) + v[2] * Math.sin(ph)) * sp]);
      const c: V3 = [b[0] + d[0] * far, b[1] + d[1] * far, b[2] + d[2] * far - 5 * e * e * rnd(i + 60)];
      if (i % 3 === 0) { p.dot(c, 1.2, 1); continue; }
      const g = rnd(i + 80) * 6 + t * (1.5 + rnd(i)) * h, ca = Math.cos(g) * 2.1, sa = Math.sin(g) * 2.1;
      p.face([[c[0] + ca * S2, c[1] - ca * S2, c[2] + sa], [c[0] - sa * S2, c[1] + sa * S2, c[2] + ca], [c[0] - ca * S2, c[1] + ca * S2, c[2] - sa], [c[0] + sa * S2, c[1] - sa * S2, c[2] - ca]], i % 2 ? 0.4 : 0.22, SH.edge, 0.5);
    }
  },
};
