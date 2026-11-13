// No fruit yet: a big wedge of watermelon standing on its rind, point up, with a thick shaded rind cut off by a dark groove and dark seeds in the flesh. It rocks gently on its rind, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const RZ = -0.42, CS = Math.cos(RZ) + Math.sin(RZ);
type P2 = [number, number];
// a flat shape drawn in the x-z plane, standing up and facing the viewer, given depth back along -y.
// The sides that face us are shaded by where they point (up: lit, right: in shade), then the front goes on top
function slab(p: Pen, pts: P2[], y0: number, d: number, front: number, top = SH.top, side = SH.right) {
  let a = 0;
  pts.forEach(([x0, z0], i) => { const [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; });
  const o = a > 0 ? 1 : -1, sides: { k: number; q: V3[]; f: number }[] = [];
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = (o * (z1 - z0)) / L, nz = (-o * (x1 - x0)) / L;
    if (nx * CS + nz <= 0.02) return;
    sides.push({ k: ((x0 + x1) / 2) * CS + (z0 + z1) / 2, q: [[x0, y0, z0], [x1, y0, z1], [x1, y0 - d, z1], [x0, y0 - d, z0]], f: nz > 0.55 ? top : side });
  });
  sides.sort((u, v) => u.k - v.k).forEach((s) => p.face(s.q, s.f, 0));
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, 0);
}
const arc = (cx: number, cz: number, rx: number, rz: number, a0 = 0, a1 = Math.PI * 2, n = 40): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * rx, cz + Math.sin(a) * rz] as P2; });

const P = 3.2, R = 36, HALF = 0.62, TOP = 36; // loop seconds, wedge radius, half its angle, height of the point
const DOWN = -Math.PI / 2;
// the wedge cut at radius r: the point, then the arc
const wedge = (r: number): P2[] => [[0, TOP], ...arc(0, TOP, r, r, DOWN - HALF, DOWN + HALF, 30)];
// a band of the wedge between two radii, as one closed shape
const band = (r0: number, r1: number): P2[] => [...arc(0, TOP, r1, r1, DOWN - HALF, DOWN + HALF, 30), ...arc(0, TOP, r0, r0, DOWN + HALF, DOWN - HALF, 30)];

export const watermelon: Illustration = {
  k: "watermelon", name: "Watermelon", title: "No fruit yet", body: "Add some fruit and it will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, rock = Math.sin(u * Math.PI * 2) * 0.13;
    p.translate(0, 0, -17);
    p.shadow(0, 2, 30, 12, 0.11);
    p.rotate("z", RZ);
    // rock about the centre of the rind's curve, so the rind stays on the floor
    p.rotate("y", rock, [0, 0, TOP]);
    // the slice, thick: its cut sides show as flesh
    slab(p, wedge(R), 0, 7, 0.22, 0.2, 0.1);
    // the rind: a shaded band, cut from the flesh by a dark groove
    p.face(band(R - 6, R).map(([x, z]) => [x, 0.03, z] as V3), 0.085, 0);
    p.clear(band(R - 7.4, R - 6).map(([x, z]) => [x, 0.05, z] as V3));
    // seeds: dark drops pointing at the tip, in two rows
    for (const [r, a] of [[14, -0.22], [14, 0.22], [21, -0.4], [21, 0], [21, 0.4], [27, -0.2], [27, 0.2]] as const) {
      const ang = DOWN + a, cx = Math.cos(ang) * r, cz = TOP + Math.sin(ang) * r;
      const ux = Math.cos(ang), uz = Math.sin(ang); // along the seed, away from the tip
      const pts = Array.from({ length: 16 }, (_, i) => {
        const q = (i / 16) * Math.PI * 2, l = Math.cos(q) * (Math.cos(q) > 0 ? 2.1 : 1.4), w = Math.sin(q) * 1.15;
        return [cx + ux * l - uz * w, 0.06, cz + uz * l + ux * w] as V3;
      });
      p.clear(pts);
    }
  },
};
