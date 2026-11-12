// Ruler: a long ruler laid corner to corner, seen from above, with bold tick marks. Hover and a pointer runs along it, drawing the length measured.
import { type Illustration } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const ruler: Illustration = {
  k: "ruler", name: "Ruler", title: "No measurements yet", body: "Add your first measurement and it will be recorded here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const s = -16.2 + 27 * ease(h); // where the pointer sits
    p.translate(0, 0, -6);
    // the desk tipped toward us, and the ruler turned to climb to the right
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.45);
    p.rotate("z", -0.7);
    p.box(-23.5, -6.5, 0, 47, 13, 1.6, { top: 0.2, left: 0.1, right: 0.065, edge: 0 });
    // tick marks along the near edge: long, short, middle, short
    for (let i = 0; i <= 16; i++) {
      const x = -21.6 + i * 2.7;
      p.line([[x, 6.5, 1.63], [x, 6.5 - (i % 4 === 0 ? 7 : i % 2 === 0 ? 4.8 : 3), 1.63]], 1, 0.95);
    }
    p.dot([21, -3.6, 1.63], 1.4, 0); // a hole to hang it by
    // the length measured so far, and the pointer at its end
    p.face([[-21.6, 9.6, 0], [s, 9.6, 0], [s, 10.9, 0], [-21.6, 10.9, 0]], 0.3, 0);
    p.face([[s, 7.4, 0], [s + 2.3, 11.6, 0], [s - 2.3, 11.6, 0]], 0.3, 0);
  },
};
