// No activity yet: a heatmap panel standing on a foot, a four by four grid of square cells in four shades. A warm patch wanders round the grid and the cells brighten and dim as it passes.
import { type Illustration } from "../dots";

const P = 4; // seconds per loop
const N = 4, C = 6.8, G = 1.9; // cells per side, cell size, gap
// a little fixed texture so the grid never looks flat
const noise = (i: number, j: number) => { const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); };

export const heatmap: Illustration = {
  k: "heatmap", name: "Heatmap", title: "No activity yet", body: "Once things get busy, the busiest times will light up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P, a = u * Math.PI * 2;
    p.translate(0, 0, -17);
    p.shadow(0, 1, 26, 12, 0.12);
    p.rotate("z", -0.42);
    const S = C + G, X0 = (-N * S + G) / 2, Z0 = 4, side = N * S - G;
    // the foot, and the board: a lit frame round a dark face the cells sit on
    p.box(X0 - 4, -5, 0, side + 8, 10, 2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(X0 - 2.6, -2.5, 2, side + 5.2, 2, side + 4.6, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.face([[X0 - 1, -0.47, Z0 - 1], [X0 + side + 1, -0.47, Z0 - 1], [X0 + side + 1, -0.47, Z0 + side + 1], [X0 - 1, -0.47, Z0 + side + 1]], 0.025, 0);
    // the warm patch's centre, in cells
    const cx = 1.5 + 1.25 * Math.cos(a), cz = 1.5 + 1.25 * Math.sin(a);
    // cells, top row first, each a shallow tile in one of four shades
    for (let j = N - 1; j >= 0; j--) for (let i = 0; i < N; i++) {
      const v = Math.min(1, Math.exp(-((i - cx) ** 2 + (j - cz) ** 2) / 2.2) + noise(i, j) * 0.35);
      const face = v > 0.62 ? 0.34 : v > 0.4 ? 0.14 : v > 0.2 ? 0.075 : 0.04;
      p.box(X0 + i * S, -0.5, Z0 + j * S, C, 1.6, C, { top: 0.03, left: face, right: 0.03, edge: 0 });
    }
  },
};
