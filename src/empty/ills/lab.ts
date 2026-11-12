// No experiments recorded: a microscope with a slide on its stage. The tube racks down and up to focus, the knob turns and the sample under the lens glints, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.4; // seconds per loop
/** screen winding: > 0 when an outward face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat shape in the plane that faces left, given as [x, z] points, with thickness from y0 to y1 */
function prism(p: Pen, poly: [number, number][], y0: number, y1: number, front: number = SH.left, edge: number = SH.edge) {
  let a = 0;
  poly.forEach(([x, z], i) => { const [x2, z2] = poly[(i + 1) % poly.length]; a += x * z2 - x2 * z; });
  const pts = a > 0 ? poly.slice().reverse() : poly;
  pts.forEach((q, i) => {
    const b = pts[(i + 1) % pts.length], f: V3[] = [[q[0], y1, q[1]], [q[0], y0, q[1]], [b[0], y0, b[1]], [b[0], y1, b[1]]];
    if (facing(p, f) > 0) p.face(f, b[0] - q[0] > Math.abs(b[1] - q[1]) * 0.3 ? SH.top : SH.right, edge, 0.5);
  });
  p.face(pts.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.6);
}
const B: [number, number] = [5.2, 11], DX = -0.42, DZ = 0.908; // the lens end of the tube, and the tube's direction
/** a length of the tube: from s0 to s1 along it, w to each side */
const tube = (s0: number, s1: number, w: number, f: number): [number, number][] =>
  ([[s0, -w], [s1, -w], [s1, w], [s0, w]] as [number, number][]).map(([s, n]) => [B[0] + DX * (s + f) + DZ * n, B[1] + DZ * (s + f) - DX * n]);

export const lab: Illustration = {
  k: "lab", name: "Microscope", title: "No experiments recorded", body: "Record your first experiment and its notes and results will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, f = 0.9 - 0.9 * Math.cos(u * Math.PI * 2);
    p.translate(-1, 0, -15);
    p.scale(1.12);
    p.shadow(1, 0, 24, 12, 0.12);
    // the foot and the bent arm
    p.box(-10, -6, 0, 22, 12, 2.4);
    prism(p, [[-9, 2.4], [-4.4, 2.4], [-4.4, 11], [-2.4, 16.5], [2, 20.5], [-0.4, 24], [-6.4, 19.5], [-9, 12.5]], -2.2, 2.2, 0.14);
    // the lamp, the stage on its post, and a slide
    p.box(2.2, -2.6, 2.4, 5.6, 5.2, 5.4, { top: 0.2 });
    p.box(-2.4, -5.5, 7.8, 14, 11, 1.2, { top: 0.24 });
    p.box(1.4, -2, 9, 8, 4, 0.4, { top: 0.38, left: 0.3, right: 0.2, lw: 0.4 });
    // the sample glints when the lens is closest
    const glint = Math.pow(Math.max(0, Math.cos(u * Math.PI * 2)), 3);
    p.dot([5.2, 0, 9.5], 0.7 + glint * 1.1, 0.02 + glint);
    // the tube: lens, turret, barrel, eyepiece
    prism(p, tube(0.6, 3.4, 1.3, f), -1.3, 1.3, 0.3);
    prism(p, tube(3.4, 5.6, 2.9, f), -2.6, 2.6, 0.12);
    prism(p, tube(5.6, 15.5, 2.3, f), -2.2, 2.2, 0.2);
    prism(p, tube(15.5, 16.6, 2.9, f), -2.6, 2.6, 0.3);
    prism(p, tube(16.6, 20, 1.6, f), -1.5, 1.5, 0.14);
    // the focus knob on the arm, turning with the tube
    const a = f * 1.6;
    p.ringV("y", [-6.6, 2.23, 8.4], 2.6, 0.34, SH.edge, 0.6);
    p.line([[-6.6 - Math.cos(a) * 2.2, 2.26, 8.4 - Math.sin(a) * 2.2], [-6.6 + Math.cos(a) * 2.2, 2.26, 8.4 + Math.sin(a) * 2.2]], SH.edge, 0.6);
    for (let i = 0; i < 3; i++) { const k = (u + i / 3) % 1; p.dot([9 + i * 2.5, -1 + i, 13 + k * 6], 0.7, Math.sin(k * Math.PI) * 0.9); }
  },
};
