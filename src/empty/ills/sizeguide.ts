// No measurements saved: a tape measure. The tape pulls out along the floor, holds, then snaps back into its case.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
// the case from the side, in [x, z]: a square with three round corners and a flat foot
const CASE: [number, number][] = (() => {
  const out: [number, number][] = [[7.5, 0], [7.5, 9]];
  const arc = (cx: number, cz: number, a0: number, r: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  arc(2.5, 9, 0, 5); arc(-2.5, 9, Math.PI / 2, 5); arc(-3.5, 4, Math.PI, 4);
  return out;
})();

export const sizeguide: Illustration = {
  k: "sizeguide", name: "Tape measure", title: "No measurements saved", body: "Add your measurements once and we will suggest the right size every time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const L = 5 + 17 * (ease(cl((u - 0.05) / 0.4)) - Math.pow(cl((u - 0.72) / 0.14), 2)); // how much tape is out
    const kick = Math.max(0, 1 - Math.abs(u - 0.88) / 0.06) * 0.8; // the case jolts as the tape lands
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 13, 0.1);
    p.rotate("z", -0.42);
    p.translate(-10 - kick, 0, 0);
    const D = 3.6;
    // the tape: a bright ribbon along the floor with marks across it and a hook at the tip
    const x1 = 7.5 + L, zt = 1.3;
    p.face([[6, -2.3, zt], [x1, -2.3, zt], [x1, 2.3, zt], [6, 2.3, zt]], 0.5, SH.edge, 0.55);
    for (let j = 1; x1 - j * 1.6 > 7.6; j++) { const x = x1 - j * 1.6; p.line([[x, 2.3, zt + 0.02], [x, j % 4 ? 0.8 : -0.9, zt + 0.02]], 0, j % 4 ? 0.45 : 0.7); }
    p.box(x1, -2.6, 0, 0.8, 5.2, 2.3, { top: 0.9, left: 0.7, right: 0.5, lw: 0.5 });
    // the case: the strips that face us, then the near side
    const F = CASE.map(([x, z]) => [x, D, z] as V3), s = Math.sign(facing(p, F));
    CASE.forEach((a, i) => {
      const b = CASE[(i + 1) % CASE.length];
      const q: V3[] = [[b[0], D, b[1]], [a[0], D, a[1]], [a[0], -D, a[1]], [b[0], -D, b[1]]];
      if (facing(p, q) * s <= 0) return;
      const dx = Math.abs(b[0] - a[0]), dz = Math.abs(b[1] - a[1]);
      p.face(q, SH.right + (0.24 - SH.right) * (dx / (dx + dz || 1)), 0);
    });
    p.face(F, 0.13, SH.edge, 0.6);
    // the round badge on its side, turning as the tape runs, and the lock button on top
    p.ringV("y", [0, D + 0.03, 7.2], 4.6, 0.3, SH.edge, 0.6);
    const a = L * 0.5;
    p.line([[-Math.cos(a) * 3, D + 0.06, 7.2 - Math.sin(a) * 3], [Math.cos(a) * 3, D + 0.06, 7.2 + Math.sin(a) * 3]], 0, 0.7);
    p.dot([0, D + 0.06, 7.2], 1, 1);
    p.box(1.5, -1.4, 13.6, 4, 2.8, 1.2, { top: 0.6, left: 0.5, right: 0.3, lw: 0.5 });
  },
};
