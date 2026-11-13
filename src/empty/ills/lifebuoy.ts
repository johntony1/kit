// No trips at sea: a striped lifebuoy with a rope round it, afloat. It bobs and rocks on the swell as ripples spread beneath it.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2;
type Q = { q: V3[]; f: number; d: number };
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mid = (q: V3[]): V3 => [q.reduce((s, v) => s + v[0], 0) / q.length, q.reduce((s, v) => s + v[1], 0) / q.length, q.reduce((s, v) => s + v[2], 0) / q.length];
const tone = (n: V3, T: number, L: number, R: number) => {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  if (n[2] / l > 0.55) return T;
  return R + (L - R) * Math.max(0, Math.min(1, Math.atan2(n[1], n[0]) / (Math.PI / 2)));
};
const glow = (p: Pen, pts: V3[], lw = 1.2) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const RR = 12.5, r = 4.6, NT = 48, NP = 16; // ring radius, tube radius, steps round each

export const lifebuoy: Illustration = {
  k: "lifebuoy", name: "Lifebuoy", title: "No trips at sea", body: "Book a crossing or a cruise and your trips at sea will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    const tilt = 0.42 + Math.sin(ph + 0.9) * 0.06, rock = Math.sin(ph) * 0.07, zc = 2 + Math.sin(ph) * 1.1;
    // the ring's plane: e1 across, e2 up the ring, nn its axis (toward us, tipped back)
    const h0: V3 = [Math.SQRT1_2 * Math.cos(rock), -Math.SQRT1_2 * Math.cos(rock), Math.sin(rock)];
    const nh: V3 = [Math.SQRT1_2, Math.SQRT1_2, 0];
    const e2: V3 = [-nh[0] * Math.sin(tilt), -nh[1] * Math.sin(tilt), Math.cos(tilt)];
    const e1 = h0, nn = cross(e2, e1);
    const P3 = (a: number, b: number): V3 => {
      const k = RR + r * Math.cos(b), c = Math.cos(a) * k, s = Math.sin(a) * k, w = r * Math.sin(b);
      return [e1[0] * c + e2[0] * s + nn[0] * w, e1[1] * c + e2[1] * s + nn[1] * w, zc + e1[2] * c + e2[2] * s + nn[2] * w];
    };
    p.translate(0, 0, -2);
    p.push(); p.translate(0, 0, -13); p.shadow(0, 0, 24, 9, 0.1);
    p.pop();
    // the tube: eight bands, light and dark in turn
    const qs: Q[] = [];
    for (let i = 0; i < NT; i++) {
      const a0 = (i / NT) * Math.PI * 2, a1 = ((i + 1) / NT) * Math.PI * 2, light = Math.floor((i / NT) * 8 + 0.5) % 2 === 0;
      const o: V3 = (() => { const c = Math.cos((a0 + a1) / 2) * RR, s = Math.sin((a0 + a1) / 2) * RR; return [e1[0] * c + e2[0] * s, e1[1] * c + e2[1] * s, zc + e1[2] * c + e2[2] * s]; })();
      for (let j = 0; j < NP; j++) {
        const b0 = (j / NP) * Math.PI * 2, b1 = ((j + 1) / NP) * Math.PI * 2;
        const q: V3[] = [P3(a0, b0), P3(a1, b0), P3(a1, b1), P3(a0, b1)], c = mid(q);
        let n = cross(sub(q[1], q[0]), sub(q[3], q[0]));
        const w = sub(c, o);
        if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) n = [-n[0], -n[1], -n[2]];
        if (n[0] + n[1] + n[2] > 1e-6) qs.push({ q, f: light ? tone(n, 0.4, 0.34, 0.24) : tone(n, 0.05, 0.045, 0.035), d: c[0] + c[1] + c[2] });
      }
    }
    qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
    // the rope: loops along the outer edge across the dark bands, tied at the light ones
    for (let k = 0; k < 4; k++) {
      const a0 = ((k * 2 + 0.75) / 8) * Math.PI * 2, a1 = ((k * 2 + 1.25) / 8) * Math.PI * 2 + Math.PI / 4;
      glow(p, Array.from({ length: 14 }, (_, i) => {
        const u = i / 13, a = a0 + (a1 - a0) * u, R = RR + r * 0.75 + 2 * Math.sin(Math.PI * u), c = Math.cos(a) * R, s = Math.sin(a) * R, w = r * 0.75;
        return [e1[0] * c + e2[0] * s + nn[0] * w, e1[1] * c + e2[1] * s + nn[1] * w, zc + e1[2] * c + e2[2] * s + nn[2] * w] as V3;
      }), 1.3);
    }
  },
};
