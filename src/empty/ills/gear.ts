// Nothing configured: two gears lying on the floor, their teeth meshing as they turn.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 4.5, TH = 4.5; // seconds per loop, gear thickness

interface Gear { cx: number; cy: number; r: number; n: number; z: number }

/** the outline of a gear in the xy plane: n teeth, pitch radius r, turned by a */
function outline(g: Gear, a: number): [number, number][] {
  const T = (Math.PI * 2) / g.n, ro = g.r + 2.1, ri = g.r - 1.5;
  const pts: [number, number][] = [];
  for (let k = 0; k < g.n; k++) {
    const b = a + k * T;
    for (const [f, rr] of [[-0.5, ri], [-0.3, ri], [-0.17, ro], [0.17, ro], [0.3, ri]] as const) {
      pts.push([g.cx + Math.cos(b + f * T) * rr, g.cy + Math.sin(b + f * T) * rr]);
    }
  }
  return pts;
}

function drawGear(p: Parameters<Illustration["draw"]>[0], g: Gear, a: number) {
  const pts = outline(g, a), z0 = g.z, z1 = g.z + TH;
  // the side walls that face us, back to front, shaded by which way they face
  const sides: { d: number; pts: V3[]; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const nx = y1 - y0, ny = -(x1 - x0); // outward for a counter clockwise outline
    const l = Math.hypot(nx, ny) || 1;
    if ((nx + ny) / l < 0.02) continue;
    const fill = ny / l > nx / l ? SH.left : SH.right;
    sides.push({ d: (x0 + x1 + y0 + y1) / 2, pts: [[x0, y0, z0], [x1, y1, z0], [x1, y1, z1], [x0, y0, z1]], fill });
  }
  sides.sort((m, n) => m.d - n.d).forEach((s) => p.face(s.pts, s.fill, 0));
  // the lit top, with a ring cut into it and lightening holes punched through
  p.face(pts.map(([x, y]) => [x, y, z1] as V3), SH.top, 0);
  const ring = (r: number) => Array.from({ length: 41 }, (_, i) => { const b = (i / 40) * Math.PI * 2; return [g.cx + Math.cos(b) * r, g.cy + Math.sin(b) * r, z1 + 0.02] as V3; });
  p.line(ring(g.r - 3), SH.edge, 0.6);
  const holes = g.n > 10 ? 5 : 4;
  for (let k = 0; k < holes; k++) {
    const b = a + (k / holes) * Math.PI * 2, rr = (g.r - 3) * 0.6;
    const hx = g.cx + Math.cos(b) * rr, hy = g.cy + Math.sin(b) * rr, hr = g.r * 0.1;
    p.clear(Array.from({ length: 20 }, (_, i) => { const c = (i / 20) * Math.PI * 2; return [hx + Math.cos(c) * hr, hy + Math.sin(c) * hr, z1 + 0.03] as V3; }));
  }
  // the hub
  p.cylinder(g.cx, g.cy, z1, 2.2, 1.4, { top: 0.32, side: 0.14, edge: 0 });
  p.dot([g.cx, g.cy, z1 + 1.45], 0.7, 0);
}

export const gear: Illustration = {
  k: "gear", name: "Gears", title: "Nothing configured", body: "Set things up the way you like and your settings will show up here.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const A: Gear = { cx: -6.5, cy: -5.5, r: 11, n: 10, z: 0 };
    const B: Gear = { cx: 0, cy: 0, r: 7.7, n: 7, z: 0 };
    // B sits so the pitch circles touch, along the line from A
    const phi = -0.25; // direction from A to B
    B.cx = A.cx + Math.cos(phi) * (A.r + B.r); B.cy = A.cy + Math.sin(phi) * (A.r + B.r);
    // A turns three teeth per loop; B follows, a gap of B always meeting a tooth of A
    const aA = phi + ((t % PERIOD) / PERIOD) * 3 * ((Math.PI * 2) / A.n);
    const aB = phi + Math.PI - Math.PI / B.n - (aA - phi) * (A.n / B.n);
    const mx = (A.cx + B.cx) / 2 + 2, my = (A.cy + B.cy) / 2 + 1;
    p.translate(-mx, -my, -3);
    p.shadow(mx, my, 32, 14, 0.12);
    drawGear(p, A, aA);
    drawGear(p, B, aB);
  },
};
