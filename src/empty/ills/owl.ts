// Owl: a sleepy owl on a branch, eyes half shut. Hover and it wakes: it hops, its eyes open wide and its ear tufts perk up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const TAU = Math.PI * 2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slab(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? 0.3 : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, 0);
}
const Y = 3.03, CZ = 17; // the owl's front, the middle of its body
const bump = (a: number, c: number) => Math.exp(-Math.pow((a - c) / 0.17, 2));

export const owl: Illustration = {
  k: "owl", name: "Owl", title: "No lessons started", body: "Pick a lesson to begin. Your progress will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 27, 11, 0.12);
    p.rotate("z", -0.5);
    // the branch
    p.box(-21, -2, 0, 42, 4, 3.2, { top: 0.3, left: 0.2, right: 0.075, edge: 0 });
    p.line([[-21, 2.03, 3.2], [21, 2.03, 3.2]], SH.edge, 0.5);
    p.push();
    p.translate(0, 0, Math.sin(Math.min(1, h * 1.4) * Math.PI) * 3.5);
    // the body: an egg with two ear tufts, which perk up on hover
    const tuft = 0.2 + 0.16 * e;
    const body: P2[] = Array.from({ length: 80 }, (_, i) => { const a = (i / 80) * TAU, r = 1 + tuft * (bump(a, 0.98) + bump(a, Math.PI - 0.98)); return [Math.cos(a) * 11.5 * r, CZ + Math.sin(a) * 13.5 * r] as P2; });
    slab(p, body, 3, 6, 0.2);
    // a sparse belly, and the wings as cuts down each side
    p.face(Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * TAU; return [Math.cos(a) * 6, Y, 10.4 + Math.sin(a) * 6.2] as V3; }), 0.07, 0);
    for (const s of [-1, 1]) p.line(Array.from({ length: 12 }, (_, i) => { const a = -1.25 + (i / 11) * 1.5; return [s * (3.6 + Math.cos(a) * 6.6), Y, 12.6 + Math.sin(a) * 9] as V3; }), SH.edge, 0.6);
    // the eyes: two round discs ringed with a cut, half shut at rest and wide open on hover
    const look = h * Math.sin(t * 1.3) * 0.7;
    for (const s of [-1, 1]) {
      const cx = s * 4.9, cz = 21.6, R = 4.5;
      p.clear(Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * TAU; return [cx + Math.cos(a) * R, Y, cz + Math.sin(a) * R] as V3; }));
      p.face(Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * TAU; return [cx + Math.cos(a) * (R - 0.9), Y + 0.02, cz + Math.sin(a) * (R - 0.9)] as V3; }), 0.4, 0);
      // the pupil, and the lid that covers the top of the eye until it wakes
      const pr = 1.7 + 0.5 * e, lid = 0.1 + (1 - e) * 0.55;
      p.clear(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * TAU; return [cx + look + Math.cos(a) * pr, Y + 0.04, cz - 0.3 * (1 - e) + Math.sin(a) * pr] as V3; }));
      const a0 = Math.asin(1 - 2 * lid);
      if (lid > 0.12) p.clear(Array.from({ length: 17 }, (_, i) => { const a = a0 + (i / 16) * (Math.PI - 2 * a0); return [cx + Math.cos(a) * (R - 0.85), Y + 0.06, cz + Math.sin(a) * (R - 0.85)] as V3; }));
    }
    // the beak
    p.clear([[-1.5, Y + 0.05, 18.4], [1.5, Y + 0.05, 18.4], [0, Y + 0.05, 15.6]]);
    // its feet over the branch
    for (const s of [-1, 1]) p.box(s * 3.4 - 1.3, 1.6, 2.4, 2.6, 1.8, 1.6, { top: 0.4, left: 0.36, right: 0.1, edge: 0 });
    p.pop();
  },
};
