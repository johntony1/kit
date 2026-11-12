// No practice yet: an abacus, three rods of beads in a frame. Hover and the beads slide across, row by row.
import { type Illustration } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const RODS = [7.6, 14.7, 21.8];
const REST = [1, 3, 2], DONE = [3, 1, 4]; // beads parked on the right, per rod

export const abacus: Illustration = {
  k: "abacus", name: "Abacus", title: "No practice yet", body: "Finish a practice round and your progress will add up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 27, 12, 0.1);
    p.rotate("z", -0.38);
    const X = 17, D = 1.8, Z = 28;
    // feet, the left post and the bottom rail
    p.box(-X - 0.6, -4, 0, 3.2, 8, 1.4, { lw: 0.5 });
    p.box(-X, -D, 1.4, 2.6, D * 2, Z - 1.4, { left: 0.07, lw: 0.6 });
    p.box(-X + 2.6, -D, 1.4, X * 2 - 5.2, D * 2, 2.2, { left: 0.07, lw: 0.6 });
    // the rods and their beads, far end first
    RODS.forEach((z, r) => {
      p.box(-X + 2.6, -0.3, z - 0.3, X * 2 - 5.2, 0.6, 0.6, { top: 0.3, left: 0.3, edge: 0 });
      const k = ease(Math.min(1, Math.max(0, (h - r * 0.2) / 0.55)));
      for (let i = 0; i < 4; i++) {
        const lx = -X + 5.2 + i * 3.5, rx = X - 5.2 - (3 - i) * 3.5;
        const a = i >= 4 - REST[r] ? rx : lx, b = i >= 4 - DONE[r] ? rx : lx;
        const x = a + (b - a) * k;
        p.ringV("x", [x - 1.5, 0, z], 2.9, 0.02, 0);
        for (const dx of [-0.7, 0, 0.7]) p.ringV("x", [x + dx, 0, z], 2.7, a !== b ? 0.4 + 0.5 * k : 0.4, 0);
      }
    });
    // the right post, its foot and the top rail
    p.box(X - 2.6, -4, 0, 3.2, 8, 1.4, { lw: 0.5 });
    p.box(X - 2.6, -D, 1.4, 2.6, D * 2, Z - 1.4, { left: 0.07, lw: 0.6 });
    p.box(-X, -D, Z - 2.2, X * 2, D * 2, 2.2, { left: 0.07, lw: 0.6 });
  },
};
