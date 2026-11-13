// Nothing on the plan: a Gantt board standing up, a dark chart in a lit frame with four bold task bars stepping down it like stairs. Hover and the bars stretch out one after another to their full length.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const W = 21, H = 34, D = 2.4, F = 0.03; // half width, height, thickness, the front plane
// each task: where it starts and its full length along x, inside the chart
const BARS: [number, number][] = [[-16.5, 15], [-9, 13], [-2.5, 15], [4.5, 12]];

export const gantt: Illustration = {
  k: "gantt", name: "Gantt chart", title: "Nothing on the plan", body: "Add tasks with dates and they will line up on the plan here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -20);
    p.shadow(0, 0, 22, 8, 0.12);
    p.rotate("z", -0.62); // turned to face us
    // the board: a slab with a lit frame and a header strip, the chart inside it dark
    p.box(-W, -D, 0, W * 2, D, H, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    p.clear([[-W + 1.8, F, 1.8], [W - 1.8, F, 1.8], [W - 1.8, F, H - 6], [-W + 1.8, F, H - 6]]);
    // two dots and a short line in the header
    p.dot([-W + 4, F + 0.02, H - 3], 0.9, 0);
    p.dot([-W + 7, F + 0.02, H - 3], 0.9, 0);
    p.line([[-W + 11, F + 0.02, H - 3], [4, F + 0.02, H - 3]], 1, 1);
    // the bars, each growing in turn on hover
    BARS.forEach(([x0, len], i) => {
      const g = ease(clamp((h - i * 0.14) / 0.5));
      const l = len * (0.62 + 0.38 * g), z1 = H - 7.6 - i * 6.3, z0 = z1 - 4.8, r = 1.6;
      const pts: V3[] = [];
      for (let j = 0; j <= 5; j++) { const a = -Math.PI / 2 + (j / 5) * Math.PI; pts.push([x0 + l - r + Math.cos(a) * r, F + 0.04, (z0 + z1) / 2 + Math.sin(a) * ((z1 - z0) / 2)]); }
      for (let j = 0; j <= 5; j++) { const a = Math.PI / 2 + (j / 5) * Math.PI; pts.push([x0 + r + Math.cos(a) * r, F + 0.04, (z0 + z1) / 2 + Math.sin(a) * ((z1 - z0) / 2)]); }
      p.face(pts, 0.3, 0);
    });
  },
};
