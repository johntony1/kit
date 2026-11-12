// No meal plan yet: a week board standing behind a plate with a fork and a knife. Hover and the seven days fill with a meal one after another.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.6 ? (b / 0.6) * 1.25 : 1.25 - 0.25 * ((b - 0.6) / 0.4));
const BY = -9, F = BY + 2.03; // the board's back and its front face
const quad = (x0: number, x1: number, z0: number, z1: number, y: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

export const mealplan: Illustration = {
  k: "mealplan", name: "Meal plan", title: "No meal plan yet", body: "Pick meals for the week and your plan will fill in here, day by day.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-5, 3, -13);
    p.shadow(2, 0, 30, 14, 0.12);
    // the board: a foot, a slab, a bright header with two rings
    p.box(-9, BY - 1.5, 0, 22, 5, 1.4);
    p.box(-12, BY, 1.4, 28, 2, 24.6);
    p.face(quad(-12, 16, 21, 26, F), 0.32, SH.edge, 0.5);
    for (const x of [-6, 10]) p.box(x - 0.7, BY + 0.4, 25, 1.4, 1.8, 2.6, { top: 0.34, left: 0.34, right: 0.2, lw: 0.4 });
    // seven days: four above, three below, each a dark cell that fills with a meal
    for (let i = 0; i < 7; i++) {
      const col = i % 4, row = i < 4 ? 0 : 1, x = -10.4 + col * 6.4 + (row ? 3.2 : 0), z = 13 - row * 8.6;
      p.face(quad(x, x + 5.2, z, z + 6.6, F), 0.035, SH.edge, 0.5);
      const k = pop(seg(h, 0.06 + i * 0.11, 0.26 + i * 0.11));
      if (k > 0) {
        p.ringV("y", [x + 2.6, F + 0.03, z + 3.3], 2.3 * k, 0.36, 0);
        p.ringV("y", [x + 2.6, F + 0.05, z + 3.3], 1.1 * k, 0.1, 0);
      }
    }
    // the plate in front, a fork on its left and a knife on its right
    const cx = 5, cy = 9;
    p.cylinder(cx, cy, 0, 8.6, 1, { top: 0.22, side: 0.12 });
    p.disc(cx, cy, 1.02, 5.8, 0.3, SH.edge);
    const bar = (x: number, y: number, w: number, len: number, fill: number) => p.box(x - w / 2, y - len / 2, 0, w, len, 0.5, { top: fill, left: 0.2, right: 0.14, lw: 0.35 });
    // cutlery lies pointing away from us
    p.push();
    p.rotate("z", -Math.PI / 4, [cx, cy, 0]);
    bar(cx - 11.5, cy + 1.5, 1.1, 10, 0.34);
    for (const dx of [-1.3, 0, 1.3]) bar(cx - 11.5 + dx, cy - 5.6, 0.75, 4.4, 0.34);
    bar(cx - 11.5, cy - 3.6, 3.4, 0.9, 0.34);
    bar(cx + 11.5, cy + 2.4, 1.1, 8, 0.34);
    bar(cx + 11.8, cy - 4.4, 1.9, 7.4, 0.34);
    p.pop();
    if (h > 0.9) p.dot([16, BY - 2, 30 + Math.sin(t * 3) * 0.6], 1, seg(h, 0.9, 1));
  },
};
