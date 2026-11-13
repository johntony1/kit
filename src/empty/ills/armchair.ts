// Nobody is here yet: a fat club armchair seen from the front corner, rolled arms, a tall back and a plump seat cushion on short legs. Hover and a throw pillow drops onto the seat and bounces.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// height above the seat: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 18;
  if (k < 0.45) return 18 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 2.6 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 0.8 * 4 * v * (1 - v); }
  return 0;
}

// a rolled arm: a block from z0 up to the roll, the roll a half round along y on top, its front end rounded
function arm(p: Pen, x0: number, x1: number, y0: number, y1: number, z0: number, zt: number) {
  const r = (x1 - x0) / 2, cx = x0 + r, cz = zt - r, N = 12;
  p.face([[x1, y0, z0], [x1, y1, z0], [x1, y1, cz], [x1, y0, cz]], 0.065, 0); // outer side, in shade
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI - (i / N) * Math.PI, a1 = Math.PI - ((i + 1) / N) * Math.PI, m = (a0 + a1) / 2;
    const P = (a: number, y: number): V3 => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
    p.face([P(a0, y0), P(a1, y0), P(a1, y1), P(a0, y1)], Math.sin(m) > 0.5 ? 0.26 : Math.cos(m) > 0 ? 0.04 : 0.12, 0);
  }
  // the front: a block with a round top, dense
  const front: V3[] = [[x0, y1, z0], [x1, y1, z0]];
  for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI; front.push([cx + Math.cos(a) * r, y1, cz + Math.sin(a) * r]); }
  p.face(front, 0.2, 0);
}

export const armchair: Illustration = {
  k: "armchair", name: "Armchair", title: "Nobody is here yet", body: "When people join, they will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 2, 30, 14, 0.12);
    p.rotate("z", -0.68);
    // short legs at the four corners
    for (const [x, y] of [[-12, -9], [11, -9], [-12, 9.5], [11, 9.5]]) p.box(x, y, 0, 1.6, 1.6, 2.6, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    // the tall back, its top rolled and lit
    p.box(-13, -10, 2.6, 26, 5, 19, { top: 0.26, left: 0.07, right: 0.05, edge: 0 });
    // the base under the seat
    p.box(-7, -5, 2.6, 14, 16, 7.4, { top: 0.2, left: 0.03, right: 0.03, edge: 0 });
    // the left arm, then the seat cushion, then the right arm in front
    arm(p, -13, -7, -5, 11, 2.6, 16);
    p.box(-7, -5, 10, 14, 15.6, 3.8, { top: 0.3, left: 0.14, right: 0.065, edge: 0 });
    p.line([[-7, 10.65, 11.9], [7, 10.65, 11.9]], 1, 0.6); // the cushion's welt, a cut on its front
    p.line([[-7, 10.7, 9.9], [7, 10.7, 9.9]], 1, 0.9); // the gap under the cushion
    arm(p, 7, 13, -5, 11, 2.6, 16);
    // the throw pillow drops onto the seat
    const k = Math.min(1, h * 1.25);
    if (k > 0.01) {
      p.push();
      p.translate(0, 0, drop(k));
      p.rotate("x", -0.35, [0, 0, 13.8]);
      const s = 0.6 + 0.4 * ease(Math.min(1, k * 3));
      p.scale(s, [0, 0, 13.8]);
      p.box(-4.5, -4, 13.8, 9, 3.4, 9, { top: 0.3, left: 0.26, right: 0.1, edge: 0 });
      p.line([[0, -0.55, 14.6], [0, -0.55, 21.6]], 1, 0.7);
      p.pop();
    }
  },
};
