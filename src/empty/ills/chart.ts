// No data yet: a bar chart on a little stand. The bars rise out of nothing, one after another, then sink back down.
import { easeInOut, SH, type Illustration } from "../dots";

const P = 4.4; // seconds per loop
const BARS = [
  { x: -14, top: 11 },
  { x: -6.5, top: 19 },
  { x: 1, top: 8 },
  { x: 8.5, top: 25 },
];
const BW = 5; // bar width (x) and depth (y)
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export const chart: Illustration = {
  k: "chart", name: "Bar chart", title: "Nothing to chart yet", body: "Once there is something to measure, your charts will fill in here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(1, 0, -12);
    p.shadow(0, 0, 30, 13, 0.1);
    // the back panel: a dark board with bright grid lines
    p.box(-18, -9, 0, 36, 1.6, 30, { top: 0.2, left: 0.035, right: 0.065 });
    for (let i = 1; i <= 4; i++) {
      const z = 3 + i * 5.6;
      p.face([[-16.5, -7.38, z - 0.4], [16.5, -7.38, z - 0.4], [16.5, -7.38, z + 0.4], [-16.5, -7.38, z + 0.4]], SH.top, 0);
    }
    // the base slab the bars stand on
    p.box(-18, -7, 0, 36, 13, 3, { top: 0.2, left: 0.12, right: 0.065 });
    // the axis: a cut along the front of the slab top
    p.line([[-17, 4.6, 3.02], [17, 4.6, 3.02]], 1, 0.7);
    // bars, back to front along x
    BARS.forEach((b, i) => {
      const up = clamp((u - 0.08 - i * 0.07) / 0.24);
      const down = clamp((u - 0.62 - i * 0.04) / 0.2);
      const k = easeOut(up) * (1 - easeInOut(down));
      const hgt = b.top * k;
      const y0 = -3;
      if (hgt < 0.6) {
        // nothing yet: a dashed footprint where the bar will stand
        const z = 3.03, x0 = b.x, x1 = b.x + BW, y1 = y0 + BW;
        p.line([[x0, y0, z], [x1, y0, z]], 1, 0.55); p.line([[x0, y1, z], [x1, y1, z]], 1, 0.55);
        p.line([[x0, y0, z], [x0, y1, z]], 1, 0.55); p.line([[x1, y0, z], [x1, y1, z]], 1, 0.55);
        return;
      }
      p.box(b.x, y0, 3, BW, BW, hgt, { top: 0.2, left: 0.13, right: 0.065 });
      // a cut that keeps the lit top apart from the front
      p.line([[b.x, y0 + BW, 3 + hgt], [b.x + BW, y0 + BW, 3 + hgt]], 1, 0.6);
    });
  },
};
