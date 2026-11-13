// No prices yet: a stock price board on a stand, its lit panel showing an up arrow and a rising bar chart. The bars scroll left without end, new ones rising in at the right.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const X = 15, Z0 = 9, Z1 = 29; // half width, bottom and top of the board
const SX = 13.4, SZ0 = 10.8, SZ1 = 27.2; // the lit panel
const XA = -5.4, XB = 12, B = 12.4; // the chart's left and right edges and its baseline
const S = 3.5, BW = 2.3, NOISE = [0, 1.8, -0.9, 1.1]; // bar spacing, bar width, a repeating wobble

export const ticker: Illustration = {
  k: "ticker", name: "Ticker", title: "No prices yet", body: "Follow a stock or a coin and its latest price will tick by here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const s = ((t / P) % 1) * NOISE.length; // slots scrolled this loop
    p.translate(0, 0, -16);
    p.shadow(0, 0, 22, 11, 0.12);
    p.rotate("z", -0.7); // turned so the panel faces us
    // the stand: a foot and a post
    p.box(-8, -4.5, 0, 16, 9, 1.8, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    p.box(-1.4, -1.4, 1.8, 2.8, 2.8, Z0 - 1.8, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    // the board: lit top, dense frame, sparse end
    p.box(-X, -2.4, Z0, X * 2, 4.8, Z1 - Z0, { top: 0.22, left: 0.1, right: 0.065, edge: 0 });
    const f = 2.43;
    p.face([[-SX, f, SZ0], [SX, f, SZ0], [SX, f, SZ1], [-SX, f, SZ1]], 0.26, 0);
    // a bold up arrow, top left, cut dark into the panel
    const ar: [number, number][] = [[-10.6, 13], [-8, 13], [-8, 19.4], [-5.2, 19.4], [-9.3, 25.4], [-13.4 + 0.0, 19.4], [-10.6, 19.4]];
    p.face(ar.map(([x, z]) => [x + 1, f + 0.03, z] as V3), 0.02, 0);
    // the bars: dark cuts that rise to the right and scroll left, clipped to the chart
    for (let j = -1; j < 8; j++) {
      const x0 = XA + (j - s) * S + 0.6, x1 = x0 + BW;
      const a = Math.max(x0, XA), b = Math.min(x1, XB);
      if (b - a < 0.3) continue;
      const n = NOISE[(((j % NOISE.length) + NOISE.length) % NOISE.length)];
      const hgt = 3 + ((x0 + BW / 2 - XA) / (XB - XA)) * 10 + n;
      p.face([[a, f + 0.03, B], [b, f + 0.03, B], [b, f + 0.03, B + Math.max(1, hgt)], [a, f + 0.03, B + Math.max(1, hgt)]], 0.02, 0);
    }
    p.line([[XA, f + 0.03, B - 0.7], [XB, f + 0.03, B - 0.7]], SH.edge, 0.7);
  },
};
