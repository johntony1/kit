// Nothing discovered yet: a telescope on a tripod. Hover and it swings up towards the sky, where a star lights up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const S2 = Math.SQRT1_2;
// a pop: grows past full size, then settles
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease(Math.min(1, (b - 0.65) / 0.35)));
// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  if (v <= 0.02) return;
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a leg, an arm): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
// a four point sparkle, flat to the screen
const spark = (p: Pen, at: V3, r: number) => {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); });
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
export const telescope: Illustration = {
  k: "telescope", name: "Telescope", title: "Nothing discovered yet", body: "Keep exploring. What you find will be collected here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-3, 3, -15);
    p.shadow(0, 0, 24, 12, 0.11);
    // the tripod: the back leg first, then the two in front
    const feet: V3[] = [[-9, -9, 0], [12, -3, 0], [-3, 12, 0]];
    for (const f of feet) { rod(p, [[0, 0, 17], f], 1.4); p.dot(f, 1, 1); }
    p.box(-1.7, -1.7, 15.5, 3.4, 3.4, 3, { edge: 0 });
    // the tube: narrow eyepiece, wide lens, swinging up on hover
    const el = 0.26 + 0.44 * e + h * Math.sin(t * 1.5) * 0.03;
    const k: V3 = [S2 * Math.cos(el), -S2 * Math.cos(el), Math.sin(el)];
    const c: V3 = [0, 0, 22];
    const a = along(c, k, -11), b = along(c, k, 15);
    const q: Q[] = [];
    turned(q, a, b, [[0, 1.5], [3.5, 1.5], [3.5, 2.7], [12, 3], [12, 3.8], [23, 4.4], [23, 5.1], [26, 5.1]], [0.24, 0.14, 0.07]);
    paint(p, q);
    p.face(hoop(b, k, 5.1), 0.1, SH.edge, 0.6);
    p.face(hoop(b, k, 3.8), 0.28 + 0.3 * e, 0);
    // the star it finds
    const s = pop(clamp((h - 0.5) / 0.5));
    const st = along(c, k, 25);
    spark(p, [st[0], st[1], st[2] + 2], 3.8 * s * (1 + 0.12 * Math.sin(t * 4)));
    if (s > 0.3) { p.dot([st[0] - 6, st[1] + 6, st[2] + 3], 0.7, s); p.dot([st[0] - 2, st[1] + 2, st[2] - 6], 0.6, s); }
  },
};
