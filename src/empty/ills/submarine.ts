// Nothing below the surface: a round submarine with a tall sail, lit portholes and a propeller. It drifts and bobs, the propeller turns and bubbles rise from its tail.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3;
type Q = { q: V3[]; f: number; d: number };
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mid = (q: V3[]): V3 => [q.reduce((s, v) => s + v[0], 0) / q.length, q.reduce((s, v) => s + v[1], 0) / q.length, q.reduce((s, v) => s + v[2], 0) / q.length];
const tone = (n: V3, T: number, L: number, R: number) => {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  if (n[2] / l > 0.5) return T;
  return R + (L - R) * Math.max(0, Math.min(1, Math.atan2(n[1], n[0]) / (Math.PI / 2)));
};
/** quads between rings of points, facing away from each ring's centre; only those facing us */
function skin(rings: V3[][], cs: V3[], f: (n: V3) => number, out: Q[]) {
  for (let i = 0; i + 1 < rings.length; i++) {
    const A = rings[i], B = rings[i + 1], o = mid([cs[i], cs[i + 1]]);
    for (let j = 0; j < A.length; j++) {
      const k = (j + 1) % A.length, q: V3[] = [A[j], B[j], B[k], A[k]], c = mid(q);
      let n = cross(sub(B[j], A[j]), sub(A[k], A[j]));
      const w = sub(c, o);
      if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) n = [-n[0], -n[1], -n[2]];
      if (n[0] + n[1] + n[2] > 1e-6) out.push({ q, f: f(n), d: c[0] + c[1] + c[2] });
    }
  }
}
const paint = (p: Pen, qs: Q[]) => qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
const R = 6.8;
// the hull's radius along its length: a round nose, a long body, a tapering tail
const rad = (x: number) => (x > 7 ? R * Math.sqrt(Math.max(0, 1 - ((x - 7) / 10) ** 2)) : x > -7 ? R : R * Math.max(0.12, 1 - ((-7 - x) / 13) ** 1.7));

export const submarine: Illustration = {
  k: "submarine", name: "Submarine", title: "Nothing below the surface", body: "Dive in and start something. What you find will surface here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, ph = u * Math.PI * 2;
    const bob = Math.sin(ph) * 1, pitch = Math.sin(ph + 1) * 0.035, yaw = -0.5;
    const X = ([x, y, z]: V3): V3 => {
      const x1 = x * Math.cos(pitch) - z * Math.sin(pitch), z1 = x * Math.sin(pitch) + z * Math.cos(pitch);
      return [x1 * Math.cos(yaw) - y * Math.sin(yaw), x1 * Math.sin(yaw) + y * Math.cos(yaw), z1 + bob];
    };
    p.translate(1, 0, -3);
    p.scale(1.12);
    p.push(); p.translate(0, 0, -14); p.shadow(0, 0, 26, 8, 0.09); p.pop();
    const qs: Q[] = [];
    // the propeller and the tail fins, behind the hull
    const tx = -20.3;
    p.box(...(() => { const c = X([tx + 0.6, 0, 0]); return [c[0] - 0.7, c[1] - 0.7, c[2] - 0.7, 1.4, 1.4, 1.4] as [number, number, number, number, number, number]; })(), { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
    for (let i = 0; i < 3; i++) {
      const a = ph * 2 + (i * Math.PI * 2) / 3, tip = X([tx, Math.cos(a) * 4.2, Math.sin(a) * 4.2]), hub = X([tx, 0, 0]);
      const [hx, hy] = p.pt(hub), [px, py] = p.pt(tip);
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.8; g.lineCap = "round"; g.beginPath(); g.moveTo(hx, hy); g.lineTo(px, py); g.stroke(); });
    }
    p.face([X([-19, 0, 0]), X([-14, 0, 0]), X([-12.5, 0, 8.5]), X([-16.5, 0, 8.5])], 0.14, 1, 0.5);
    p.face([X([-19, 0, 0]), X([-14, 0, 0]), X([-12.5, 0, -8.5]), X([-16.5, 0, -8.5])], 0.1, 1, 0.5);
    // the hull: rings along its length
    const xs = Array.from({ length: 39 }, (_, i) => -19.5 + i);
    xs.push(16.6, 16.9);
    const N = 32;
    skin(xs.map((x) => Array.from({ length: N }, (_, j) => { const a = (j / N) * Math.PI * 2, r = rad(x); return X([x, Math.cos(a) * r, Math.sin(a) * r]); })), xs.map((x) => X([x, 0, 0])), (n) => tone(n, 0.22, 0.13, 0.065), qs);
    paint(p, qs);
    // the side fin, the near one
    p.face([X([-17, R * 0.35, 0]), X([-13, R * 0.35, 0]), X([-14, 8.6, 0]), X([-17.2, 8.6, 0])], 0.24, 1, 0.5);
    // the sail on top, and its periscope
    const sail = (z: number) => Array.from({ length: 24 }, (_, j) => { const a = (j / 24) * Math.PI * 2; return X([-1.5 + Math.cos(a) * 4.6, Math.sin(a) * 1.9, z]); });
    skin([sail(4), sail(13.2)], [X([-1.5, 0, 4]), X([-1.5, 0, 13.2])], (n) => tone(n, 0.24, 0.13, 0.065), qs);
    paint(p, qs);
    p.face(sail(13.2), 0.24, 1, 0.55);
    p.face([X([-4.5, 1.9, 9.5]), X([-0.5, 1.9, 9.5]), X([-0.5, 1.9, 10.4]), X([-4.5, 1.9, 10.4])], 0.04, 0); // dive plane slot
    const sx = -3.6, [a0, a1] = [p.pt(X([sx, 0, 13])), p.pt(X([sx, 0, 18]))], a2 = p.pt(X([sx + 2.4, 0, 18]));
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(...a0); g.lineTo(...a1); g.lineTo(...a2); g.stroke(); });
    // three lit portholes along the near side
    for (const x of [-6, 0, 6]) {
      const [cx, cy] = p.pt(X([x, R * 0.72, R * 0.45]));
      p.screen((g) => { g.fillStyle = "#000"; g.beginPath(); g.arc(cx, cy, 2.2, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(cx, cy, 1.45, 0, Math.PI * 2); g.fill(); });
    }
    // bubbles rising from the tail
    for (let i = 0; i < 4; i++) {
      const v = (u + i / 4) % 1, q = X([tx + 1 + Math.sin(v * 9 + i) * 0.8, 0, 4 + v * 10]);
      const [bx, by] = p.pt([q[0], q[1], q[2] - bob]), r = 0.7 + v * 1.3, k = Math.sin(Math.PI * v);
      p.screen((g) => { g.strokeStyle = `rgba(255,255,255,${k.toFixed(3)})`; g.lineWidth = 0.9; g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.stroke(); });
    }
  },
};
