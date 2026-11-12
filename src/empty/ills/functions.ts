// No functions deployed: a function machine with a hopper on top and a tray at its side. A block drops in, the machine works, and a ball rolls out.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const cl = (x: number) => Math.max(0, Math.min(1, x));
const X = 9, Y = 8, Z = 15; // half width, half depth, height of the machine
// the mark on the front: a hooked f with its bar, as strokes in [across, up]
const GLYPH: [number, number][][] = [[[3, 5.2], [1.9, 6], [0.7, 5.3], [-0.7, -4.6], [-1.7, -5.6], [-2.9, -5.1]], [[-2.2, 1.7], [2.4, 1.7]]];

export const functions: Illustration = {
  k: "functions", name: "Function", title: "No functions deployed", body: "Deploy a function and it will run on demand. Its calls and results will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const work = Math.sin(Math.PI * cl((u - 0.42) / 0.2)); // the machine at work
    p.translate(-4, 1, -11);
    p.shadow(3, 0, 27, 13.5, 0.12);
    p.rotate("z", -0.32);
    p.push();
    p.scale(1 + 0.03 * work, [0, 0, 0]);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.2, left: 0.13, right: 0.065, lw: 0.6 });
    for (const s of GLYPH) p.line(s.map(([a, b]) => [a, Y + 0.03, 7.5 + b] as V3), work > 0.05 ? 1 : 0.8, 0.9 + 0.5 * work);
    // the way out, on the right wall
    p.clear([[X + 0.03, -3.2, 1.8], [X + 0.03, 3.2, 1.8], [X + 0.03, 3.2, 7.2], [X + 0.03, -3.2, 7.2]]);
    p.pop();
    // the tray, and the ball rolling out along it
    p.box(X, -4.4, 0, 10, 8.8, 1.6, { top: 0.09, left: 0.13, right: 0.065, lw: 0.6 });
    const v = (u - 0.56) / 0.44;
    if (v > 0) {
      const roll = 1 - Math.pow(1 - cl(v / 0.55), 3), r = 2.9 * cl(v / 0.12) * (1 - cl((v - 0.78) / 0.22));
      if (r > 0.2) p.dot([X + 1 + 6.4 * roll, 0, 1.6 + 2.5], r, 1);
    }
    // the hopper
    const hop = () => p.box(-5.5, -5.5, Z, 11, 11, 4.6, { open: true, left: 0.16, right: 0.08, lw: 0.6 });
    hop();
    // the block: grows in overhead, drops into the hopper and is swallowed
    const f = cl(u / 0.36), g = cl((u - 0.36) / 0.08);
    const s = 2.6 * cl(f / 0.2) * (1 - g), z = Z + 5.2 + 9 * (1 - f * f) - 4.5 * g;
    if (s > 0.2 && u < 0.45) {
      p.box(-s, -s, z, s * 2, s * 2, s * 2, { top: 0.36, left: 0.24, right: 0.12, lw: 0.6 });
      if (g > 0) { // the front of the hopper again, over the block as it sinks
        p.face([[-5.5, 5.5, Z], [5.5, 5.5, Z], [5.5, 5.5, Z + 4.6], [-5.5, 5.5, Z + 4.6]], 0.16, SH.edge, 0.6);
        p.face([[5.5, -5.5, Z], [5.5, 5.5, Z], [5.5, 5.5, Z + 4.6], [5.5, -5.5, Z + 4.6]], 0.08, SH.edge, 0.6);
      }
    }
  },
};
