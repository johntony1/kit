// No directions yet: a chunky turn arrow lying on the ground, its head only just round the corner. Hover and it lifts and the head drives on ahead.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// floor point from screen axes: u runs right, v runs towards us
const W = (u: number, v: number): P2 => [(v + u) * 0.7071, (v - u) * 0.7071];

// a flat outline extruded from z0 to z1: the walls that face us, back to front, then the lit top
function slab(p: Pen, pts: P2[], z0: number, z1: number, top: number) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  const walls: { d: number; f: number; q: V3[] }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    let nx = (b[1] - a[1]) * sg, ny = -(b[0] - a[0]) * sg;
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (nx + ny <= 0.02) continue;
    const k = Math.max(0, Math.min(1, (ny - nx) * 0.5 + 0.5)); // 1 facing +y, 0 facing +x
    walls.push({ d: a[0] + a[1] + b[0] + b[1], f: SH.right + (0.14 - SH.right) * k, q: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]] });
  }
  walls.sort((u, v) => u.d - v.d).forEach((w) => p.face(w.q, w.f, SH.edge, 0.5));
  p.face(pts.map(([x, y]) => [x, y, z1] as V3), top, SH.edge, 0.6);
}

export const directions: Illustration = {
  k: "directions", name: "Directions", title: "No directions yet", body: "Enter where you are going and each turn will be listed here step by step.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h), H = -1 + 11 * k, lift = 2.2 * k + h * 0.35 * Math.sin(t * 3);
    p.translate(0, 0, -5);
    p.scale(1.12);
    p.shadow(0, 0, 30, 13, 0.1 + 0.03 * (1 - k));
    // where it started: a ring on the ground under the tail
    p.disc(...W(-11.5, 12.5), 0.05, 4.2, 0.1, SH.edge);
    p.disc(...W(-11.5, 12.5), 0.07, 2.2, 0.03, SH.edge);
    // the way ahead: dashes past the head
    for (let i = 0; i < 3; i++) {
      const u0 = H + 12 + i * 5 + ((t * 2) % 5) * h;
      if (u0 < 25) { const a = W(u0, -9.5), b = W(u0 + 2.4, -9.5), c = W(u0 + 2.4, -7.5), d = W(u0, -7.5); p.face([[a[0], a[1], 0], [b[0], b[1], 0], [c[0], c[1], 0], [d[0], d[1], 0]], 0.2, SH.edge, 0.4); }
    }
    // the arrow: up the stem, round the corner, out to the head
    const shape: P2[] = [W(-15, 13), W(-15, -12), W(H, -12), W(H, -16.5), W(H + 10, -8.5), W(H, -0.5), W(H, -5), W(-8, -5), W(-8, 13)];
    slab(p, shape, lift, lift + 2.8, 0.24);
  },
};
