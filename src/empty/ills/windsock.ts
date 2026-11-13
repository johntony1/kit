// No flights yet: a fat striped windsock with three dark bands, out from the top of a solid pole. The wind fills it and a ripple runs down it, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.8;
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
const PX = -12, PY = 6, PH = 30, SL = 26, BANDS = 6; // the pole's foot, its height, the sock's length
const U: V3 = [0.92, -0.39, 0], V: V3 = [0.39, 0.92, 0]; // along the sock (to the right on screen), and across it toward us

export const windsock: Illustration = {
  k: "windsock", name: "Windsock", title: "No flights yet", body: "Book a flight and your trips will be listed here, ready for check in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 10, 0.1);
    // the pole on a small footing
    p.box(PX - 3.4, PY - 3.4, 0, 6.8, 6.8, 2, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    p.box(PX - 1.6, PY - 1.6, 2, 3.2, 3.2, PH + 1, { top: 0.3, left: 0.24, right: 0.1, edge: 0 });
    // the sock: rings along a centre line that droops and ripples in the wind
    const top: V3 = [PX, PY, PH - 4.2];
    const centre = (s: number): V3 => {
      const k = s / SL, w = Math.sin(ph * 2 - s * 0.32) * k;
      const droop = (1 + 0.5 * Math.sin(ph)) * k * k * 3;
      return [top[0] + U[0] * (s + 4.2) + V[0] * w * 1.1, top[1] + U[1] * (s + 4.2) + V[1] * w * 1.1, top[2] - droop + w * 0.8];
    };
    const r = (s: number) => (9 - 5 * (s / SL)) * (1 + 0.04 * Math.sin(ph * 2 - s * 0.32));
    const ss = Array.from({ length: 27 }, (_, i) => (i / 26) * SL), N = 30;
    const rings = ss.map((s) => { const c = centre(s), R = r(s); return Array.from({ length: N }, (_, j) => { const a = (j / N) * Math.PI * 2, x = Math.cos(a) * R, z = Math.sin(a) * R; return [c[0] + V[0] * x, c[1] + V[1] * x, c[2] + z] as V3; }); });
    const qs: Q[] = [];
    for (let i = 0; i + 1 < rings.length; i++) {
      const band = Math.floor(((ss[i] + ss[i + 1]) / 2 / SL) * BANDS) % 2, o = mid([centre(ss[i]), centre(ss[i + 1])]);
      const A = rings[i], B = rings[i + 1];
      for (let j = 0; j < N; j++) {
        const k = (j + 1) % N, q: V3[] = [A[j], B[j], B[k], A[k]], c = mid(q);
        let n = cross(sub(B[j], A[j]), sub(A[k], A[j]));
        const w = sub(c, o);
        if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) n = [-n[0], -n[1], -n[2]];
        if (n[0] + n[1] + n[2] > 1e-6) qs.push({ q, f: band ? tone(n, 0.075, 0.06, 0.045) : tone(n, 0.42, 0.32, 0.2), d: c[0] + c[1] + c[2] });
      }
    }
    qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
    // the hoop at its mouth, and the arm that ties it to the pole
    glow(p, rings[0].concat([rings[0][0]]), 1.4);
    glow(p, [[PX, PY, PH - 4.2], centre(0)], 1.8);
  },
};
