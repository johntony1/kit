// No time tracked: a stopwatch standing in its cradle. Its hand ticks round in steps, and the crown clicks at the top of each lap.
import { SH, type Illustration } from "../dots";

const P = 6; // seconds per lap
const R = 14, ZC = 17.6, D = 3.6; // radius, height of the centre, depth of the case

export const stopwatch: Illustration = {
  k: "stopwatch", name: "Stopwatch", title: "No time tracked", body: "Start a timer and your tracked time will be logged here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // twelve ticks a lap: a quick snap with a little overshoot, then a hold
    const n = Math.floor(u * 12), f = u * 12 - n;
    const step = f < 0.22 ? Math.min(1.15, 1 - Math.pow(1 - f / 0.22, 3) + Math.sin((f / 0.22) * Math.PI) * 0.12) : 1;
    const a = ((n + step) / 12) * Math.PI * 2;
    const press = u < 0.06 ? Math.sin((u / 0.06) * Math.PI) : 0; // the crown clicks at the top
    p.translate(0, 0, -19);
    p.shadow(0, -1.5, 24, 10, 0.1);
    // the crown and its stem, behind the top of the case
    const zt = ZC + R;
    p.box(-1.3, -D / 2 - 1.3, zt - 1, 2.6, 2.6, 3.2 - press, { top: 0.2 });
    p.cylinder(0, -D / 2, zt + 1.6 - press, 3, 2.8, { side: SH.left, top: 0.32 });
    // the lap button on the shoulder
    const bx = -R * 0.72, bz = ZC + R * 0.72;
    p.box(bx - 2.2, -D / 2 - 1.1, bz - 0.6, 2.2, 2.2, 2.2, { top: 0.2 });
    // the case: rings stepped from back to front give it depth
    for (let y = -D; y < 0; y += 0.25) p.ringV("y", [0, y, ZC], R, SH.right, 0);
    // bezel and dial
    p.ringV("y", [0, 0, ZC], R, SH.top, 0);
    p.ringV("y", [0, 0.01, ZC], R - 1.7, 0, SH.edge, 0.7);
    // the marks: long every quarter
    for (let i = 0; i < 12; i++) {
      const m = (i / 12) * Math.PI * 2, s = Math.sin(m), c = Math.cos(m);
      const r0 = i % 3 === 0 ? R - 5.4 : R - 4.2, r1 = R - 3;
      p.line([[s * r0, 0.02, ZC + c * r0], [s * r1, 0.02, ZC + c * r1]], SH.edge, i % 3 === 0 ? 1.1 : 0.7);
    }
    // the small minutes dial
    p.ringV("y", [0, 0.02, ZC - 4.6], 2.4, 0, SH.edge, 0.6);
    const mm = a / 12;
    p.line([[0, 0.03, ZC - 4.6], [Math.sin(mm) * 1.8, 0.03, ZC - 4.6 + Math.cos(mm) * 1.8]], SH.edge, 0.6);
    // where the lap started
    p.guide([[0, 0.05, ZC], [0, 0.05, ZC + R + 5]], true);
    // the hand
    p.line([[-Math.sin(a) * 2.2, 0.04, ZC - Math.cos(a) * 2.2], [Math.sin(a) * (R - 3.4), 0.04, ZC + Math.cos(a) * (R - 3.4)]], SH.edge, 1.3);
    p.dot([0, 0.05, ZC], 1.1, 0);
    // the cradle it stands in
    p.box(-5.5, -D - 2.4, 0, 11, D + 3, 4, { top: 0.2, left: 0.12, right: SH.right });
    p.line([[-4.5, 0.65, 2], [4.5, 0.65, 2]], SH.edge, 0.6);
  },
};
