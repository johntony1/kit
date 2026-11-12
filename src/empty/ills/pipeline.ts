// No builds yet: three build stages joined by pipes. A job runs through them in turn; each lights and spins while it works, then shows a tick.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const CX = [-13.6, 0, 13.6], S = 5.2; // stage centres, half size
const cl = (x: number) => Math.max(0, Math.min(1, x));

/** the mark in the round window on a stage's front, which lights as the stage runs: a dot while it waits, a turning arc while it runs, a tick when done */
function mark(p: Pen, cx: number, run: number, done: number) {
  const y = S + 0.03, zc = S;
  const pt = (u: number, v: number): V3 => [cx + u, y + 0.03, zc + v];
  p.ringV("y", [cx, y, zc], 4, done > 0.02 ? 0.5 : run >= 0 ? 0.36 : 0.03, SH.edge, 0.5);
  if (done > 0.02) p.line([pt(-2.4 * done, 0.1), pt(-0.8 * done, -1.7 * done), pt(2.4 * done, 1.9 * done)], SH.edge, 1.5);
  else if (run >= 0) {
    const a0 = -run * Math.PI * 4;
    p.line(Array.from({ length: 12 }, (_, i) => { const a = a0 + (i / 11) * 2.6; return pt(Math.cos(a) * 2.5, Math.sin(a) * 2.5); }), SH.edge, 1.3);
  } else p.dot(pt(0, 0), 0.7, 0.5);
}

export const pipeline: Illustration = {
  k: "pipeline", name: "CI pipeline", title: "No builds yet", body: "Push a commit to start your first build. Each stage will report here as it runs.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const fade = 1 - cl((u - 0.92) / 0.08); // the ticks clear before the next run
    p.translate(0, 0, -5);
    p.scale(1.12);
    p.rotate("z", -0.5);
    for (const cx of CX) p.shadow(cx, 0, 11, 5.5, 0.11);
    CX.forEach((cx, i) => {
      const t0 = 0.02 + i * 0.29, t1 = t0 + 0.2; // this stage runs from t0 to t1
      const run = u >= t0 && u < t1 ? (u - t0) / 0.2 : -1;
      const done = u >= t1 ? Math.min(cl((u - t1) / 0.05), fade) : 0;
      p.push();
      p.translate(0, 0, run >= 0 ? 1.2 * Math.sin(run * Math.PI) : 0);
      p.box(cx - S, -S, 0, S * 2, S * 2, S * 2, { top: run >= 0 ? 0.42 : 0.14 + 0.16 * done, left: 0.13, right: 0.065, lw: 0.6 });
      mark(p, cx, run, done);
      p.pop();
      if (i < 2) {
        // the pipe to the next stage, and the job passing along it
        const len = CX[i + 1] - cx - S * 2;
        p.box(cx + S, -1.1, 4.1, len, 2.2, 2.2, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
        const g = (u - t1) / 0.09;
        if (g > 0 && g < 1) p.dot([cx + S + len * g, 0, 7.9], 1.6, 1);
      }
    });
  },
};
