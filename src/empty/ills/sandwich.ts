// No lunch yet: half a sandwich cut corner to corner, its layers showing along the cut. Hover and the top slice lifts off with a bounce and a pick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
// the footprint: a right triangle, its square corner at the back left, the long cut facing us
const TRI: P2[] = [[-14, -13], [15, -13], [-14, 16]];
const grow = (g: number): P2[] => TRI.map(([x, y]) => [x + (x > 0 || y > 0 ? g : -g * 0.3), y + (x > 0 || y > 0 ? g : -g * 0.3)]);

/** a flat outline extruded from z0 to z1: the walls that face us, then the top. wall: the cut's tone */
function slab(p: Pen, pts: P2[], z0: number, z1: number, top: number, wall: number) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const nx = (b[1] - a[1]) * sg, ny = -(b[0] - a[0]) * sg;
    if (nx + ny <= 0.02) continue;
    p.face([[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], ny > 0 ? wall : wall * 0.5, 0);
  }
  p.face(pts.map(([x, y]) => [x, y, z1] as V3), top, 0);
}

export const sandwich: Illustration = {
  k: "sandwich", name: "Sandwich", title: "No lunch yet", body: "Add a lunch to your plan and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = seg(h, 0, 0.6);
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 7 * back(k) + (h > 0.6 ? Math.sin(t * 3) * 0.5 * h : 0);
    p.translate(0, 0, -10);
    p.scale(1.1);
    p.shadow(0, 2, 27, 13, 0.1);
    p.rotate("z", 0.32);
    // the bottom slice: crumb with a dark crust under it
    slab(p, TRI, 0, 1.2, 0.2, 0.07);
    slab(p, TRI, 1.2, 5, 0.2, 0.32);
    // tomato, cheese, lettuce: dark, bright, bright and frilly
    slab(p, grow(0.3), 5, 7.2, 0.05, 0.04);
    slab(p, grow(1.4), 7.2, 8.6, 0.32, 0.32);
    slab(p, grow(2), 8.6, 9.8, 0.2, 0.16);
    const lt = grow(2);
    const n = 16, fr: V3[] = [];
    for (let i = 0; i <= n; i++) { const u = i / n; fr.push([lt[1][0] + (lt[2][0] - lt[1][0]) * u, lt[1][1] + (lt[2][1] - lt[1][1]) * u, 8.6 - (i % 2) * 1.2]); }
    p.line(fr, SH.edge, 0.7);
    // the top slice, lifting off
    p.push();
    p.translate(0, 0, lift);
    p.rotate("x", 0.06 * ease(k), [0, -13, 9.8]);
    slab(p, TRI, 9.8, 13.8, 0.2, 0.32);
    slab(p, TRI, 13.8, 15, 0.12, 0.07);
    const z = 15.03;
    p.face([[-11.4, -10.4, z], [9, -10.4, z], [-11.4, 10, z]], 0.24, 0);
    p.line([[-11.4, -10.4, z], [9, -10.4, z], [-11.4, 10, z], [-11.4, -10.4, z]], SH.edge, 0.7);
    // the pick: a bright stick and a flag
    const b = seg(h, 0.62, 1);
    if (b > 0) {
      const pop = b < 0.6 ? ease(b / 0.6) * 1.15 : 1.15 - 0.15 * ease((b - 0.6) / 0.4);
      const [x0, y0] = p.pt([-5, -4, z]), [x1, y1] = p.pt([-5, -4, z + 10 * pop]);
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.lineCap = "round";
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.fillStyle = "#fff"; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + 7 * pop, y1 + 2.2 * pop); c.lineTo(x1, y1 + 4.4 * pop); c.closePath(); c.fill();
      });
    }
    p.pop();
  },
};
