// Waiting for a breeze: a paper pinwheel on a stick, four curled vanes around a pin. It spins steadily in the wind.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop: a quarter turn
type P2 = [number, number];
const K = 0.57735;
const B = ([u, v]: P2, d = 0): V3 => [u * K + d, -u * K + d, v];

export const pinwheel: Illustration = {
  k: "pinwheel", name: "Pinwheel", title: "Waiting for a breeze", body: "Nothing is happening yet. As soon as something moves, it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, th = -u * (Math.PI / 2);
    p.translate(0, 0, -26);
    p.shadow(0, 0, 10, 5, 0.12);
    // the stick: a lit bar from the ground up to the pin
    const C: P2 = [0, 31];
    p.box(-1.1, -1.1, 0, 2.2, 2.2, C[1], { top: 0.3, left: 0.26, right: 0.12, edge: 0 });
    // four vanes: a lit sheet from the centre to its tip, and the curled half folded toward the pin
    const at = (a: number, r: number): P2 => [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r];
    for (let k = 0; k < 4; k++) {
      const a = th + (k * Math.PI) / 2 + Math.PI / 4;
      const tip = at(a, 23), side = at(a - Math.PI / 2 + 0.25, 15), curl = at(a + 0.55, 11.5);
      const sheet: P2[] = [C, side, tip];
      p.face(sheet.map((q) => B(q, 1)), 0.24, 0);
      p.line([C, side, tip, C].map((q) => B(q, 1)), SH.edge, 0.6);
      const fold: P2[] = [C, tip, curl];
      p.face(fold.map((q) => B(q, 1.4)), 0.065, 0);
      p.line([tip, curl, C].map((q) => B(q, 1.4)), SH.edge, 0.6);
    }
    // the pin
    p.dot(B(C, 2), 2, 1);
    p.dot(B(C, 2), 0.8, 0);
  },
};
