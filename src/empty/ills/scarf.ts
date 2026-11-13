// No accessories yet: a chunky striped scarf seen from the front, wrapped once into a loop with its two fringed ends hanging down, one over the other. The ends sway gently as if in a breeze, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const NZ = 36; // the middle of the loop

export const scarf: Illustration = {
  k: "scarf", name: "Scarf", title: "No accessories yet", body: "Add accessories to your shop and they will be shown here, ready to style.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -22);
    p.shadow(0, 0, 16, 7, 0.12);
    p.rotate("z", -0.62); // turned to face us
    const ell = (rx: number, rz: number, a0: number, a1: number, y: number, dz = 0): V3[] =>
      Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [Math.cos(a) * rx, y, NZ + dz + Math.sin(a) * rz]; });
    // the loop: the far half in shade, then the dark opening, then the near half lit and striped
    p.face([...ell(10, 7, 0, Math.PI, -2), ...ell(4.6, 2.2, Math.PI, 0, -2, 2.6)], 0.2, 0);
    p.face(ell(4.6, 2.2, 0, Math.PI * 2, -1.9, 2.6), 0.02, 0);
    p.face([...ell(10, 7, Math.PI, Math.PI * 2, 1), ...ell(4.6, 2.2, Math.PI * 2, Math.PI, 1, 2.6)], 0.26, 0);
    // where the near half folds over the far half: a dark seam each side
    for (const s of [-1, 1]) p.line([[s * 10, 1.05, NZ], [s * 4.6, 1.05, NZ + 2.6]], 1, 0.9);
    // the two ends hanging from the front of the loop, swaying
    const end = (x0: number, w: number, len: number, lean: number, ph: number, y: number) => {
      const sway = Math.sin(u * Math.PI * 2 + ph) * 1.8;
      const at = (s: number, side: number): V3 => {
        const k = s / len;
        return [x0 + lean * k + sway * k * k + side * (w / 2) * (1 + 0.12 * k), y, NZ - 5.5 - s];
      };
      const strip = (s0: number, s1: number, f: number) => p.face([at(s0, -1), at(s1, -1), at(s1, 1), at(s0, 1)], f, 0);
      strip(0, len, 0.26);
      // stripes: pairs of dark cuts across it
      for (const k of [0.44, 0.52, 0.72, 0.8]) p.line([at(len * k, -1), at(len * k, 1)], 1, 0.8);
      // the fringe: four solid tassels with dark gaps between them
      for (let i = 0; i < 4; i++) {
        const a = -1 + (i * 2 + 0.25) / 4, b = a + 0.32;
        const q0 = at(len, a), q1 = at(len, b), d = sway * 0.25;
        p.face([[q0[0], y, q0[2] - 0.5], [q1[0], y, q1[2] - 0.5], [q1[0] + d, y, q1[2] - 4], [q0[0] + d, y, q0[2] - 4]], 0.3, 0);
      }
    };
    end(4, 7, 22, 3, 0.9, 1.4);
    end(-3, 7.6, 26, -2, 0, 2);
    // the knot where the ends leave the loop: a lit wrap with a dark fold
    p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [0.5 + Math.cos(a) * 5.2, 2.3, NZ - 6 + Math.sin(a) * 3.6] as V3; }), 0.03, 0);
    p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [0.5 + Math.cos(a) * 4.4, 2.4, NZ - 6 + Math.sin(a) * 2.9] as V3; }), 0.3, 0);
  },
};
