// No breathing data: a pair of lungs standing up, two smooth lit lobes with a clear gap between them, the bright windpipe above branching into dark airways cut into each lobe. They swell as they breathe in and ease back out, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const RZ = -0.45, CS = Math.cos(RZ) + Math.sin(RZ);
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

const P = 3.6;
// round off a polygon's corners (Chaikin)
function smooth(pts: P2[], n = 3): P2[] {
  let q = pts;
  for (let k = 0; k < n; k++) q = q.flatMap((a, i) => { const b = q[(i + 1) % q.length]; return [[a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]] as P2[]; });
  return q;
}
// the right lobe (the left one is its mirror, a little narrower round the heart)
const LOBE: P2[] = [[3, 25], [7, 30], [13, 28], [18, 19], [20, 8], [19, 0], [14, -3], [7, -2], [3, 2], [2.5, 12]];
// a thick stroke between two points, as a closed shape
const tube = (a: P2, b: P2, w: number): P2[] => {
  const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = (-dz / l) * w, nz = (dx / l) * w;
  return [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]];
};
const at = (q: P2[], y: number) => q.map(([x, z]) => [x, y, z] as V3);

export const lungs: Illustration = {
  k: "lungs", name: "Lungs", title: "No breathing data", body: "Wear your watch to bed and your breathing rate will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, b = 0.5 - 0.5 * Math.cos(u * Math.PI * 2); // 0 out, 1 in
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 11, 0.1);
    p.rotate("z", RZ);
    p.scale(1 + b * 0.06, [0, 0, 0]);
    for (const s of [-1, 1]) {
      const lobe = smooth(LOBE.map(([x, z]) => [s * (x + 0.8) * (s < 0 ? 0.94 : 1), z] as P2));
      slab(p, lobe, 0, 6, 0.22, 0.24, 0.085);
      // airways cut into the lobe: a main branch and two smaller ones
      const m: P2 = [s * 2, 22], e: P2 = [s * 9, 13];
      p.clear(at(tube(m, e, 1.1), 0.05));
      p.clear(at(tube(e, [s * 14, 18], 0.8), 0.05));
      p.clear(at(tube(e, [s * 11, 4], 0.8), 0.05));
      p.clear(at(tube([s * 10.5, 7.5], [s * 16, 6], 0.65), 0.05));
    }
    // the windpipe: a bright tube down the gap, with ring cuts, splitting at the bottom
    const pipe: P2[] = [[-2.2, 36], [2.2, 36], [2.2, 24], [6, 20.5], [4.8, 19], [0, 22.5], [-4.8, 19], [-6, 20.5], [-2.2, 24]];
    slab(p, pipe, 1.2, 3, 0.45, 0.32, 0.14);
    for (const z of [34, 31.5, 29, 26.5]) p.line([[-2.2, 1.25, z], [2.2, 1.25, z]], SH.edge, 0.6);
  },
};
