// No sprints yet: a sprint board standing on two feet, three columns with a few notes pinned up. Hover and a note hops from the first column to the last and gets its tick.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const Y = 1.04; // the board's face

/** a sticky note on the board, standing `lift` off its face */
function note(p: Pen, cx: number, cz: number, lift: number, fill: number, ticked: number) {
  const y = Y + lift;
  p.face([[cx - 3.2, y, cz - 2.3], [cx + 3.2, y, cz - 2.3], [cx + 3.2, y, cz + 2.3], [cx - 3.2, y, cz + 2.3]], fill, SH.edge, 0.55);
  if (ticked > 0) {
    const A: V3 = [cx - 1.7, y + 0.03, cz + 0.1], M: V3 = [cx - 0.5, y + 0.03, cz - 1.1], C: V3 = [cx + 1.8, y + 0.03, cz + 1.3];
    const s = Math.min(1, ticked * 1.5);
    p.line(s < 0.4 ? [A, [A[0] + (M[0] - A[0]) * (s / 0.4), A[1], A[2] + (M[2] - A[2]) * (s / 0.4)]] : [A, M, [M[0] + (C[0] - M[0]) * ((s - 0.4) / 0.6), M[1], M[2] + (C[2] - M[2]) * ((s - 0.4) / 0.6)]], 0, 1);
  } else p.line([[cx - 1.9, y + 0.03, cz + 0.5], [cx + 1.9, y + 0.03, cz + 0.5]], 0, 0.6);
}

export const sprint: Illustration = {
  k: "sprint", name: "Sprint board", title: "No sprints yet", body: "Plan your first sprint and the work in it will line up on this board.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 1, 30, 13, 0.1);
    p.rotate("z", -0.42);
    // two feet and two legs
    for (const x of [-12.5, 10.5]) {
      p.box(x - 0.6, -4, 0, 3.2, 8, 1.2);
      p.box(x, -0.8, 1.2, 2, 1.6, 6.8, { top: 0, edge: 0 });
    }
    // the board: a dim face so the notes stand out
    p.box(-16, -1, 8, 32, 2, 21.5, { top: 0.22, left: 0.035, right: 0.065, lw: 0.6 });
    // a lit header band with a title over each column, and the two dividers
    p.face([[-16, Y - 0.02, 25.4], [16, Y - 0.02, 25.4], [16, Y - 0.02, 29.5], [-16, Y - 0.02, 29.5]], 0.2, SH.edge, 0.5);
    for (const cx of [-10.6, 0, 10.6]) p.line([[cx - 2.6, Y, 27.45], [cx + 2.6, Y, 27.45]], SH.edge, 1);
    for (const x of [-5.3, 5.3]) p.face([[x - 0.3, Y - 0.02, 8], [x + 0.3, Y - 0.02, 8], [x + 0.3, Y - 0.02, 25.4], [x - 0.3, Y - 0.02, 25.4]], 0.12, 0);
    // a ledge along the bottom
    p.box(-16, 1, 8, 32, 1.6, 1, { lw: 0.5 });
    // the notes that stay put
    note(p, -10.6, 21.2, 0, 0.26, 0);
    note(p, 0, 21.2, 0, 0.26, 0);
    note(p, 0, 15.3, 0, 0.26, 0);
    // the one that moves: off the board, across in an arc, and down into the last column
    const k = ease(Math.min(1, h / 0.72));
    const cx = -10.6 + 21.2 * k, cz = 15.3 + 5.9 * k + Math.sin(k * Math.PI) * 3.2;
    const lift = Math.sin(k * Math.PI) * 4.5;
    if (lift > 0.3) p.guide([[cx, Y, cz], [cx, Y + lift, cz]], true);
    note(p, cx, cz, lift, 0.26 + 0.14 * k, Math.max(0, (h - 0.7) / 0.3));
  },
};
