// You're offline: a thick cloud floats over a row of signal bars. Its wifi mark is struck through, and the bars keep trying to fill.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 3.2;
type P2 = [number, number];
// the puffs of the cloud in its own plane (x right, z up): x, z, radius
const PUFF: [number, number, number][] = [[-9, -1, 5.5], [-2.5, 3, 8], [7, 1.5, 6.5], [12.5, -1.5, 4.5], [2, -2.5, 7]];
const BOT = -6; // the flat underside

/** the cloud's outline: rays from inside, out to the far edge of the union of the puffs */
function outline(n: number): P2[] {
  const O: P2 = [1, -1], out: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
    let best = 0;
    for (const [cx, cz, r] of PUFF) {
      const fx = O[0] - cx, fz = O[1] - cz, b = fx * dx + fz * dz, c = fx * fx + fz * fz - r * r, d = b * b - c;
      if (d >= 0) best = Math.max(best, -b + Math.sqrt(d));
    }
    out.push([(O[0] + dx * best) * 0.85, Math.max(BOT, O[1] + dz * best)]);
  }
  return out;
}
const CLOUD = outline(200);

/** a flat shape standing upright, facing +y, with thickness from y0 to y1. pts run counter clockwise seen from +y */
function slab(p: Pen, pts: P2[], at: V3, y0: number, y1: number, front: number) {
  const [ox, oy, oz] = at, P = (x: number, y: number, z: number): V3 => [ox + x, oy + y, oz + z];
  const strips: { k: number; pts: V3[]; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    const nx = dz / L, nz = -dx / L;
    if (nz <= -0.02) continue;
    strips.push({ k: (a[0] + b[0]) / 2 + (a[1] + b[1]) / 2, pts: [P(a[0], y0, a[1]), P(b[0], y0, b[1]), P(b[0], y1, b[1]), P(a[0], y1, a[1])], fill: nz > 0.3 ? SH.top : SH.right });
  }
  strips.sort((u, v) => u.k - v.k).forEach((s) => p.face(s.pts, s.fill, 0));
  p.line([...pts.map(([x, z]) => P(x, y0, z)), P(pts[0][0], y0, pts[0][1])], SH.edge, 0.55);
  p.face(pts.map(([x, z]) => P(x, y1, z)), front, SH.edge, 0.6);
}

export const offline: Illustration = {
  k: "offline", name: "Offline", title: "You're offline", body: "Check your connection. We will sync your changes as soon as you are back.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 15, 0.1);
    // the signal bars on the floor, under the cloud: they light in turn, then all drop out
    for (let i = 0; i < 4; i++) {
      const on = u > 0.12 + i * 0.13 && u < 0.72;
      const x = -7.5 + i * 4.2, hgt = 2.5 + i * 2.6;
      p.box(x, -1.8, 0, 3.2, 3.6, hgt, on ? { top: 0.34, left: 0.2, right: 0.12 } : { top: 0.18, left: SH.left, right: 0.045 });
    }
    // the cloud, bobbing; dashed drops to the floor in the line style
    const bob = Math.sin(u * Math.PI * 2) * 0.8, Z = 25 + bob;
    // the cloud faces us square on, so its thickness shows as a lit crown along the top
    p.push(); p.rotate("z", -Math.PI / 4);
    p.guide([[-8, 0, Z + BOT], [-8, 0, 0]]);
    p.guide([[10, 0, Z + BOT], [10, 0, 0]]);
    slab(p, CLOUD, [0, 0, Z], -3.5, 3, SH.top);
    // the wifi mark on its face: a dot and three arcs, cut into the lit front
    const W: V3 = [1.2, 3.05, Z - 1.6];
    const arc = (r: number) => Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (0.25 + (0.5 * i) / 12); return [W[0] + Math.cos(a) * r, W[1], W[2] + Math.sin(a) * r] as V3; });
    p.dot([W[0], W[1], W[2] + 0.8], 1.5, 0.02);
    for (let i = 1; i <= 3; i++) p.line(arc(2.7 * i + 0.4), SH.edge, 1.3);
    // the strike through it: a bar from top left to bottom right, flashing as the bars fail
    const flash = u > 0.72 && u < 0.9 ? 1 : 0.7;
    const a: V3 = [-4.6, 3.1, Z + 7.4], b: V3 = [6.6, 3.1, Z - 2.8], w = 0.75;
    const sl: V3[] = [[a[0] - w, a[1], a[2] - w], [a[0] + w, a[1], a[2] + w], [b[0] + w, b[1], b[2] + w], [b[0] - w, b[1], b[2] - w]];
    p.face(sl, flash, SH.edge, 0.6);
    if (!p.ink) p.line([...sl, sl[0]], SH.edge, 0.7); // the dot styles show no face outlines
    // a few dropped packets falling out of the cloud while it fails
    if (u > 0.72) for (let i = 0; i < 3; i++) {
      const k = (u - 0.72) / 0.28, x = -5 + i * 7;
      p.dot([x, 0, Z + BOT - 1 - k * 9 - i * 1.5], 0.8, 1 - k);
    }
    p.pop();
  },
};
