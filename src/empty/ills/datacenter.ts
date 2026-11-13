// No jobs running: a row of three tall server cabinets, each front lined with dark drive bays and a status light per bay. The lights run down the row in a slow idle wave, over and over.
import { type Illustration } from "../dots";

const P = 3; // seconds per loop
const CW = 8.5, CD = 6, CH = 24, BAYS = 5; // cabinet width, half depth, height, bays per cabinet

export const datacenter: Illustration = {
  k: "datacenter", name: "Data centre", title: "No jobs running", body: "Start a job and you will see it running on your machines here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 32, 13, 0.12);
    p.rotate("z", -0.5);
    for (let c = 0; c < 3; c++) {
      const x = -14.5 + c * (CW + 1);
      p.box(x, -CD, 0, CW, CD * 2, CH, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
      // the drive bays: dark slots across the front, each with its light
      for (let b = 0; b < BAYS; b++) {
        const z0 = 2.2 + b * 4.3, z1 = z0 + 2.9, y = CD + 0.03;
        p.face([[x + 1, y, z0], [x + CW - 1, y, z0], [x + CW - 1, y, z1], [x + 1, y, z1]], 0.03, 0);
        // a wave of light runs down the row: each light glows as it passes
        const i = c * BAYS + (BAYS - 1 - b), d = ((u * 15 - i) % 15 + 15) % 15;
        const on = d < 2.2 ? 1 - d / 2.2 : 0;
        p.dot([x + 2.4, y + 0.05, (z0 + z1) / 2], 0.85 + 0.35 * on, 0.35 + 0.65 * on);
        p.line([[x + 4, y + 0.05, (z0 + z1) / 2], [x + CW - 2, y + 0.05, (z0 + z1) / 2]], 0.35, 0.5);
      }
      // a cut down the edge between this cabinet and the next
      p.line([[x + CW, CD, 0], [x + CW, CD, CH]], 1, 0.5);
    }
  },
};
