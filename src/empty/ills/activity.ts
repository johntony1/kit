// No activity: a grid floor where bars rise in turn, one after another, and sink back.
import { SH, type Illustration } from "../dots";

const P = 5;
const N = 4, C = 5, X0 = -10, Y0 = -10; // a 4 by 4 grid of 5 unit cells
const BARS: [number, number, number][] = [[2, 0, 2.5], [0, 1, 1.6], [3, 1, 3], [2, 2, 2], [1, 3, 2.8]]; // cell x, cell y, rest height
const UP = 9; // how much a bar grows in its turn

export const activity: Illustration = {
  k: "activity", name: "Activity grid", title: "No activity yet", body: "When your team gets going, their activity will build up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 14, 0.12);
    const W = 12;
    // the floor: lit in line art, dense in dots so the lit bars stand out on it
    p.box(-W, -W, 0, W * 2, W * 2, 2.4, { top: p.ink ? 0.2 : 0.12, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[-W, W, 2.4], [W, W, 2.4], [W, -W, 2.4]], SH.edge, 0.6);
    const Z = 2.42;
    // the grid lines, cut into the floor
    for (let i = 0; i <= N; i++) {
      p.line([[X0 + i * C, Y0, Z], [X0 + i * C, Y0 + N * C, Z]], SH.edge, 0.55);
      p.line([[X0, Y0 + i * C, Z], [X0 + N * C, Y0 + i * C, Z]], SH.edge, 0.55);
    }
    // an empty cell for today, dashed in the line art and sunken in dots
    {
      const x = X0 + 3 * C + 1, y = Y0 + 3 * C + 1, s = C - 2;
      const sq: [number, number, number][] = [[x, y, Z], [x + s, y, Z], [x + s, y + s, Z], [x, y + s, Z]];
      if (p.ink) p.guide([...sq, sq[0]], true); else p.face(sq, 0.03, 0);
    }
    // bars, back to front, each rising in its turn
    const order = BARS.map((b, i) => [b, i] as const).sort((a, b) => a[0][0] + a[0][1] - (b[0][0] + b[0][1]));
    for (const [[cx, cy, rest], i] of order) {
      const u = (((t / P - i / BARS.length) % 1) + 1) % 1;
      const k = u < 0.45 ? Math.sin((u / 0.45) * Math.PI) : 0;
      const bump = k * k * (3 - 2 * k);
      const hh = rest + bump * UP;
      const x = X0 + cx * C + 0.9, y = Y0 + cy * C + 0.9, s = C - 1.8;
      // a dashed ghost of how tall it gets
      const zt = Z + rest + UP;
      p.guide([[x, y + s, Z + hh], [x, y + s, zt], [x + s, y + s, zt], [x + s, y, zt], [x, y, zt], [x, y + s, zt]]);
      p.guide([[x + s, y + s, Z + hh], [x + s, y + s, zt]]);
      p.guide([[x + s, y, Z + hh], [x + s, y, zt]]);
      p.box(x, y, Z, s, s, hh, { top: bump > 0.45 ? 0.34 : 0.22, left: 0.12, right: 0.065 });
    }
  },
};
