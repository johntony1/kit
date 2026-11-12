// No workflows yet: a start button, a step and two outcomes joined by arrows on the floor. A pulse runs from the start through the step and out to one outcome, then the other; each block rises and lights as it passes.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop: one run down each branch
const Z = 0.05;
const bump = (x: number, at: number, w: number) => Math.max(0, 1 - Math.abs(x - at) / w);

export const workflow: Illustration = {
  k: "workflow", name: "Workflow", title: "No workflows yet", body: "Build a workflow to pass work from one step to the next without lifting a finger.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, run = (u * 2) % 1, side = u < 0.5 ? -1 : 1;
    p.translate(-2.7, 2.7, 0);
    p.scale(1.08);
    p.shadow(0, 0, 36, 18, 0.07);
    // the arrows on the floor
    const arrow = (pts: V3[]) => {
      const [x, y] = pts[pts.length - 1];
      p.line(pts, 0.7, 0.7);
      p.line([[x - 1.6, y - 1.4, Z], [x, y, Z], [x - 1.6, y + 1.4, Z]], 0.7, 0.7);
    };
    arrow([[-9, 0, Z], [-5.4, 0, Z]]);
    arrow([[3, 0, Z], [5.6, 0, Z], [5.6, -8, Z], [7.6, -8, Z]]);
    arrow([[5.6, 0, Z], [5.6, 8, Z], [7.6, 8, Z]]);
    // the pulse: along the path through the block centres, arriving a little before the run ends
    const path: [number, number][] = [[-13, 0], [-1, 0], [5.6, 0], [5.6, side * 8], [12, side * 8]];
    const q = Math.min(1, run / 0.82) * 32.6;
    let acc = 0;
    for (let i = 0; i < path.length - 1 && run < 0.82; i++) {
      const [ax, ay] = path[i], [bx, by] = path[i + 1], l = Math.hypot(bx - ax, by - ay);
      if (q <= acc + l) { const f = (q - acc) / l; p.dot([ax + (bx - ax) * f, ay + (by - ay) * f, 0.6], 1.5, 1); break; }
      acc += l;
    }
    // the blocks, back to front; each grows and lights as the pulse reaches it
    const gA = bump(run, 0.05, 0.12), gB = bump(run, 0.32, 0.14), gE = bump(run, 0.86, 0.14);
    const st = (g: number) => ({ top: 0.2 + 0.25 * g, left: 0.11 + 0.1 * g, right: 0.055 + 0.05 * g, lw: 0.6 });
    const hA = 3.2 + 1.6 * gA;
    p.cylinder(-13, 0, 0, 4.3, hA, { side: 0.11 + 0.1 * gA, top: 0.2 + 0.25 * gA, lw: 0.6 });
    p.face([[-14.4, -1.8, hA + 0.02], [-11, 0, hA + 0.02], [-14.4, 1.8, hA + 0.02]], 0.5, SH.edge, 0.5); // a play mark
    const hB = 3.4 + 1.6 * gB;
    p.box(-5, -4, 0, 8, 8, hB, st(gB));
    p.line([[-3, 0, hB + 0.02], [-1, -2, hB + 0.02], [1, 0, hB + 0.02], [-1, 2, hB + 0.02], [-3, 0, hB + 0.02]], SH.edge, 0.7); // a decision mark
    for (const s of [-1, 1]) {
      const g = s === side ? gE : 0, hE = 3.4 + 1.6 * g, cy = s * 8;
      p.box(8, cy - 4, 0, 8, 8, hE, st(g));
      p.line([[10, cy - 1.2, hE + 0.02], [14, cy - 1.2, hE + 0.02]], SH.edge, 0.8);
      p.line([[10, cy + 1.2, hE + 0.02], [12.6, cy + 1.2, hE + 0.02]], SH.edge, 0.6);
    }
  },
};
