// No grades yet: a report card leaning in a stand, four subject rows and an empty grade ring. Hover and each row gets its mark, then a big A lands in the ring.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.6 ? (b / 0.6) * 1.2 : 1.2 - 0.2 * ((b - 0.6) / 0.4));
const A: [number, number][][] = [[[-1, -1.3], [0, 1.3], [1, -1.3]], [[-0.6, -0.4], [0.6, -0.4]]];
const F = 0.03;

export const grades: Illustration = {
  k: "grades", name: "Report card", title: "No grades yet", body: "Grades will appear here once your first piece of work has been marked.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 3, -15);
    p.shadow(0, -1, 25, 12, 0.12);
    // the stand
    p.box(-9, -5, 0, 18, 8, 2.2);
    // the card, leaning back
    p.push();
    p.rotate("x", 0.24, [0, 0, 2]);
    p.box(-11.5, -1, 1.2, 23, 1, 29, { left: 0.2, right: 0.08 });
    // the heading: two lines beside the grade ring
    p.line([[-9, F, 26.4], [1, F, 26.4]], SH.edge, 0.9);
    p.line([[-9, F, 23.6], [-2, F, 23.6]], SH.edge, 0.6);
    const g = pop(seg(h, 0.66, 0.95));
    p.ringV("y", [6.2, F, 24.6], 3.9, g > 0 ? 0.36 : 0.05, SH.edge, 0.6);
    if (g > 0) for (const s of A) p.line(s.map(([u, v]) => [6.2 + u * 1.9 * g, F + 0.03, 24.6 + v * 1.9 * g] as V3), SH.edge, 0.9);
    // four subjects: a name, and a box that fills with a mark
    for (let i = 0; i < 4; i++) {
      const z = 16.6 - i * 4.1, k = pop(seg(h, 0.04 + i * 0.15, 0.24 + i * 0.15));
      p.line([[-9, F, z], [i % 2 ? 0 : 2.4, F, z]], SH.edge, 0.7);
      p.face([[4.8, F, z - 1.5], [8.6, F, z - 1.5], [8.6, F, z + 1.5], [4.8, F, z + 1.5]], k > 0 ? 0.36 : 0.05, SH.edge, 0.5);
      if (k > 0.3) p.line([[5.6, F + 0.03, z], [6.4, F + 0.03, z - 0.8], [7.9, F + 0.03, z + 0.9]], SH.edge, 0.6);
    }
    p.pop();
    // the front lip of the stand, over the card's foot
    p.box(-9, 0.4, 0, 18, 2.6, 3.4);
  },
};
