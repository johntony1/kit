// No rows imported: a page standing up with a table of cells on it. One by one, row by row, the cells fill in bright, then clear and start again.
import { SH, type Illustration, type Pen } from "../dots";

const P = 3.6; // seconds per loop
const X = 13, ZT = 32, F = 8, T = 2; // half width, height, folded corner, thickness
const COLS = 3, ROWS = 5;

function page(p: Pen, front: number) {
  p.face([[X, -T, 0], [X, 0, 0], [X, 0, ZT - F], [X, -T, ZT - F]], SH.right, SH.edge, 0.5);
  p.face([[X - F, -T, ZT], [X - F, 0, ZT], [X, 0, ZT - F], [X, -T, ZT - F]], 0.12, SH.edge, 0.5);
  p.face([[-X, -T, ZT], [X - F, -T, ZT], [X - F, 0, ZT], [-X, 0, ZT]], 0.26, SH.edge, 0.5);
  p.face([[-X, 0, 0], [X, 0, 0], [X, 0, ZT - F], [X - F, 0, ZT], [-X, 0, ZT]], front, SH.edge, 0.6);
  p.face([[X - F, 0.08, ZT], [X, 0.08, ZT - F], [X - F, 0.08, ZT - F]], 0.12, SH.edge, 0.6);
}

export const csv: Illustration = {
  k: "csv", name: "CSV file", title: "No rows imported", body: "Import a CSV file and its rows will be listed here, ready to check.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t % P) / P;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 9, 0.11);
    p.rotate("z", -0.5);
    page(p, 0.24);
    // the table: a header row, then rows of cells that fill in turn
    const y = 0.08, x0 = -X + 2.5, x1 = X - 2.5, zt = ZT - 9.5, ch = 3.7, cw = (x1 - x0) / COLS;
    const n = COLS * ROWS, filled = ph < 0.85 ? Math.floor((ph / 0.8) * (n + 1)) : -1;
    p.clear([[x0 - 0.6, y, zt + 0.6], [x1 + 0.6, y, zt + 0.6], [x1 + 0.6, y, zt - ROWS * ch - 0.6], [x0 - 0.6, y, zt - ROWS * ch - 0.6]]);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c, ax = x0 + c * cw + 0.45, bx = ax + cw - 0.9, az = zt - r * ch - 0.45, bz = az - ch + 0.9;
      const lit = r === 0 || i < filled;
      p.face([[ax, y + 0.02, az], [bx, y + 0.02, az], [bx, y + 0.02, bz], [ax, y + 0.02, bz]], lit ? (r === 0 ? 0.34 : 0.28) : 0.075, 0);
    }
    // the header label above the table
    p.line([[x0, y + 0.03, ZT - 4.5], [x0 + 9, y + 0.03, ZT - 4.5]], SH.edge, 1);
  },
};
