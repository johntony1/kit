// Still thinking: a thick thought cloud with two small puffs trailing below it. The cloud bobs, the puffs follow, and three dots inside swell one after another.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.6; // seconds per loop
const TAU = Math.PI * 2;
type P2 = [number, number];
const circ = (cu: number, cv: number, r: number, n = 24): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slabY(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? SH.top : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.6);
}

export const thinking: Illustration = {
  k: "thinking", name: "Thinking", title: "Still thinking", body: "The answer is on its way. It will appear here as soon as it is ready.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(1, -1, -17);
    p.shadow(0, 0, 24, 9, 0.1);
    p.rotate("z", -0.5);
    const bob = (d: number) => Math.sin((ph - d) * TAU);
    // the trail: two puffs, each a beat behind the cloud
    slabY(p, circ(-15, 3 + bob(0.3) * 0.7, 1.9, 16), 0, 1.4, 0.2);
    slabY(p, circ(-10.5, 8.2 + bob(0.15) * 0.8, 3, 20), 0, 2.2, 0.16);
    // the cloud: an ellipse with seven lobes
    const zc = 21.5 + bob(0) * 0.9;
    const cloud: P2[] = Array.from({ length: 98 }, (_, i) => { const a = (i / 98) * TAU, r = 1 + 0.15 * Math.abs(Math.sin(3.5 * a)); return [Math.cos(a) * 14 * r, zc + Math.sin(a) * 8.4 * r] as P2; });
    slabY(p, cloud, 0, 3.6, 0.13);
    // the dots
    for (let i = 0; i < 3; i++) {
      const u = (ph - i * 0.17 + 1) % 1, k = u < 0.45 ? Math.sin((u / 0.45) * Math.PI) : 0;
      p.dot([-5.6 + i * 5.6, 0.1, zc + k * 1.4], 1.3 + 1 * k, 0);
    }
  },
};
