// Processor chip: a square chip with legs on every side and a lit die in the middle. A pulse runs round its legs and the die breathes, over and over.
import { type Illustration, type V3 } from "../dots";

const PER = 3.2, S = 10, N = 4, Z0 = 1, TH = 4.2, L = 3.8; // seconds per loop, half side, legs per side, underside, thickness, leg length

export const chip: Illustration = {
  k: "chip", name: "Processor chip", title: "No compute yet", body: "Start a job and its compute usage will show up here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -3);
    p.shadow(0, 0, 30, 15, 0.1);
    // how lit a leg is: a pulse that runs round the four sides
    const lit = (side: number, i: number) => {
      const at = (side + (i + 0.5) / N) / 4;
      const d = Math.abs(((u - at + 1.5) % 1) - 0.5);
      return Math.max(0, 1 - d / 0.1);
    };
    const xs = Array.from({ length: N }, (_, i) => -S + ((i + 0.5) / N) * S * 2);
    const leg = (x: number, y: number, w: number, d: number, k: number) =>
      p.box(x, y, 0, w, d, 1.5, { top: 0.16 + 0.84 * k, left: 0.1 + 0.8 * k, right: 0.05 + 0.7 * k, edge: 0 });
    // the far legs first
    xs.forEach((x, i) => leg(x - 1.1, -S - L, 2.2, L, lit(0, i)));
    xs.forEach((y, i) => leg(-S - L, y - 1.1, L, 2.2, lit(3, N - 1 - i)));
    // the package
    p.box(-S, -S, Z0, S * 2, S * 2, TH, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    // the near legs
    xs.forEach((y, i) => leg(S, y - 1.1, L, 2.2, lit(1, i)));
    xs.forEach((x, i) => leg(x - 1.1, S, 2.2, L, lit(2, N - 1 - i)));
    // the die: a dark seat with a bright square in it that breathes
    const Z = Z0 + TH + 0.03, g = 0.5 - 0.5 * Math.cos(u * Math.PI * 4);
    const q = (r: number, z: number): V3[] => [[-r, -r, z], [r, -r, z], [r, r, z], [-r, r, z]];
    p.clear(q(6.4, Z));
    p.face(q(4.4, Z + 0.02), 0.22 + 0.78 * g, 0);
    p.clear(q(1.5, Z + 0.04));
    // the corner mark
    p.dot([-S + 1.9, S - 1.9, Z], 0.9, 0);
  },
};
