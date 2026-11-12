// No widgets yet: a dashboard board with three empty slots. Hover and a bar chart, a ring and a trend line rise out of the slots one after another.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const out = (x: number) => 1 - Math.pow(1 - x, 3);
const Z = 2.42;
const TREND: [number, number][] = [[-12, 8.2], [-7, 5.4], [-3, 7], [2, 4.2], [7, 5.6], [12, 3]];

export const dashboard: Illustration = {
  k: "dashboard", name: "Dashboard", title: "No widgets yet", body: "Add a widget to start tracking the numbers you care about.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -6);
    p.shadow(0, 0, 34, 16, 0.1);
    p.box(-17, -13, 0, 34, 26, 2.4, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    // an empty slot: dark and sunken, its far walls catching light
    const slot = (x0: number, y0: number, x1: number, y1: number) => {
      p.face([[x0, y0, Z], [x1, y0, Z], [x1, y1, Z], [x0, y1, Z]], 0.03, SH.edge, 0.45);
      p.face([[x0, y0, Z], [x1, y0, Z], [x1, y0 + 0.8, Z], [x0, y0 + 0.8, Z]], 0.12, 0);
      p.face([[x0, y0, Z], [x0 + 0.8, y0, Z], [x0 + 0.8, y1, Z], [x0, y1, Z]], 0.065, 0);
    };
    slot(-15, -11, -1, -1); slot(1, -11, 15, -1); slot(-15, 1, 15, 11);
    const kA = out(clamp(h / 0.5)), kB = out(clamp((h - 0.2) / 0.5)), kC = out(clamp((h - 0.4) / 0.45));
    // the bar chart
    if (kA > 0.02) [3.4, 6.2, 4.6, 8.4].forEach((hgt, i) => p.box(-13.6 + i * 3.1, -7.8, Z, 2.2, 3.4, hgt * kA, { top: 0.4, left: 0.3, right: 0.14 }));
    // the ring
    if (kB > 0.02) {
      p.cylinder(8, -6, Z, 4.3, 3.4 * kB, { side: 0.22, top: 0.36, lw: 0.6 });
      p.disc(8, -6, Z + 3.4 * kB + 0.02, 2, 0.03, SH.edge);
    }
    // the trend tile: a raised tile whose line draws itself
    if (kC > 0.02) {
      const zt = Z + 1.3 * kC + 0.02;
      p.box(-13.6, 2.4, Z, 27.2, 7.2, 1.3 * kC, { top: 0.14, left: 0.2, right: 0.1, lw: 0.6 });
      const d = clamp((h - 0.6) / 0.4) * (TREND.length - 1), n = Math.floor(d), f = d - n;
      const pts: V3[] = TREND.slice(0, n + 1).map(([x, y]) => [x, y, zt] as V3);
      if (n < TREND.length - 1) pts.push([TREND[n][0] + (TREND[n + 1][0] - TREND[n][0]) * f, TREND[n][1] + (TREND[n + 1][1] - TREND[n][1]) * f, zt]);
      if (d > 0.02) { p.line(pts, SH.edge, 1); p.dot(pts[pts.length - 1], 1.1, 1); }
    }
  },
};
