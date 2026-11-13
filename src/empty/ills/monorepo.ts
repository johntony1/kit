// No packages yet: one big crate packed with four smaller boxes, their lids showing in a square just over the rim. Hover and the four boxes pop up in turn with a small bounce.
import { type Illustration } from "../dots";


const C = 14, H = 12; // half width and height of the crate
// a pop up past its place and a settle back
const hop = (x: number) => (x <= 0 ? 0 : x < 0.6 ? Math.sin((x / 0.6) * Math.PI / 2) * 7 : 7 - Math.sin(((x - 0.6) / 0.4) * Math.PI) * 1.5);

export const monorepo: Illustration = {
  k: "monorepo", name: "Monorepo", title: "No packages yet", body: "Add your first package and the rest of the workspace can build on it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 32, 16, 0.12);
    // the dark inside of the crate
    p.clear([[-C, -C, H], [C, -C, H], [C, C, H], [-C, C, H]]);
    // four boxes packed in a square, back to front, their lids just over the rim; each pops up in turn
    const g = 2.4, s = C - g * 1.5;
    const cells: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    const order = [1, 0, 3, 2];
    cells.forEach(([sx, sy], i) => {
      const k = Math.min(1, Math.max(0, (h - order[i] * 0.16) / 0.45)), top = H + 1.6 + hop(k);
      const x = sx < 0 ? -C + g : g / 2, y = sy < 0 ? -C + g : g / 2;
      p.box(x, y, top - 14, s, s, 14, { top: 0.3, left: 0.12, right: 0.065, edge: 0 });
      p.line([[x + s / 2, y + 0.3, top + 0.05], [x + s / 2, y + s - 0.3, top + 0.05]], 1, 1); // the tape
    });
    // the two near walls of the crate, a plank seam round them, and the lit rim
    p.face([[-C, C, 0], [C, C, 0], [C, C, H], [-C, C, H]], 0.14, 0);
    p.face([[C, -C, 0], [C, C, 0], [C, C, H], [C, -C, H]], 0.065, 0);
    p.line([[-C, C + 0.05, H / 2], [C, C + 0.05, H / 2], [C + 0.05, -C, H / 2]], 1, 0.7);
    const r = 1.8, z = H + 0.05;
    p.face([[-C, -C, z], [C, -C, z], [C, -C + r, z], [-C, -C + r, z]], 0.2, 0);
    p.face([[-C, -C, z], [-C + r, -C, z], [-C + r, C, z], [-C, C, z]], 0.2, 0);
    p.face([[-C, C - r, z], [C, C - r, z], [C, C, z], [-C, C, z]], 0.3, 0);
    p.face([[C - r, -C, z], [C, -C, z], [C, C, z], [C - r, C, z]], 0.3, 0);
  },
};
