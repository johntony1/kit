// Nothing in sight: a pair of binoculars, its two big lenses towards us. Hover and it lifts, looks around and the lenses light up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
// a pop: grows past full size, then settles
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease(Math.min(1, (b - 0.65) / 0.35)));
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
export const binoculars: Illustration = {
  k: "binoculars", name: "Binoculars", title: "Nothing in sight", body: "Nothing has turned up yet. Check back soon or widen your search.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-2, -5, -10);
    p.shadow(0, 3, 26 - 4 * e, 12 - 2 * e, 0.11);
    const yaw = 0.42 + h * Math.sin(t * 1.3) * 0.14, pit = 0.06 + 0.2 * e;
    const k: V3 = [Math.sin(yaw) * Math.cos(pit), Math.cos(yaw) * Math.cos(pit), Math.sin(pit)];
    const w: V3 = [Math.cos(yaw), -Math.sin(yaw), 0];
    const up = cross(w, k);
    const C: V3 = [0, 0, 6.8 + 6 * e + h * Math.sin(t * 2) * 0.4];
    const barrel = (side: number) => {
      const c = along(C, w, side * 6.9), a = along(c, k, -11), b = along(c, k, 9);
      const q: Q[] = [];
      turned(q, a, b, [[0, 2.8], [3, 2.8], [3, 3.7], [8, 3.7], [11.5, 5.8], [11.5, 6.5], [20, 6.5]], [0.2, 0.11, 0.055]);
      paint(p, q);
      // the lens: a dark ring, then the lit glass with a glint cut across it
      p.face(hoop(b, k, 6.5), 0.035, SH.edge, 0.7);
      p.face(hoop(b, k, 4.9), 0.36 + 0.3 * e, 0);
      const g = along(along(b, k, 0.05), up, 0.6);
      p.line([along(g, w, -2.8), along(along(g, w, 0.2), up, 2.8)], SH.edge, 0.8);
    };
    barrel(-1);
    // the bridge and the focus wheel between the barrels
    const m = along(C, k, -2), wh = along(m, up, 2.4);
    const q: Q[] = [];
    turned(q, along(m, w, -5), along(m, w, 5), [[0, 2], [10, 2]]);
    turned(q, along(wh, k, -2.4), along(wh, k, 2.4), [[0, 2.6], [4.8, 2.6]], [0.3, 0.2, 0.1]);
    paint(p, q);
    p.face(hoop(along(wh, k, 2.4), k, 2.6), 0.22, SH.edge, 0.5);
    barrel(1);
    const s = pop(clamp((h - 0.6) / 0.4));
    spark(p, along(along(along(C, w, 9), k, 9), up, 9), 3 * s * (1 + 0.12 * Math.sin(t * 4)));
  },
};
