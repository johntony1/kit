// Nothing scheduled: a Gantt chart on a thick dark board, three staggered bars and a today marker. Hover and the bars run out to full length one after another while the marker slides on.
import { type Illustration, type Pen } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 21, H = 30, D = 3.4; // half width, height, depth of the board
// the bars: [left, full right, bottom]
const BARS: [number, number, number][] = [[-17, 1, 18.5], [-8, 13, 11.2], [0, 17, 3.9]];

// a raised bright bar on the board's face
function bar(p: Pen, x0: number, x1: number, z: number) {
  p.box(x0, 0, z, x1 - x0, 1.6, 5, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
}

export const timeline: Illustration = {
  k: "timeline", name: "Gantt timeline", title: "Nothing scheduled", body: "Give your tasks a start and an end date and they will line up on this timeline.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 28, 11, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 1, 0);
    // the board: a lit rim round a dark face
    p.box(-W, -D, 0, W * 2, D, H, { top: 0.24, left: 0.2, right: 0.065, edge: 0 });
    p.face([[-W + 1.6, 0.03, 1.6], [W - 1.6, 0.03, 1.6], [W - 1.6, 0.03, H - 1.6], [-W + 1.6, 0.03, H - 1.6]], 0.03, 0);
    // the date strip along the top, cut into weeks
    p.face([[-W + 1.6, 0.05, H - 4.4], [W - 1.6, 0.05, H - 4.4], [W - 1.6, 0.05, H - 1.6], [-W + 1.6, 0.05, H - 1.6]], 0.13, 0);
    for (let x = -12; x <= 12; x += 6) p.line([[x, 0.07, H - 4.4], [x, 0.07, H - 1.6]], 1, 0.8);
    // the bars: most of their length at rest, running out to the end on hover
    BARS.forEach(([x0, x1, z], i) => {
      const k = ease(clamp(h * 1.8 - i * 0.3));
      bar(p, x0, x0 + (x1 - x0) * (0.62 + 0.38 * k), z);
    });
    // the today marker: a bright upright line with a head, sliding on
    const tx = -3 + 9 * ease(h);
    p.box(tx - 0.6, 0, 2, 1.2, 2.3, H - 7, { top: 0.3, left: 0.3, right: 0.2, edge: 0 });
    p.box(tx - 1.7, 0, H - 5.6, 3.4, 2.3, 2.6, { top: 0.3, left: 0.3, right: 0.2, edge: 0 });
  },
};
