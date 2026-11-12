// Set square: a set square standing on its long edge with a pencil at its foot. Hover and the pencil runs up the sloping edge, drawing a line as it goes.
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
const A: P2 = [-17, 0], B: P2 = [17, 0], C: P2 = [-17, 29]; // the right angle, the foot of the slope, the top
const Y = 1;

export const setsquare: Illustration = {
  k: "setsquare", name: "Set square", title: "No exercises yet", body: "Exercises you are set will show up here, ready to work through.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-1, 0, -15);
    p.shadow(0, 0, 28, 11, 0.12);
    p.rotate("z", -0.5);
    slab(p, [A, B, C], Y, 2, 0.2);
    // the window cut through it
    p.clear([[-11.5, Y + 0.03, 5], [3.5, Y + 0.03, 5], [-11.5, Y + 0.03, 17.8]]);
    // the scale along the bottom edge and up the upright
    for (let i = 1; i < 11; i++) p.line([[-17 + i * 3, Y + 0.03, 0], [-17 + i * 3, Y + 0.03, i % 2 ? 1.6 : 2.8]], SH.edge, 0.5);
    for (let i = 1; i < 9; i++) p.line([[-17, Y + 0.03, i * 3], [i % 2 ? -15.4 : -14.2, Y + 0.03, i * 3]], SH.edge, 0.5);
    // the pencil rides up the slope, leaving a bright line behind it
    const s = 0.1 + 0.72 * e, s0 = 0.1;
    const nx = 0.649, nz = 0.761; // out from the slope
    const on = (k: number, off: number): V3 => [B[0] + (C[0] - B[0]) * k + nx * off, Y + 0.6, B[1] + (C[1] - B[1]) * k + nz * off];
    if (e > 0.02) {
      const [x0, y0] = p.pt(on(s0, 1.4)), [x1, y1] = p.pt(on(s, 1.4));
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.4; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
    }
    const wob = h * Math.sin(t * 5) * 0.04;
    const dx = Math.cos(0.95 + wob), dz = Math.sin(0.95 + wob); // the way the pencil points, away from the slope
    const tip = on(s, 1.4);
    const q = (l: number, w: number): V3 => [tip[0] + dx * l - dz * w, tip[1], tip[2] + dz * l + dx * w];
    p.face([q(0, 0), q(3.6, 1.5), q(3.6, -1.5)], 0.13, 0); // the sharpened end
    p.face([q(3.6, 1.5), q(15, 1.5), q(15, -1.5), q(3.6, -1.5)], 0.4, 0);
    p.face([q(15.6, 1.5), q(17.4, 1.5), q(17.4, -1.5), q(15.6, -1.5)], 0.4, 0); // the rubber, past a dark band
    p.dot(q(0.3, 0), 0.5, 1);
  },
};
