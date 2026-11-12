// No scheduled jobs: a schedule strip of five stars with a small clock on top. The stars take turns to light and turn, and the clock hand steps round with them.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.5; // seconds per loop: five steps
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const cron: Illustration = {
  k: "cron", name: "Cron job", title: "No scheduled jobs", body: "Schedule a job to run on a timer. Its next run and its history will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u5 = ((t / P) % 1) * 5, idx = Math.floor(u5), f = u5 - idx;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 28, 14, 0.12);
    p.rotate("z", -0.45);
    p.box(-17, -3.2, 0, 34, 6.4, 11.5, { top: 0.2, left: 0.13, right: 0.065, lw: 0.6 });
    const fy = 3.23;
    for (let i = 0; i < 5; i++) {
      const cx = -12.8 + i * 6.4, on = i === idx;
      p.face([[cx - 2.7, fy, 2.6], [cx + 2.7, fy, 2.6], [cx + 2.7, fy, 8.9], [cx - 2.7, fy, 8.9]], on ? 0.6 : 0.3, SH.edge, 0.5);
      // a star: three strokes through the middle. The lit one turns a sixth, which lands it back on itself
      const rot = on ? ease(f) * (Math.PI / 3) : 0, r = on ? 2.3 + 0.3 * Math.sin(Math.PI * f) : 1.6;
      for (let j = 0; j < 3; j++) {
        const a = Math.PI / 2 - rot + (j * Math.PI) / 3;
        p.line([[cx - Math.cos(a) * r, fy + 0.03, 5.75 - Math.sin(a) * r], [cx + Math.cos(a) * r, fy + 0.03, 5.75 + Math.sin(a) * r]], on ? 1 : 0.7, on ? 1.4 : 0.8);
      }
    }
    // the clock: a thick disc on a foot, its long hand stepping a fifth of a turn with each star
    p.box(-3, -1.6, 11.5, 6, 3.2, 1.4, { top: 0.2, left: 0.2, right: 0.08 });
    const C: V3 = [0, 0, 19.6], R = 6.8;
    p.ringV("y", [C[0], -1.3, C[2]], R, SH.right, 0);
    p.ringV("y", [C[0], 1.3, C[2]], R, 0.26, SH.edge, 0.6);
    p.ringV("y", [C[0], 1.33, C[2]], R - 1.3, 0.03, 0);
    for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; p.dot([Math.sin(a) * (R - 2.5), 1.36, C[2] + Math.cos(a) * (R - 2.5)], 0.45, 0.7); }
    const th = ((idx + ease(f)) / 5) * Math.PI * 2;
    p.line([[0, 1.36, C[2]], [-2.1, 1.36, C[2] + 1.5]], SH.edge, 0.9);
    p.line([[0, 1.36, C[2]], [Math.sin(th) * 4.3, 1.36, C[2] + Math.cos(th) * 4.3]], SH.edge, 0.9);
    p.dot([0, 1.38, C[2]], 0.8, 1);
  },
};
