// No timetable yet: a wall planner on two rings, a column for every weekday. Hover and the lessons drop into their columns one after another.
import { type Illustration } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const W = 18.5, H = 35, D = 2.6; // half width, height, depth
const CW = 5.2, GAP = 1.4; // column width and the gap between columns
// the lessons: [column, bottom, height, shown at rest]
const SLOTS: [number, number, number, boolean][] = [
  [0, 17, 9, true], [1, 8.5, 10, false], [2, 19, 7, true], [2, 3.5, 8, false], [3, 10.5, 11, true], [4, 18, 8, false], [4, 3.5, 7.5, true],
];
const colX = (c: number) => -W + 2.2 + c * (CW + GAP);

export const timetable: Illustration = {
  k: "timetable", name: "Timetable", title: "No timetable yet", body: "Add your classes and the week will fill in here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -19);
    p.shadow(0, 0, 25, 10, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 1, 0);
    // the board: a lit rim round a dark face
    p.box(-W, -D, 0, W * 2, D, H, { top: 0.24, left: 0.2, right: 0.065, edge: 0 });
    p.face([[-W + 1.5, 0.03, 1.5], [W - 1.5, 0.03, 1.5], [W - 1.5, 0.03, H - 1.5], [-W + 1.5, 0.03, H - 1.5]], 0.03, 0);
    // the weekday strip: one cap per column
    for (let c = 0; c < 5; c++) {
      const x = colX(c);
      p.face([[x, 0.05, H - 6.6], [x + CW, 0.05, H - 6.6], [x + CW, 0.05, H - 2.8], [x, 0.05, H - 2.8]], 0.13, 0);
    }
    // the lessons: raised bright blocks; the late ones drop in on hover
    let late = 0;
    for (const [c, z, ht, rest] of SLOTS) {
      let k = 1;
      if (!rest) { k = clamp(h * 2.2 - late * 0.38); late++; }
      if (k <= 0) continue;
      const fall = (1 - k) * (1 - k) * 9;
      p.box(colX(c), 0, z + fall, CW, 1.4, ht, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    }
    // two rings over the top edge
    for (const x of [-9, 9]) {
      p.box(x - 1.1, -D - 0.2, H - 2.2, 2.2, D + 1, 5.2, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
      p.clear([[x - 0.35, 0.83, H - 1.2], [x + 0.35, 0.83, H - 1.2], [x + 0.35, 0.83, H + 2], [x - 0.35, 0.83, H + 2]]);
    }
  },
};
