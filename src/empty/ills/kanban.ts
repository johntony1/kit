// No projects: a board with three empty columns. A single card drops into the middle column, settles, then lifts away again.
import { easeInOut, pulse, SH, type Illustration } from "../dots";

const P = 4.6; // seconds per loop
const LANES = [-16, -5, 6]; // the left edge (x) of each column
const LW = 10; // column width

export const kanban: Illustration = {
  k: "kanban", name: "Kanban board", title: "No projects", body: "Start a project and its tasks will line up on this board.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -8);
    p.shadow(0, 0, 30, 14, 0.1);
    // the board
    p.box(-17.5, -13, 0, 35, 25, 2.6, { top: 0.2, left: 0.12, right: 0.065 });
    const Z = 2.62;
    for (const x of LANES) {
      // the column header: a title and a count, cut into the lit board
      p.line([[x + 1, -10.6, Z], [x + 6.5, -10.6, Z]], 1, 1);
      p.dot([x + 8.6, -10.6, Z], 0.9, 0);
      // the empty column: a dark sunken lane
      p.face([[x, -8.4, Z], [x + LW, -8.4, Z], [x + LW, 10.5, Z], [x, 10.5, Z]], 0.03, 0);
      // its sunken walls catch the light on the far side
      p.face([[x, -8.4, Z], [x + LW, -8.4, Z], [x + LW, -7.6, Z], [x, -7.6, Z]], 0.12, 0);
      p.face([[x, -8.4, Z], [x + 0.8, -8.4, Z], [x + 0.8, 10.5, Z], [x, 10.5, Z]], 0.065, 0);
    }
    // the card: drops into the middle lane, growing as it comes, then lifts and shrinks away
    const k = easeInOut(pulse(t, P, 0.45));
    if (k < 0.04) return;
    const w = 8.4, d = 7, hh = 1.8;
    const cx = -4.2, cy = -2.5, cz = Z + 0.2 + (1 - k) * 9;
    p.push();
    p.translate(cx, cy, cz);
    p.scale(0.35 + 0.65 * k, [w / 2, d / 2, 0]);
    p.rotate("z", (1 - k) * 0.6, [w / 2, d / 2, 0]);
    p.box(0, 0, 0, w, d, hh, { top: 0.2, left: 0.13, right: 0.065 });
    // the card's title, two lines of text and a tag
    p.line([[1.4, 1.6, hh + 0.02], [5.8, 1.6, hh + 0.02]], SH.edge, 1);
    p.line([[1.4, 3.6, hh + 0.02], [7, 3.6, hh + 0.02]], SH.edge, 0.65);
    p.line([[1.4, 5.2, hh + 0.02], [4.6, 5.2, hh + 0.02]], SH.edge, 0.65);
    p.dot([6.6, 5.4, hh + 0.02], 0.8, 0);
    p.pop();
  },
};
