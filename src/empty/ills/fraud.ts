// Fraud alert: a warning beacon, dark and quiet under its glass dome. Hover and the lamp comes on and throws turning rays.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** a surface of revolution about a vertical axis through (cx, cy); prof is [z, r] from the bottom up.
 *  Small quads, back to front, each in a face tone by its normal, then the outline */
function lathe(p: Pen, cx: number, cy: number, rough: [number, number][], gain = 1, nu = 32) {
  const prof: [number, number][] = [rough[0]];
  for (let j = 1; j < rough.length; j++) {
    const [z0, r0] = rough[j - 1], [z1, r1] = rough[j], n = Math.ceil(Math.hypot(z1 - z0, r1 - r0) / 1.3);
    for (let s = 1; s <= n; s++) prof.push([z0 + ((z1 - z0) * s) / n, r0 + ((r1 - r0) * s) / n]);
  }
  const P = (a: number, z: number, r: number): V3 => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
  const A = (i: number) => (i / nu) * Math.PI * 2;
  const quads: { d: number; pts: V3[]; f: number }[] = [], see: boolean[][] = [];
  for (let j = 0; j < prof.length - 1; j++) {
    const [z0, r0] = prof[j], [z1, r1] = prof[j + 1];
    const L = Math.hypot(z1 - z0, r1 - r0) || 1, nz = (r0 - r1) / L, nr = (z1 - z0) / L;
    see.push([]);
    for (let i = 0; i < nu; i++) {
      const am = A(i + 0.5), nx = Math.cos(am) * nr, ny = Math.sin(am) * nr, v = nx + ny + nz > 0;
      see[j].push(v);
      if (!v) continue;
      quads.push({
        d: (Math.cos(am) + Math.sin(am)) * (r0 + r1) / 2 + (z0 + z1) / 2,
        pts: [P(A(i) - 0.03, z0 - 0.08, r0), P(A(i + 1) + 0.03, z0 - 0.08, r0), P(A(i + 1) + 0.03, z1 + 0.08, r1), P(A(i) - 0.03, z1 + 0.08, r1)],
        f: Math.max(0.052, (nz > 0.6 ? SH.top : ny >= nx ? 0.13 : SH.right) * gain),
      });
    }
  }
  quads.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
  for (let j = 0; j < see.length; j++) for (let i = 0; i < nu; i++) {
    if (!see[j][i]) continue;
    const [z0, r0] = prof[j], [z1, r1] = prof[j + 1];
    if (!see[j][(i + 1) % nu]) p.line([P(A(i + 1), z0, r0), P(A(i + 1), z1, r1)], SH.edge, 0.55);
    if (!see[j][(i + nu - 1) % nu]) p.line([P(A(i), z0, r0), P(A(i), z1, r1)], SH.edge, 0.55);
    if (j === see.length - 1 || !see[j + 1][i]) p.line([P(A(i), z1, r1), P(A(i + 1), z1, r1)], SH.edge, 0.55);
    if (j === 0 || !see[j - 1][i]) p.line([P(A(i), z0, r0), P(A(i + 1), z0, r0)], SH.edge, 0.55);
  }
}
/** a point on the plane that faces us through c: u to the right, v up */
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.7071 - v * 0.4082, c[1] - u * 0.7071 - v * 0.4082, c[2] + v * 0.8165];

const DR = 8, DZ = 5.4; // the dome: its radius and where it starts
const DOME: [number, number][] = [[DZ, DR], [DZ + 5, DR], ...Array.from({ length: 9 }, (_, i) => { const a = ((i + 1) / 9) * Math.PI / 2; return [DZ + 5 + Math.sin(a) * DR, Math.max(0.05, Math.cos(a) * DR)] as [number, number]; })];

export const fraud: Illustration = {
  k: "fraud", name: "Fraud alert", title: "No suspicious activity", body: "We keep watch around the clock. Anything unusual on your account will be flagged here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.scale(1.2);
    p.shadow(0, 0, 20, 10, 0.12);
    // the base: a wide foot and a collar
    p.cylinder(0, 0, 0, 11, 3.2, { side: 0.12, top: 0.2 });
    p.cylinder(0, 0, 3.2, 9, 2.2, { side: 0.16, top: 0.24 });
    // the dome, brighter as the lamp comes on
    const on = h * (0.75 + 0.25 * Math.sin(t * 9));
    lathe(p, 0, 0, DOME, 0.6 + 1.2 * on);
    // the lamp inside, seen through the glass
    const C: V3 = [0, 0, DZ + 6.5];
    p.line([bb(C, -2, -4.6), bb(C, -2, 0), bb(C, -1.4, 1.6), bb(C, 0, 2.2), bb(C, 1.4, 1.6), bb(C, 2, 0), bb(C, 2, -4.6)], SH.edge, 0.9);
    p.line([bb(C, -3.2, -4.7), bb(C, 3.2, -4.7)], SH.edge, 0.7);
    // the rays: short strokes around the dome, turning while it is lit
    if (h > 0.05) for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 1.6, r0 = 11.5, r1 = r0 + (i % 2 ? 3 : 5) * h;
      if (Math.sin(a) < -0.45) continue; // none below, where the base is
      const c = Math.cos(a), s = Math.sin(a), w = 0.75;
      p.face([bb(C, c * r0 - s * w, s * r0 + c * w + 1), bb(C, c * r1 - s * w, s * r1 + c * w + 1), bb(C, c * r1 + s * w, s * r1 - c * w + 1), bb(C, c * r0 + s * w, s * r0 - c * w + 1)], 0.32 * h, 0);
    }
  },
};
