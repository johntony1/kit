// No datasets yet: a data table standing up, a ruled header over empty rows, with a small data store in front of it. Hover and the rows fill in one after another.
import { SH, type Illustration } from "../dots";

const X0 = -16, X1 = 12, HT = 27, HD = 21, YF = 1.5; // the panel's ends, its height, where the header starts, its front
const COLS = [X0, -6.7, 2.7, X1];

export const dataset: Illustration = {
  k: "dataset", name: "Dataset", title: "No datasets yet", body: "Upload a dataset or connect a source. Its rows will be ready to explore here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 2, 32, 14, 0.11);
    p.push();
    p.translate(-2, -3, 0);
    p.rotate("z", -0.5);
    // the panel
    p.box(X0, -YF, 0, X1 - X0, YF * 2, HT, { top: 0.3, left: 0.22, right: 0.05, edge: 0 });
    const y = YF + 0.03;
    // the header: a heavy rule under three bold labels
    p.line([[X0, y, HD], [X1, y, HD]], SH.edge, 1.5);
    for (let c = 0; c < 3; c++) p.line([[COLS[c] + 2.2, y, (HD + HT) / 2 + 0.2], [COLS[c + 1] - 3, y, (HD + HT) / 2 + 0.2]], SH.edge, 1.7);
    // the grid
    const RH = HD / 3;
    for (let r = 1; r < 3; r++) p.line([[X0, y, r * RH], [X1, y, r * RH]], SH.edge, 0.9);
    for (const x of [COLS[1], COLS[2]]) p.line([[x, y, 0], [x, y, HD]], SH.edge, 0.9);
    p.line([[X0, y, HT], [X1, y, HT], [X1 + 0.03, -YF, HT]], SH.edge, 0.5);
    // the rows fill in from the top
    for (let r = 0; r < 3; r++) {
      const k = Math.max(0, Math.min(1, (h - 0.1 - r * 0.27) / 0.3));
      if (k <= 0) continue;
      const z = HD - (r + 0.5) * RH;
      for (let c = 0; c < 3; c++) {
        const a = COLS[c] + 2.2, len = (COLS[c + 1] - COLS[c] - 4.6) * (c === 0 ? 1 : 0.6 + 0.3 * ((r + c) % 2)) * k;
        p.line([[a, y, z], [a + len, y, z]], SH.edge, 1.2);
      }
    }
    p.pop();
    // the data store in front: two disks with a dark gap
    const cx = 15, cy = 8, R = 6.6;
    p.cylinder(cx, cy, 0, R, 4.4, { side: 0.2, top: 0.3, edge: 0 });
    p.cylinder(cx, cy, 4.4, R - 0.9, 1.3, { side: 0.03, top: 0.03, edge: 0 });
    p.cylinder(cx, cy, 5.7, R, 4.4, { side: 0.2, top: 0.3, edge: 0 });
    p.disc(cx, cy, 10.13, R - 1.6, 0, 0);
    p.dot([cx + 2.2, cy + R * 0.92, 2.2], 0.9, 0);
    p.dot([cx + 2.2, cy + R * 0.92, 7.9], 0.9, 0);
  },
};
