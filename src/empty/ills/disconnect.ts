// Connection lost: two puzzle pieces float side by side, drift together until they almost click, spark, and drift apart again.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number] | [number, number, number]; // a third 1 marks a point inside a slot
const PERIOD = 3.6;
const S = 12, D = 1.3; // piece size, half thickness (the faces look toward +y)

/** an edge from a to b with a knob in the middle: s = 1 a tab out, -1 a slot in, 0 straight */
function edge(a: P2, b: P2, s: number): P2[] {
  if (!s) return [a];
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const t: P2 = [dx / L, dz / L], n: P2 = [t[1], -t[0]];
  const m: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const c: P2 = [m[0] + n[0] * s * 2.2, m[1] + n[1] * s * 2.2];
  const v0: P2 = [-1.2 * t[0] - 2.2 * s * n[0], -1.2 * t[1] - 2.2 * s * n[1]];
  const v1: P2 = [1.2 * t[0] - 2.2 * s * n[0], 1.2 * t[1] - 2.2 * s * n[1]];
  const a0 = Math.atan2(v0[1], v0[0]), a1 = Math.atan2(v1[1], v1[0]);
  const TAU = Math.PI * 2;
  let d = a1 - a0;
  d = s > 0 ? ((d % TAU) + TAU) % TAU : -((((-d) % TAU) + TAU) % TAU);
  const r = Math.hypot(v0[0], v0[1]), N = 18;
  return [a, ...Array.from({ length: N + 1 }, (_, i) => { const q = a0 + (d * i) / N; return [c[0] + Math.cos(q) * r, c[1] + Math.sin(q) * r, s < 0 && i < N ? 1 : 0] as P2; })];
}
/** a piece's outline, counter clockwise: knobs on the bottom, right, top and left edges */
const piece = (k: [number, number, number, number]): P2[] => [
  ...edge([0, 0], [S, 0], k[0]), ...edge([S, 0], [S, S], k[1]), ...edge([S, S], [0, S], k[2]), ...edge([0, S], [0, 0], k[3]),
];
const A = piece([0, 1, -1, 0]); // its tab reaches right
const B = piece([0, 0, 1, -1]); // its slot waits on the left

const wind = (p: Pen, f: V3[]) => {
  const q = f.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s;
};
function draw(p: Pen, out: P2[]) {
  for (let i = 0; i < out.length; i++) {
    const a = out[i], b = out[(i + 1) % out.length];
    const f: V3[] = [[a[0], -D, a[1]], [b[0], -D, b[1]], [b[0], D, b[1]], [a[0], D, a[1]]];
    if (a[2] || wind(p, f) > -0.01) continue; // the inside of a slot stays in shadow
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    p.face(f, -dx / L > 0.45 ? 0.12 : dz / L > 0.3 ? SH.right : 0.1, 0);
  }
  p.face(out.map(([x, z]) => [x, D, z] as V3), 0.24, 0);
}

export const disconnect: Illustration = {
  k: "disconnect", name: "Puzzle pieces", title: "Connection lost", body: "We lost touch with the server. We will keep trying to reconnect.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD, w = u * Math.PI * 2;
    const g = 4.9 - 2.1 * Math.cos(w); // half the gap between them: closest at the start of the loop
    const bobA = Math.sin(w + 0.6) * 0.8, bobB = Math.sin(w + 2.4) * 0.8;
    const Z = 6;
    p.translate(0, 0, -13);
    p.rotate("z", -0.5); // face us a little more
    p.shadow(-g - S / 2 + 1, 0, 10, 5, 0.1);
    p.shadow(g + S / 2, 0, 9, 5, 0.1);

    p.push();
    p.translate(-g - S, 0, Z + bobA);
    p.rotate("y", Math.sin(w + 0.6) * 0.05, [S / 2, 0, S / 2]);
    draw(p, A);
    p.pop();

    p.push();
    p.translate(g, 0, Z + bobB);
    p.rotate("y", -Math.sin(w + 2.4) * 0.05, [S / 2, 0, S / 2]);
    draw(p, B);
    p.pop();

    // at their closest a spark jumps the gap, then nothing
    const k = Math.max(0, (3.3 - g) / 0.5);
    if (k > 0 && Math.sin(t * 50) > -0.3) {
      const x = (-g + 4.7 + g) / 2 - 0.6, z = Z + S / 2;
      for (const [dx, dz] of [[0, 2.6], [0.6, -2.4], [-0.4, 3.6], [0.9, -3.5]]) p.dot([x + dx * 0.4, D, z + dz], 0.7, Math.min(1, k));
    }
  },
};
