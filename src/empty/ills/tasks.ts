// No tasks yet: a clipboard with a checklist. Hover and the boxes tick one after another, then a plus badge pops in.
import { SH, type Illustration, type V3 } from "../dots";

const HW = 13, HT = 31, FY = 1.2; // half width, height, front face of the board
const ROWS = [21, 14, 7];
const LEN = [12, 8, 10];

export const tasks: Illustration = {
  k: "tasks", name: "Clipboard", title: "No tasks yet", body: "Add a task to get started. Everything you plan will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, -2, -15);
    p.shadow(0, 2, 24, 11, 0.11);
    p.push();
    p.rotate("z", -0.42);
    
    // board and paper
    p.box(-HW, 0, 0, HW * 2, FY, HT, { top: 0.22, left: 0.1, right: 0.07 });
    const y = FY + 0.05;
    p.face([[-HW + 2, y, 2], [HW - 2, y, 2], [HW - 2, y, HT - 3], [-HW + 2, y, HT - 3]], 0.17, SH.soft, 0.45);
    // the clip
    p.box(-5.5, FY, HT - 4.5, 11, 1.8, 5, { top: 0.3, left: 0.22, right: 0.12 });
    p.line([[-2.5, FY + 1.85, HT + 0.5], [-2.5, FY + 1.85, HT + 2.6], [2.5, FY + 1.85, HT + 2.6], [2.5, FY + 1.85, HT + 0.5]], SH.edge, 0.9);
    // rows: a box and a line each
    const yy = y + 0.05;
    ROWS.forEach((z, i) => {
      p.face([[-9, yy, z - 2.2], [-4.6, yy, z - 2.2], [-4.6, yy, z + 2.2], [-9, yy, z + 2.2]], 0.04, SH.edge, 0.6);
      p.line([[-1.5, yy, z], [-1.5 + LEN[i], yy, z]], 0.5, 1.1);
      // the tick, drawn as a growing line
      const k = Math.max(0, Math.min(1, (h - i * 0.2) / 0.32));
      if (k > 0) {
        const A: V3 = [-8.2, yy + 0.05, z + 0.4], B: V3 = [-6.9, yy + 0.05, z - 1.1], C: V3 = [-3.6, yy + 0.05, z + 3];
        const l1 = 2, l2 = 5.3, s = k * (l1 + l2);
        const lerp = (a: V3, b: V3, f: number): V3 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
        const pts: V3[] = s <= l1 ? [A, lerp(A, B, s / l1)] : [A, B, lerp(B, C, (s - l1) / l2)];
        p.line(pts, SH.edge, 1.4);
        p.line([[-1.5, yy + 0.02, z], [-1.5 + LEN[i], yy + 0.02, z]], 0.5 + 0.4 * k, 1.1);
      }
    });
    // the plus badge, popping in at the top right corner
    const b = Math.max(0, Math.min(1, (h - 0.68) / 0.32));
    if (b > 0) {
      const sc = b < 0.7 ? (b / 0.7) * 1.15 : 1.15 - ((b - 0.7) / 0.3) * 0.15;
      const c: V3 = [HW - 0.5, FY + 0.6, HT - 2];
      p.push(); p.scale(sc, c);
      p.ringV("y", c, 5, 1, SH.edge, 0.6);
      p.clear([[c[0] - 3.1, c[1] + 0.05, c[2] - 0.85], [c[0] + 3.1, c[1] + 0.05, c[2] - 0.85], [c[0] + 3.1, c[1] + 0.05, c[2] + 0.85], [c[0] - 3.1, c[1] + 0.05, c[2] + 0.85]]);
      p.clear([[c[0] - 0.85, c[1] + 0.05, c[2] - 3.1], [c[0] + 0.85, c[1] + 0.05, c[2] - 3.1], [c[0] + 0.85, c[1] + 0.05, c[2] + 3.1], [c[0] - 0.85, c[1] + 0.05, c[2] + 3.1]]);
      p.pop();
    }
    p.pop();
  },
};
