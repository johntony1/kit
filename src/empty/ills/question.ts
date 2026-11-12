// Question mark: a thick question mark standing over its dot. Hover and it rocks from side to side with a hop while the dot bounces under it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW); // turned to face us; how far a wall facing +x looks at us
/** a profile in [x, z] standing in the plane y (facing +y), thickness T going back: the rim, then the front */
function slab(p: Pen, prof: P2[], y: number, T: number, front: number, kx = KX, top = 0.26, side = 0.065) {
  const n = prof.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = ((z1 - z0) * sg) / L, nz = (-(x1 - x0) * sg) / L;
    if (nx * kx + nz <= 0.001) continue;
    p.face([[x0, y, z0], [x1, y, z1], [x1, y - T, z1], [x0, y - T, z0]], nz > 0.3 ? top : side, 0);
  }
  p.face(prof.map(([x, z]) => [x, y, z] as V3), front, SH.edge, 0.6);
}
/** a thick stroke along a path, as an outline */
const stroke = (path: P2[], w: number): P2[] => {
  const l: P2[] = [], r: P2[] = [];
  path.forEach(([x, z], i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = (-(b[1] - a[1]) / L) * w, nz = ((b[0] - a[0]) / L) * w;
    l.push([x + nx, z + nz]); r.push([x - nx, z - nz]);
  });
  return [...l, ...r.reverse()];
};
const HOOK: P2[] = [
  ...Array.from({ length: 19 }, (_, i) => { const a = Math.PI * (0.97 - (1.19 * i) / 18); return [Math.cos(a) * 7.4, 24.6 + Math.sin(a) * 7.4] as P2; }),
  [3.4, 17.3], [1.3, 15.2], [0.3, 13.2], [0, 10.6],
];
const MARK = stroke(HOOK, 2.75);
const DOT: P2[] = Array.from({ length: 26 }, (_, i) => { const a = (i / 26) * Math.PI * 2; return [Math.cos(a) * 3.2, 3.4 + Math.sin(a) * 3.2] as P2; });

export const question: Illustration = {
  k: "question", name: "Question mark", title: "No answers yet", body: "Ask a question and the answers will collect here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.8);
    const yaw = YAW + 0.55 * Math.sin(k * Math.PI * 2) * (1 - k * 0.6) * (1 - k) * 1.6 + h * Math.sin(t * 1.8) * 0.06;
    const hop = Math.sin(k * Math.PI) * 3.5, bounce = Math.abs(Math.sin(k * Math.PI * 2)) * 4.2 * (1 - k);
    p.translate(0, 0, -17.5);
    p.shadow(0, 0, 18, 8, 0.12);
    p.rotate("z", yaw);
    const kx = Math.cos(yaw) + Math.sin(yaw);
    p.push(); p.translate(0, 0, bounce); slab(p, DOT, 2.6, 5.2, 0.2, kx); p.pop();
    p.push(); p.translate(0, 0, hop + bounce * 0.4); slab(p, MARK, 2.6, 5.2, 0.2, kx); p.pop();
  },
};
