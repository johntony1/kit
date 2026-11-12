// No assignments yet: a worksheet lying on the desk with a pencil beside it. Hover and the pencil comes over and ticks the circle at the top.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const CX = 6.2, CY = -9, R = 3.8; // the circle on the sheet
const TICK: V3[] = [[CX - 1.9, CY - 0.1, 0.75], [CX - 0.5, CY + 1.5, 0.75], [CX + 2.1, CY - 1.8, 0.75]];
const REST: V3 = [9, 19.5, 0];

export const assignment: Illustration = {
  k: "assignment", name: "Assignment", title: "No assignments yet", body: "Assignments from your courses will show here when they are set.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, -4, -3);
    p.scale(1.12);
    p.shadow(0, 2, 28, 14, 0.1);
    // the sheet, a second one peeking out under it
    p.push(); p.rotate("z", 0.09); p.box(-11.5, -15, 0, 23, 30, 0.3, { top: 0.12, lw: 0.45 }); p.pop();
    p.box(-11.5, -15, 0.3, 23, 30, 0.4, { top: 0.2, lw: 0.6 });
    const z = 0.75;
    // a heading, then the questions: a number dot and a line each
    p.line([[-8.5, -11.2, z], [-0.5, -11.2, z]], SH.edge, 1.1);
    p.line([[-8.5, -8.4, z], [-3.5, -8.4, z]], 0.6, 0.55);
    for (let i = 0; i < 5; i++) {
      const y = -3.6 + i * 3.6;
      p.dot([-8.2, y, z], 0.6, 0.9);
      p.line([[-6, y, z], [i % 2 ? 5 : 8.5, y, z]], 0.6, 0.55);
    }
    // the circle, and the tick the pencil draws in it
    const a = ease(Math.min(1, h / 0.45)), d = Math.min(1, Math.max(0, (h - 0.45) / 0.35)), off = ease(Math.max(0, (h - 0.82) / 0.18));
    p.disc(CX, CY, z, R, 0.04 + 0.3 * (d >= 1 ? 1 : 0), SH.edge);
    const at = (u: number): V3 => {
      const s = u < 0.35 ? [TICK[0], TICK[1], u / 0.35] as const : [TICK[1], TICK[2], (u - 0.35) / 0.65] as const;
      return [s[0][0] + (s[1][0] - s[0][0]) * s[2], s[0][1] + (s[1][1] - s[0][1]) * s[2], z];
    };
    if (d > 0) p.line(d < 0.35 ? [TICK[0], at(d)] : [TICK[0], TICK[1], at(d)], SH.edge, 1.2);
    // the pencil: lying in front at rest, tilting up onto its point to write, then lifting clear
    const tip0 = at(d);
    const tip: V3 = [REST[0] + (tip0[0] - REST[0]) * a + 2 * off, REST[1] + (tip0[1] - REST[1]) * a + 2 * off, Math.sin(Math.PI * Math.min(1, a)) * 5 * (a < 1 ? 1 : 0) + z * a + 4 * off];
    p.push();
    p.translate(tip[0], tip[1], tip[2]);
    p.rotate("y", 0.62 * a);
    p.box(-18.5, -1, 0, 2, 2, 2, { top: 0.5, left: 0.4, right: 0.3, lw: 0.5 }); // the rubber
    p.box(-16.5, -1, 0, 13, 2, 2, { top: 0.24, left: 0.14, lw: 0.55 });
    p.line([[-16.5, 1.03, 1], [-3.5, 1.03, 1]], 0.5, 0.35);
    p.face([[-3.5, -1, 2], [-3.5, 1, 2], [0, 0, 0.9]], 0.34, SH.edge, 0.5);
    p.face([[-3.5, 1, 0], [-3.5, 1, 2], [0, 0, 0.9]], 0.24, SH.edge, 0.5);
    p.dot([-0.3, 0, 0.9], 0.55, 1);
    p.pop();
  },
};
