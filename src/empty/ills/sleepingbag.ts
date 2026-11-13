// No camping trips: a fat sleeping bag rolled up tight, two dark straps round it and a quilted spiral on its end. Hover and the near strap works loose: it slackens, its buckle opens and its tail drops.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const tone = (n: V3, T: number, L: number, R: number) => {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  if (n[2] / l > 0.55) return T;
  return R + (L - R) * Math.max(0, Math.min(1, Math.atan2(n[1], n[0]) / (Math.PI / 2)));
};
const R0 = 11, HY = 11, N = 40, ZC = R0; // radius, half length, points round it, axis height
const circ = (r: number, y: number): V3[] => Array.from({ length: N }, (_, j) => { const a = (j / N) * Math.PI * 2; return [Math.cos(a) * r, y, ZC + Math.sin(a) * r] as V3; });
// the round side of the roll from y0 to y1: only the strips facing us
function roll(p: Pen, r: number, y0: number, y1: number, T: number, L: number, R: number) {
  const A = circ(r, y0), B = circ(r, y1);
  for (let j = 0; j < N; j++) {
    const k = (j + 1) % N, a = ((j + 0.5) / N) * Math.PI * 2, n: V3 = [Math.cos(a), 0, Math.sin(a)];
    if (n[0] + n[2] <= -0.2) continue;
    p.face([A[j], A[k], B[k], B[j]], tone(n, T, L, R), 0);
  }
}

export const sleepingbag: Illustration = {
  k: "sleepingbag", name: "Sleeping bag", title: "No camping trips", body: "Plan a trip outdoors and your campsites and kit lists will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(seg(h, 0, 0.6)), d = ease(seg(h, 0.4, 1));
    p.translate(0, -1, -12);
    p.shadow(0, 0, 30, 14, 0.12);
    // the roll's round side, lit on top
    roll(p, R0, -HY, HY, 0.24, 0.13, 0.07);
    // quilting seams along the roll
    for (const a of [Math.PI * 0.18, Math.PI * 0.42]) p.line([[Math.cos(a) * R0 * 1.002, -HY + 0.6, ZC + Math.sin(a) * R0], [Math.cos(a) * R0 * 1.002, HY - 0.6, ZC + Math.sin(a) * R0]], 1, 0.55);
    // two dark straps; the near one slackens and slides out on hover
    const straps: [number, number][] = [[-6.5, 0], [4.5, e]];
    for (const [y, k] of straps) {
      const yy = y + 1.4 * k, r = R0 + 0.35 + 0.9 * k;
      roll(p, r, yy, yy + 2.4, 0.04, 0.035, 0.03);
      // its buckle, bright on the top front
      const a = Math.PI * 0.3, bx = Math.cos(a) * r, bz = ZC + Math.sin(a) * r;
      p.push();
      p.rotate("y", -k * 0.5, [bx, yy, bz]);
      p.box(bx - 0.4, yy - 0.5, bz - 1.6, 1.6, 3.4, 3.2, { top: 0.4, left: 0.3, right: 0.2, edge: 0 });
      p.pop();
    }
    // the near strap's loose tail drops to the floor
    if (d > 0) {
      const a = Math.PI * 0.3, r = R0 + 1.25, y = 4.5 + 1.4 + 1.2, bx = Math.cos(a) * r, bz = ZC + Math.sin(a) * r;
      const pts: V3[] = Array.from({ length: 9 }, (_, i) => { const u = i / 8; return [bx + 2.6 * u * d, y + 0.6 * u, bz - (bz - 0.6) * u * d] as V3; });
      const q = pts.map((v) => p.pt(v));
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath(); q.forEach(([x, y2], i) => (i ? g.lineTo(x, y2) : g.moveTo(x, y2))); g.stroke(); });
    }
    // the end: a lit disc with the rolled layers as a spiral of cuts
    p.face(circ(R0, HY + 0.02), 0.26, 0);
    p.line(Array.from({ length: 90 }, (_, i) => { const u = i / 89, a = u * Math.PI * 2 * 3, q = R0 * (0.1 + 0.85 * u); return [Math.cos(a) * q, HY + 0.05, ZC + Math.sin(a) * q] as V3; }), 1, 0.85);
    p.line(circ(R0, HY + 0.05).concat([circ(R0, HY + 0.05)[0]]), 1, 0.6);
  },
};
