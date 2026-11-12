// Postcard: the back of a postcard, leaning as if propped up, with lines for a message and an address and an empty box for the stamp. Hover and a stamp flies in and lands in the box, and a postmark rings it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
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
const W = 19, H = 25, Y = 0.6;
const rect = (x0: number, x1: number, z0: number, z1: number, y = Y + 0.03): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

export const postcard: Illustration = {
  k: "postcard", name: "Postcard", title: "No postcards yet", body: "Send a postcard to someone and it will be kept here with the ones you receive.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.scale(1.15);
    p.shadow(0, -2, 28, 12, 0.12);
    p.rotate("z", -0.5);
    p.rotate("x", 0.3 + h * Math.sin(t * 2.2) * 0.012);
    slab(p, [[-W, 0], [W, 0], [W, H], [-W, H]], Y, 1.2, 0.2);
    // the line down the middle, the message on the left, the address on the right
    p.line([[1, Y + 0.03, 3.5], [1, Y + 0.03, H - 3.5]], SH.edge, 0.6);
    ([[-15.5, -3, 18.5], [-15.5, -3, 14.5], [-15.5, -3, 10.5], [-15.5, -8.5, 6.5], [5, 15.5, 11], [5, 15.5, 7.5], [5, 15.5, 4]] as const).forEach(([x0, x1, z]) => p.line([[x0, Y + 0.03, z], [x1, Y + 0.03, z]], SH.edge, 0.7));
    // the box for the stamp
    const sx0 = 8.6, sx1 = 15.6, sz0 = 14.4, sz1 = 22;
    p.line([...rect(sx0, sx1, sz0, sz1), [sx0, Y + 0.03, sz0]], SH.edge, 0.5);
    // the stamp: flies in from in front and lands flat with a small bounce
    const k = Math.min(1, h / 0.6);
    if (k > 0.01) {
      const land = ease(k), off = (1 - land) * 16 + (k > 0.8 ? 0 : 0) + Math.sin(Math.min(1, k) * Math.PI) * 2;
      const y = Y + 0.06 + off;
      p.clear(rect(sx0 - 0.5, sx1 + 0.5, sz0 - 0.5 + off * 0.5, sz1 + 0.5 + off * 0.5, y));
      p.face(rect(sx0 + 0.5, sx1 - 0.5, sz0 + 0.5 + off * 0.5, sz1 - 0.5 + off * 0.5, y + 0.02), 0.42, 0);
      // a little sun on the stamp
      p.dot([(sx0 + sx1) / 2, y + 0.04, (sz0 + sz1) / 2 + off * 0.5], 1.5, 0);
    }
    // the postmark: wavy lines struck across the stamp's edge once it has landed
    const m = Math.max(0, (h - 0.65) / 0.35);
    if (m > 0) for (const z of [16.4, 18.3, 20.2]) {
      const n = Math.max(2, Math.round(14 * m));
      p.line(Array.from({ length: n }, (_, i) => [2.6 + i * 0.5, Y + 0.09, z + Math.sin(i * 0.9) * 0.55] as V3), SH.edge, 0.55);
    }
  },
};
