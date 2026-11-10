// Update available: a package box with a circular arrow turning above it, while a progress bar on its side fills and resets.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 3;
const W = 10, D = 10, H = 13; // half width, half depth, height of the box

/** a flat ring band lying level at height z, from angle a0 to a1, with an arrowhead at a1 */
function arrow(p: Pen, z: number, a0: number, a1: number, r0: number, r1: number, fill: number, edge: number) {
  const n = 40, ring = (r: number, k: number) => { const a = a0 + ((a1 - a0) * k) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; };
  const head = (a1 - a0) > 0 ? 0.42 : -0.42, rm = (r0 + r1) / 2, hw = (r1 - r0) * 1.05;
  const tip: V3 = [Math.cos(a1 + head) * rm, Math.sin(a1 + head) * rm, z];
  const o: V3 = [Math.cos(a1) * (r1 + hw * 0.6), Math.sin(a1) * (r1 + hw * 0.6), z], i: V3 = [Math.cos(a1) * (r0 - hw * 0.6), Math.sin(a1) * (r0 - hw * 0.6), z];
  const pts: V3[] = [...Array.from({ length: n + 1 }, (_, k) => ring(r1, k)), o, tip, i, ...Array.from({ length: n + 1 }, (_, k) => ring(r0, n - k))];
  p.face(pts, fill, edge, 0.6);
}

export const update: Illustration = {
  k: "update", name: "Update", title: "An update is ready", body: "Restart to get the latest version. It only takes a moment.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 26, 13, 0.12);
    // the box, its lid seam and tape
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: SH.top, left: SH.left, right: SH.right });
    p.line([[-W, -2, H + 0.02], [W, -2, H + 0.02]], SH.edge, 0.6);
    p.line([[-W, 2, H + 0.02], [W, 2, H + 0.02]], SH.edge, 0.6);
    p.line([[W + 0.03, -2, H], [W + 0.03, -2, H - 4]], SH.edge, 0.55);
    p.line([[W + 0.03, 2, H], [W + 0.03, 2, H - 4]], SH.edge, 0.55);
    // the progress bar on the front: a slot, filling
    const k = Math.min(1, u / 0.8);
    const fy = D + 0.03, x0 = -W + 2.5, x1 = W - 2.5, z0 = 3.4, z1 = 6.2;
    p.face([[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]], 0.03, SH.edge, 0.6);
    if (k > 0.02) p.face([[x0 + 0.5, fy + 0.02, z0 + 0.5], [x0 + 0.5 + (x1 - x0 - 1) * k, fy + 0.02, z0 + 0.5], [x0 + 0.5 + (x1 - x0 - 1) * k, fy + 0.02, z1 - 0.5], [x0 + 0.5, fy + 0.02, z1 - 0.5]], u < 0.8 || Math.sin(t * 20) > 0 ? 0.9 : 0.4, 0);
    p.line([[x0, fy, 9.5], [x0 + 7, fy, 9.5]], SH.edge, 0.9);
    // the circular arrow, turning above the box, with a dashed path of its full circle
    const Z = H + 9 + Math.sin(u * Math.PI * 2) * 0.6, a = -u * Math.PI * 2;
    p.guide([[-W, D, H], [-W, D, Z - 1]]);
    p.guide([[W, -D, H], [W, -D, Z - 1]]);
    p.guide(Array.from({ length: 49 }, (_, i) => { const b = (i / 48) * Math.PI * 2; return [Math.cos(b) * 9.5, Math.sin(b) * 9.5, Z] as V3; }));
    arrow(p, Z - 1.2, a, a - Math.PI * 1.45, 8, 11, SH.right, 0); // its thickness
    arrow(p, Z, a, a - Math.PI * 1.45, 8, 11, 0.6, SH.edge);
    // sparks off the arrowhead
    for (let i = 0; i < 3; i++) {
      const v = (u * 3 + i / 3) % 1, b = a - Math.PI * 1.45 - 0.5 - v * 0.6;
      p.dot([Math.cos(b) * (12 + v * 3), Math.sin(b) * (12 + v * 3), Z + v * 3], 0.7, Math.sin(v * Math.PI));
    }
  },
};
