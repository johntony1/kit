// No automations yet: a conveyor running through a small machine. Plain blocks ride in one side and come out the other side lit, while the machine's bolt and lamp flash.
import { SH, type Illustration } from "../dots";

const P = 3, PITCH = 12; // seconds per loop, gap between blocks
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const Z = 4.5, M = 5.5; // belt height, half length of the machine

export const automation: Illustration = {
  k: "automation", name: "Automation", title: "No automations yet", body: "Set a rule once and the routine work will take care of itself.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -9.5);
    p.shadow(0, 0, 36, 13, 0.1);
    // the conveyor on two feet, its ribs running forward
    p.box(-15.5, -3.5, 0, 3, 7, 2, { top: 0.1, left: 0.1, right: 0.05, edge: 0 });
    p.box(12.5, -3.5, 0, 3, 7, 2, { top: 0.1, left: 0.1, right: 0.05, edge: 0 });
    p.box(-18, -4.5, 2, 36, 9, 2.5, { top: 0.09, left: 0.16, right: 0.08, lw: 0.7 });
    for (let x = -17 + ((u * PITCH) % 3); x < 18; x += 3) p.line([[x, -4.5, Z + 0.02], [x, 4.5, Z + 0.02]], 0.45, 0.5);
    // a block between x0 and x1 only, so it can slide in and out of the machine
    const block = (c: number, x0: number, x1: number, lit: boolean) => {
      const a = Math.max(c - 2.4, x0), b = Math.min(c + 2.4, x1);
      if (b - a < 0.3) return;
      const s = Math.min(clamp((c + 18) / 3), clamp((18 - c) / 3));
      p.push();
      p.scale(s, [c, 0, Z]);
      p.box(a, -2.4, Z, b - a, 4.8, 4.4, lit ? { top: 0.42, left: 0.34, right: 0.16, lw: 0.6 } : { top: 0.14, left: 0.06, right: 0.035, lw: 0.6 });
      p.pop();
    };
    const cs = [0, 1, 2].map((i) => -18 + (i + u) * PITCH);
    for (const c of cs) block(c, -18, -M, false);
    // the machine: a housing over the belt with a tunnel, a bolt on its front and a lamp on top
    const flash = Math.max(0, 1 - Math.abs(u - 0.5) / 0.22);
    p.box(-M, -5.8, 2, M * 2, 11.6, 15, { top: 0.2, left: 0.07, right: 0.12, lw: 0.7 });
    p.clear([[M + 0.03, -3.2, Z], [M + 0.03, 3.2, Z], [M + 0.03, 3.2, Z + 6], [M + 0.03, -3.2, Z + 6]]);
    const F = 5.83;
    p.face([[1.2, F, 14.6], [-2.4, F, 9], [-0.3, F, 9], [-1.2, F, 4.6], [2.4, F, 10.4], [0.3, F, 10.4]], 0.3 + 0.5 * flash, SH.edge, 0.6);
    p.cylinder(1.5, -2, 17, 1.7, 1.6, { side: 0.14 + 0.4 * flash, top: 0.22 + 0.7 * flash });
    for (const c of cs) block(c, M, 18, true);
  },
};
