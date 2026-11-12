// Nothing to restock: a forklift holding a crate. The forks lift the crate up the mast, hold it, and lower it again.
import { SH, type Illustration } from "../dots";

const P = 3.4; // seconds per loop
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const forklift: Illustration = {
  k: "forklift", name: "Forklift", title: "Nothing to restock", body: "When stock runs low, the items to top up will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const L = 15 * (ease(cl((u - 0.06) / 0.34)) - ease(cl((u - 0.58) / 0.34))); // how high the forks are
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 13, 0.11);
    p.rotate("z", -0.5); // turned so its side faces us, forks to the right
    p.translate(-3.5, 0, 0);
    const post = (x: number, y: number) => p.box(x, y, 9, 1, 1, 14.5, { top: 0.2, left: 0.3, right: 0.1, edge: 0 });
    // the far posts of the guard, the body, the counterweight and the seat
    post(-9.5, -5); post(4, -5);
    p.box(-11, -5, 2.4, 17, 10, 6.6, { top: 0.14, left: 0.1, right: 0.06 });
    p.box(-11.6, -5, 9, 6.2, 10, 3.6, { top: 0.26, left: 0.22, right: 0.09 });
    p.box(-4.6, -3, 9, 1.4, 6, 5.4, { top: 0.3, left: 0.26, right: 0.1, edge: 0 }); p.box(-3.2, -3, 9, 3.6, 6, 1.4, { top: 0.3, left: 0.26, right: 0.1, edge: 0 });
    p.line([[3.6, 0, 9], [1.6, 0, 13.6]], SH.edge, 0.8); p.dot([1.6, 0, 13.8], 1.1, 1); // the wheel on its column
    // the near posts and the roof of the guard
    post(-9.5, 4); post(4, 4);
    p.box(-10.5, -5.4, 23.5, 16, 10.8, 1.1, { top: 0.26, left: 0.3, right: 0.1 });
    // the mast: two tall rails with a tie across the top
    const mast = (y: number) => p.box(7, y, 1, 1.4, 1.4, 29, { top: 0.3, left: 0.34, right: 0.14, edge: 0 });
    mast(-4.2);
    p.box(7, -4.2, 29, 1.4, 8.4, 1, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    // the carriage, the forks and the crate, all riding up and down
    p.box(8.4, -4.8, L + 1.4, 0.8, 9.6, 7, { top: 0.2, left: 0.3, right: 0.1, lw: 0.5 });
    for (const y of [-3.9, 2.3]) p.box(9.2, y, L + 1.4, 10.6, 1.6, 0.9, { top: 0.34, left: 0.4, right: 0.2, edge: 0 });
    p.box(11.4, -4.4, L + 2.3, 7.6, 8.8, 7, { top: 0.44, left: 0.3, right: 0.15 });
    p.line([[15.2, -4.4, L + 9.33], [15.2, 4.4, L + 9.33], [15.2, 4.43, L + 2.3]], SH.edge, 0.6);
    mast(2.8);
    // the near wheels
    for (const [x, r] of [[-7.4, 3.1], [3.4, 3.7]]) {
      p.ringV("y", [x, 5.1, r], r, 0.035, SH.edge, 0.9);
      p.dot([x, 5.2, r], r * 0.34, 0.9);
    }
  },
};
