// No trips on the water: an empty kayak afloat with its paddle laid across the cockpit. It bobs on the water, the paddle rocks and ripples run out from the hull.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2;
type Q = { q: V3[]; f: number; d: number };
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const tone = (n: V3, T = 0.22, L = 0.13, R = 0.065) => {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  if (n[2] / l > 0.55) return T;
  return R + (L - R) * Math.max(0, Math.min(1, Math.atan2(n[1], n[0]) / (Math.PI / 2)));
};
const glow = (p: Pen, pts: V3[], lw = 1.2, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const HL = 24, HW = 7; // half length, half beam
// the hull's outline at a height: pointed at both ends, s shrinks it toward the keel
const lens = (s: number, z: number, n = 48): V3[] => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, c = Math.cos(a);
  return [HL * c * (0.92 + 0.08 * s), HW * s * Math.sin(a) * Math.pow(1 - c * c, 0.25), z] as V3;
});

export const kayak: Illustration = {
  k: "kayak", name: "Kayak", title: "No trips on the water", body: "Book a paddle or log a trip and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    const bob = Math.sin(ph) * 0.9, roll = Math.sin(ph + 0.8) * 0.06, yaw = 0.12;
    // the hull's own frame: roll about its length, turn, then bob
    const X = ([x, y, z]: V3): V3 => {
      const y1 = y * Math.cos(roll) - z * Math.sin(roll), z1 = y * Math.sin(roll) + z * Math.cos(roll);
      return [x * Math.cos(yaw) - y1 * Math.sin(yaw), x * Math.sin(yaw) + y1 * Math.cos(yaw), z1 + bob];
    };
    p.translate(0, 0, -4);
    p.shadow(0, 0, 30, 14, 0.1);
    // ripples running out from the hull
    for (const k of [0, 0.5]) {
      const u = ((t / P) * 2 + k) % 1, s = 0.55 + 0.4 * u;
      glow(p, Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return X([Math.cos(a) * HL * s, Math.sin(a) * (HW + 2 + 5 * u), -bob - 2.4]); }), 1, 0.85 * Math.sin(Math.PI * u));
    }
    // the hull: sides from the keel up to the deck edge, then the deck
    const lo = lens(0.55, -2.4).map(X), hi = lens(1, 2.2).map(X), qs: Q[] = [];
    for (let j = 0; j < lo.length; j++) {
      const k = (j + 1) % lo.length, q = [lo[j], lo[k], hi[k], hi[j]];
      const n = cross(sub(lo[k], lo[j]), sub(hi[j], lo[j]));
      const m = q.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / 4;
      if (n[0] + n[1] + n[2] > 0) qs.push({ q, f: tone(n, 0.22, 0.14, 0.07), d: m });
    }
    qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
    p.face(lens(1, 2.2).map(X), 0.22, 1, 0.6);
    p.line([X([-HL * 0.95, 0, 2.25]), X([-9, 0, 2.25])], 1, 0.5);
    p.line([X([9, 0, 2.25]), X([HL * 0.95, 0, 2.25])], 1, 0.5);
    // the cockpit: a bright rim round a dark opening
    const oval = (rx: number, ry: number, z: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return X([-1 + Math.cos(a) * rx, Math.sin(a) * ry, z]); });
    p.face(oval(8, 4.8, 2.6), 0.42, 0);
    p.clear(oval(6.5, 3.5, 2.65));
    // the paddle across the cockpit, rocking: a bright shaft and two flat blades
    const a = Math.sin(ph * 2) * 0.22, c = X([-1, 0, 4.2]);
    const d = X([Math.sin(a) * 0.3, Math.cos(a), Math.sin(a) * 1.1]); // a direction (bob shifts z, take it off)
    const dir: V3 = [d[0], d[1], d[2] - bob];
    const at = (s: number): V3 => [c[0] + dir[0] * s, c[1] + dir[1] * s, c[2] + dir[2] * s];
    const blade = (s0: number) => {
      const sg = Math.sign(s0), u: V3 = [Math.cos(yaw), Math.sin(yaw), 0];
      const pts = Array.from({ length: 20 }, (_, i) => {
        const b = (i / 20) * Math.PI * 2, q = at(s0 + sg * (2.8 + Math.cos(b) * 3)), w = Math.sin(b) * 1.8;
        return [q[0] + u[0] * w, q[1] + u[1] * w, q[2]] as V3;
      });
      p.face(pts, 0.34, 1, 0.5);
    };
    blade(-12);
    glow(p, [at(-12.5), at(12.5)], 2);
    blade(12);
  },
};
