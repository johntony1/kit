// No metrics yet: a thick area chart standing on a slab, a point on the newest reading. Its line keeps rolling like a slow wave.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6, N = 6; // seconds per loop, readings
const X0 = -14, X1 = 14, Y0 = -2.6, Y1 = 2.6, BZ = 2.4;

export const metrics: Illustration = {
  k: "metrics", name: "Metrics", title: "No metrics yet", body: "Send your first data points and the charts will start to draw here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -12);
    p.shadow(0, 1, 29, 13, 0.11);
    p.rotate("z", -0.5);
    p.box(-17, -6, 0, 34, 12, BZ, { top: p.ink ? 0.2 : 0.045 });
    const xs = Array.from({ length: N }, (_, i) => X0 + (i * (X1 - X0)) / (N - 1));
    const zs = xs.map((_, i) => BZ + 7 + i * 2 + 3.4 * Math.sin(w + i * 1.3) + 1.4 * Math.sin(2 * w + i * 2.3));
    // the top of the chart: one strip per step, brighter where it leans toward us
    for (let i = 0; i < N - 1; i++) {
      p.face([[xs[i], Y0, zs[i]], [xs[i + 1], Y0, zs[i + 1]], [xs[i + 1], Y1, zs[i + 1]], [xs[i], Y1, zs[i]]], zs[i + 1] > zs[i] ? 0.2 : 0.28, 0);
    }
    p.line(xs.map((x, i) => [x, Y0, zs[i]] as V3), SH.soft, 0.45);
    // its end and its front
    p.face([[X1, Y0, BZ], [X1, Y1, BZ], [X1, Y1, zs[N - 1]], [X1, Y0, zs[N - 1]]], SH.right, SH.edge, 0.5);
    const front: V3[] = [[X0, Y1, BZ], ...xs.map((x, i) => [x, Y1, zs[i]] as V3), [X1, Y1, BZ]];
    p.face(front, SH.left, 0);
    p.line([[X0, Y1, BZ], ...xs.map((x, i) => [x, Y1 + 0.03, zs[i]] as V3), [X1, Y1, BZ]], SH.edge, 0.7);
    // a point on the newest reading
    p.dot([X1, Y1 + 0.05, zs[N - 1]], 1.5, 1);
    // the axis: ticks cut into the slab in front of the chart
    for (let i = 0; i < N; i++) p.line([[xs[i], 4, BZ + 0.02], [xs[i], 5, BZ + 0.02]], SH.edge, 0.5);
  },
};
