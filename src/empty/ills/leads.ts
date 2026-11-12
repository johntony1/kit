// No leads yet: a horseshoe magnet standing with its poles up. Bright specks drift in from above and are pulled down onto the poles, over and over.
import { type Illustration } from "../dots";

const P = 3;
const START = [-19, 16, -9, 21, -15, 8]; // where each speck comes in, across the frame

export const leads: Illustration = {
  k: "leads", name: "Leads", title: "No leads yet", body: "Share your signup form or import a list, and new leads will be drawn in here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 26, 13, 0.11);
    p.rotate("z", -0.45);
    // the magnet: a bar along the floor and two arms, with bright pole tips that pulse as a speck lands
    const body = { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 };
    p.box(-11.5, -3.6, 0, 23, 7.2, 7, body);
    [-11.5, 4].forEach((x, i) => {
      p.box(x, -3.6, 7, 7.5, 7.2, 9.5, body);
      const hit = Math.max(0, Math.sin(((u * 3 + i * 0.5) % 1) * Math.PI * 2 - 4.6)) * 0.5;
      p.box(x, -3.6, 16.5, 7.5, 7.2, 1.3, { top: 0, left: 0.03, right: 0.03, edge: 0 });
      p.box(x, -3.6, 17.8, 7.5, 7.2, 4.4 + hit, { top: 0.34, left: 0.3, right: 0.3, lw: 0.6 });
    });
    p.guide([[-7.75, 0, 22], [-7.75, 0, 36]]); p.guide([[7.75, 0, 22], [7.75, 0, 36]]);
    // the specks: slow at first, then snatched onto the nearer pole
    START.forEach((sx, i) => {
      const v = (u + i / 6) % 1, k = v * v * v * 0.6 + v * 0.4;
      const tx = sx < 0 ? -7.75 : 7.75;
      const x = sx + (tx - sx) * Math.min(1, k * 1.25), z = 42 - (i % 2) * 3 - (20 - (i % 2) * 3) * k;
      const r = 1.8 * Math.min(1, v * 5) * Math.min(1, (1 - v) * 9);
      if (r > 0.1) p.dot([x, 0, z], r, 1);
    });
  },
};
