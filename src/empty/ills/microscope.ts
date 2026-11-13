// No samples yet: a classic microscope seen side on, its curved arm holding a slanted tube over the stage. Hover and a glass slide glides onto the stage, the lamp under it lights and the tube racks down to focus.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a side profile (u along x, v up) at depth y, pushed back by d: its visible walls, then its face */
function ext(p: Pen, prof: P2[], y: number, d: number, front: number) {
  let a2 = 0;
  for (let i = 0; i < prof.length; i++) { const [u0, v0] = prof[i], [u1, v1] = prof[(i + 1) % prof.length]; a2 += u0 * v1 - u1 * v0; }
  const pr = a2 > 0 ? prof : prof.slice().reverse(), n = pr.length;
  for (let i = 0; i < n; i++) {
    const [u0, v0] = pr[i], [u1, v1] = pr[(i + 1) % n], L = Math.hypot(u1 - u0, v1 - v0) || 1;
    const nu = (v1 - v0) / L, nv = -(u1 - u0) / L; // outward normal in the profile
    const q: V3[] = [[u0, y, v0], [u1, y, v1], [u1, y - d, v1], [u0, y - d, v0]];
    if (facing(p, q) === 0) continue;
    if (nv > 0.45 || nu > 0) p.face(q, nv > 0.45 ? 0.22 : 0.065, 0);
  }
  p.face(pr.map(([u, v]) => [u, y, v] as V3), front, SH.edge, 0.6);
}
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
/** a rectangle along the axis from a to b, w wide */
const bar = (a: P2, b: P2, w: number): P2[] => {
  const du = b[0] - a[0], dv = b[1] - a[1], L = Math.hypot(du, dv) || 1, nu = (-dv / L) * w / 2, nv = (du / L) * w / 2;
  return [[a[0] + nu, a[1] + nv], [b[0] + nu, b[1] + nv], [b[0] - nu, b[1] - nv], [a[0] - nu, a[1] - nv]];
};
// the arm: up from the back of the base, curving over to grip the tube
const ARM: P2[] = [[5, 3], [12.5, 3], [12.5, 20], [11.4, 27], [8.4, 32.6], [3.6, 36.2], [-2.4, 37.6], [-3.6, 31.4], [2, 29.4], [5.2, 25], [6.2, 19]];

export const microscope: Illustration = {
  k: "microscope", name: "Microscope", title: "No samples yet", body: "Add a sample and its results will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const slide = ease(cl(h / 0.5)), lamp = cl((h - 0.4) / 0.25), focus = 1.4 * ease(cl((h - 0.55) / 0.4)) + h * 0.12 * Math.sin(t * 3);
    p.translate(0, 0, -22);
    p.scale(1.12);
    p.shadow(0, 0, 26, 10, 0.12);
    p.rotate("z", -0.72);
    // the base: a long heavy foot, the lamp on it
    p.box(-15, -5, 0, 29, 10, 3, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.cylinder(-4, 0, 3, 2.4, 1.6, { side: 0.12, top: 0.06 + 0.9 * lamp, edge: 0 });
    // the arm
    ext(p, ARM, 2, 4, 0.11);
    // the stage, standing clear of the base, and the slide gliding onto it from the left
    p.box(-13, -4.5, 13, 19, 9, 1.8, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    if (slide > 0.02) {
      const x = -24 + 17 * slide;
      p.box(x - 4.5, -2.5, 14.8, 9, 5, 0.6, { top: 0.45, left: 0.2, right: 0.12, edge: 0 });
      p.dot([x, 0, 15.4], 1, 0);
    }
    // the focus knob on the side of the arm
    p.ringV("y", [9.4, 2.1, 15], 3.2, 0.3, 0, 0.6);
    p.dot([9.4, 2.15, 15], 1.1, 0);
    // the tube, slanted up to the left, racking down to focus
    p.push();
    p.translate(0, 0, -focus);
    ext(p, bar([-3.2, 17.4], [-4.2, 21.4], 4), 1.8, 3.6, 0.12); // the lens
    ext(p, bar([-4.4, 21], [-11, 38], 7.2), 3.4, 6.8, 0.3); // the body tube
    p.line(bar([-11.1, 38.2], [-11.2, 38.4], 7.2).slice(0, 2).map(([u, v]) => [u, 3.43, v] as V3), SH.edge, 0.8);
    ext(p, bar([-11.2, 38.4], [-12.8, 42.6], 5.4), 2.6, 5.2, 0.24); // the eyepiece
    p.pop();
  },
};
