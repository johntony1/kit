// No stays booked: a hotel block with an awning over its door and a sign on the roof. Hover and the windows light up floor by floor and the sign glows.
import { SH, type Illustration, type V3 } from "../dots";

const YF = 7, XF = 9; // the front wall and the side wall

export const hotel: Illustration = {
  k: "hotel", name: "Hotel", title: "No stays booked", body: "Book a room and your stays will be listed here with their dates.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 25, 12, 0.11);
    // the plinth, the block and the roof edge
    p.box(-11, -9, 0, 22, 18, 1.2, { top: 0.16, left: 0.1, right: 0.06 });
    p.box(-9, -7, 1.2, 18, 14, 24.6, { top: 0.2, left: 0.2, right: 0.075, lw: 0.6 });
    p.box(-9.7, -7.7, 25.8, 19.4, 15.4, 1.3, { top: 0.22, left: 0.2, right: 0.08 });
    p.line([[-9, YF + 0.03, 25.8], [9, YF + 0.03, 25.8]], SH.edge, 0.6);
    p.line([[-9.7, 7.73, 27.1], [9.7, 7.73, 27.1], [9.73, -7.7, 27.1]], SH.edge, 0.6);
    // windows: three floors, lit from the bottom up on hover
    const lit = (row: number, i: number) => Math.min(1, Math.max(0, (h * 1.25 - 0.08 - row * 0.26 - i * 0.04) / 0.14));
    for (let r = 0; r < 3; r++) {
      const z = 10 + r * 5.2;
      [-5.6, 0, 5.6].forEach((x, i) => {
        const k = lit(r, i);
        const q: V3[] = [[x - 1.7, YF + 0.03, z], [x + 1.7, YF + 0.03, z], [x + 1.7, YF + 0.03, z + 3.4], [x - 1.7, YF + 0.03, z + 3.4]];
        if (k > 0.5) p.face(q, 1, SH.edge, 0.45); else p.clear(q);
      });
      [3.3, -3.3].forEach((y, i) => {
        const k = lit(r, i + 3);
        const q: V3[] = [[XF + 0.03, y - 1.7, z], [XF + 0.03, y + 1.7, z], [XF + 0.03, y + 1.7, z + 3.4], [XF + 0.03, y - 1.7, z + 3.4]];
        if (k > 0.5) p.face(q, 0.3, SH.edge, 0.45); else p.clear(q);
      });
    }
    // the door, dark, with a step lamp either side
    p.clear([[-2.6, YF + 0.03, 1.2], [2.6, YF + 0.03, 1.2], [2.6, YF + 0.03, 6.6], [-2.6, YF + 0.03, 6.6]]);
    p.line([[0, YF + 0.05, 1.2], [0, YF + 0.05, 6.6]], 0.6, 0.45);
    // the awning reaching out over it
    p.box(-4.4, YF, 6.8, 8.8, 3.6, 0.9, { top: 0.3, left: 0.16, right: 0.09, lw: 0.6 });
    p.line([[-3.9, YF + 3.3, 6.8], [-3.9, YF + 3.3, 1.2]], SH.edge, 0.45); p.line([[3.9, YF + 3.3, 6.8], [3.9, YF + 3.3, 1.2]], SH.edge, 0.45);
    // the roof sign: a board on two legs with an H on it
    const g = Math.min(1, Math.max(0, (h - 0.7) / 0.3)), zs = 28.6, ys = 4.6;
    p.line([[-3.4, ys, 27.1], [-3.4, ys, zs]], SH.edge, 0.5); p.line([[3.4, ys, 27.1], [3.4, ys, zs]], SH.edge, 0.5);
    p.box(-4.6, ys - 0.5, zs, 9.2, 1, 6.6, { top: 0.24, left: g > 0.5 ? 1 : 0.07, right: 0.07, lw: 0.6 });
    const H: V3[][] = [[[-1.9, ys + 0.55, zs + 1.4], [-1.9, ys + 0.55, zs + 5.2]], [[1.9, ys + 0.55, zs + 1.4], [1.9, ys + 0.55, zs + 5.2]], [[-1.9, ys + 0.55, zs + 3.3], [1.9, ys + 0.55, zs + 3.3]]];
    for (const s of H) p.line(s, SH.edge, 1);
    if (g > 0) ([[-8, ys, zs + 7.5], [8.5, ys, zs + 5], [-9.5, ys, zs + 1]] as V3[]).forEach((q, i) => p.dot(q, 0.75 + 0.3 * Math.sin(t * 3.4 + i * 2), g));
  },
};
