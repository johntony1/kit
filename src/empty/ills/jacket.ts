// Jacket: a zip up jacket held up flat, sleeves hanging, collar open. Hover and the zip runs down and the front falls open.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the jacket's outline in [x, z], from the right of the collar round to the hem
const HALF: P2[] = [[3.4, 30], [9.6, 28.4], [15.4, 23], [18, 9], [13.8, 8], [12.6, 18.5], [10.2, 21], [10.2, 3.5]];
const OUT: P2[] = [...HALF, ...HALF.slice().reverse().map(([x, z]) => [-x, z] as P2), [0, 25.5]];

export const jacket: Illustration = {
  k: "jacket", name: "Jacket", title: "No items in this size", body: "Try another size or clear the filter to see what is in stock.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.15));
    p.translate(0, 0, -16 + h * (1.2 + 0.4 * Math.sin(t * 2.2)));
    p.shadow(0, 0, 23 - h * 2, 9, 0.1);
    p.rotate("z", -0.6); // turned to face us
    const at = (o: P2[], y: number) => o.map(([x, z]) => [x, y, z] as V3);
    p.face(at(OUT, -1.8), SH.right, SH.edge, 0.5);
    p.face(at(OUT, 0), 0.2, SH.edge, 0.6);
    const Y = 0.04;
    // shoulder seams, cuffs, the hem band and two slanted pockets
    for (const s of [-1, 1]) {
      p.line([[s * 9.6, Y, 28.4], [s * 10.2, Y, 21]], 0.6, 0.5);
      p.line([[s * 17.6, Y, 11], [s * 13.6, Y, 10]], SH.edge, 0.55);
      p.line([[s * 3.6, Y, 12.4], [s * 7.6, Y, 10.6]], SH.edge, 0.8);
    }
    p.line([[-10.2, Y, 5.6], [10.2, Y, 5.6]], SH.edge, 0.55);
    // the opening: a dark dart that grows down from the collar as the zip runs
    const tip = 22 - 15 * k;
    if (k > 0.02) p.clear([[-3 * k, Y, 22 + 1.5 * k], [0, Y, 22], [3 * k, Y, 22 + 1.5 * k], [0, Y, tip]]);
    // the zip below the pull
    p.line([[0, Y, tip], [0, Y, 3.5]], SH.edge, 0.7);
    // the collar: two bright flaps
    for (const s of [-1, 1]) p.face([[s * 3.4, Y, 30], [s * 6.8, Y, 25.4], [s * 3 * k, Y, 22 + 1.5 * k], [0, Y, 25.5]], 0.32, SH.edge, 0.55);
    // the zip pull
    p.box(-0.8, Y, tip - 1.8, 1.6, 0.5, 2.2, { top: 0.5, left: 0.5, right: 0.3, edge: 0 });
  },
};
