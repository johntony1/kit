// No rows yet: a spreadsheet lying flat. A raised cursor cell steps down a column, typing a value into each cell.
import { easeInOut, SH, type Illustration } from "../dots";

const STEP = 1.1, N = 4, PERIOD = STEP * N;
const X0 = -16, Y0 = -12, CW = 8, RH = 4.4, COLS = 4, ROWS = 5, T = 2.4; // sheet corner, cell size, counts, thickness
const HX = 3.5, HY = 3; // header column and header row
const COL = 2; // the column being filled
const LEN = [0.7, 0.45, 0.85, 0.6]; // how long each typed value is

export const spreadsheet: Illustration = {
  k: "spreadsheet", name: "Spreadsheet", title: "No rows yet", body: "Add a row or import a file and your data will fill this sheet.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const n = Math.floor(t / STEP) % N, u = (t % STEP) / STEP;
    const move = easeInOut(Math.min(1, u / 0.3)); // the cursor slides to its cell
    const type = Math.max(0, Math.min(1, (u - 0.32) / 0.5)); // then types
    const X1 = X0 + HX + CW * COLS, Y1 = Y0 + HY + RH * ROWS;
    p.translate(1, -1, -5);
    p.shadow((X0 + X1) / 2 - 7, (Y0 + Y1) / 2, 26, 8, 0.12);
    p.shadow((X0 + X1) / 2 + 7, (Y0 + Y1) / 2, 26, 8, 0.12);
    // the sheet: a slab with dense cells, so the lit cursor stands out
    p.box(X0, Y0, 0, X1 - X0, Y1 - Y0, T, { top: SH.left });
    const z = T + 0.02;
    // the header row and column: lit bands
    p.face([[X0 + HX, Y0, z], [X1, Y0, z], [X1, Y0 + HY, z], [X0 + HX, Y0 + HY, z]], SH.top, 0);
    p.face([[X0, Y0 + HY, z], [X0 + HX, Y0 + HY, z], [X0 + HX, Y1, z], [X0, Y1, z]], SH.top, 0);
    // the grid, cut in
    for (let c = 0; c <= COLS; c++) { const x = X0 + HX + c * CW; p.line([[x, Y0 + 0.3, z], [x, Y1 - 0.3, z]], SH.edge, 0.6); }
    for (let r = 0; r <= ROWS; r++) { const y = Y0 + HY + r * RH; p.line([[X0 + 0.3, y, z], [X1 - 0.3, y, z]], SH.edge, 0.6); }
    // column letters and row numbers as short marks
    for (let c = 0; c < COLS; c++) { const x = X0 + HX + c * CW + CW / 2; p.line([[x - 0.8, Y0 + HY / 2, z], [x + 0.8, Y0 + HY / 2, z]], SH.edge, 0.7); }
    for (let r = 0; r < ROWS; r++) { const y = Y0 + HY + r * RH + RH / 2; p.line([[X0 + HX / 2 - 0.6, y, z], [X0 + HX / 2 + 0.6, y, z]], SH.edge, 0.7); }
    // values already in the first column and in the cells this pass has filled
    const val = (c: number, r: number, k: number) => {
      const x = X0 + HX + c * CW + 1.2, y = Y0 + HY + r * RH + RH / 2;
      p.line([[x, y, z], [x + (CW - 2.4) * k, y, z]], SH.edge, 0.75);
    };
    for (let r = 0; r < ROWS; r++) val(0, r, 0.4 + ((r * 37) % 5) / 10);
    for (let r = 0; r < n; r++) val(COL, r + 1, LEN[r]);
    // the next cell to fill: a dashed accent outline
    const cell = (r: number) => ({ x: X0 + HX + COL * CW, y: Y0 + HY + r * RH });
    if (n < N - 1) { const q = cell(n + 2); p.guide([[q.x + 0.4, q.y + 0.4, z], [q.x + CW - 0.4, q.y + 0.4, z], [q.x + CW - 0.4, q.y + RH - 0.4, z], [q.x + 0.4, q.y + RH - 0.4, z], [q.x + 0.4, q.y + 0.4, z]], true); }
    // the cursor: a raised accent cell sliding from the last cell to this one
    const from = cell(n === 0 ? N : n), to = cell(n + 1);
    const cy = from.y + (to.y - from.y) * move;
    const ck = n === 0 ? move : 1; // it grows back in at the top of each pass
    const lift = 2.4;
    if (ck > 0.05) {
      const w = CW * ck, d = RH * ck, cx = to.x + (CW - w) / 2, yy = (n === 0 ? to.y : cy) + (RH - d) / 2;
      p.clear([[cx - 0.4, yy - 0.4, z], [cx + w + 0.4, yy - 0.4, z], [cx + w + 0.4, yy + d + 0.4, z], [cx - 0.4, yy + d + 0.4, z]]);
      p.box(cx + 0.1, yy + 0.1, T, w - 0.2, d - 0.2, lift, { top: 0.32, left: SH.left, right: SH.right });
      // the value being typed, and the fill handle at its corner
      if (type > 0) p.line([[to.x + 1.2, to.y + RH / 2, T + lift + 0.02], [to.x + 1.2 + (CW - 2.4) * LEN[n] * type, to.y + RH / 2, T + lift + 0.02]], SH.edge, 0.75);
      p.box(cx + w - 1.1, yy + d - 1.1, T + lift, 1.2, 1.2, 0.6, { top: SH.top });
    }
  },
};
