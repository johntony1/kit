// Rate limited: a speedometer on a low plinth. The needle swings up into the red zone, shivers there, then eases back down.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 3.6;
const R = 15, Z0 = 4, F = 3.05; // dial radius, the height the dial stands on, the front plane
type P2 = [number, number];
const TURN = -0.45; // the gauge turns toward us, so the dial reads nearly square on
const VX = Math.cos(-TURN) - Math.sin(-TURN); // the view direction's x in the turned frame

/** a flat shape standing upright, facing +y, with thickness from y0 to y1. pts run counter clockwise seen from +y */
function slab(p: Pen, pts: P2[], z: number, y0: number, y1: number, front: number) {
  const P = (x: number, y: number, zz: number): V3 => [x, y, z + zz];
  const strips: { k: number; pts: V3[]; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    const nx = dz / L, nz = -dx / L;
    if (VX * nx + nz <= 0.02) continue;
    strips.push({ k: (a[0] + b[0]) / 2 + (a[1] + b[1]) / 2, pts: [P(a[0], y0, a[1]), P(b[0], y0, b[1]), P(b[0], y1, b[1]), P(a[0], y1, a[1])], fill: nz > 0.35 ? SH.top : SH.right });
  }
  strips.sort((u, v) => u.k - v.k).forEach((s) => p.face(s.pts, s.fill, 0));
  p.line([...pts.map(([x, zz]) => P(x, y0, zz)), P(pts[0][0], y0, pts[0][1])], SH.edge, 0.55);
  p.face(pts.map(([x, zz]) => P(x, y1, zz)), front, SH.edge, 0.6);
}

// the dial's outline: the half disc, then along the bottom
const DIAL: P2[] = [...Array.from({ length: 90 }, (_, i) => { const a = (Math.PI * i) / 89; return [Math.cos(a) * R, Math.sin(a) * R] as P2; }), [-R, -2], [R, -2]];
const at = (a: number, r: number): V3 => [Math.cos(a) * r, F, Z0 + Math.sin(a) * r];

/** the needle's angle: up into the red, a shiver, then back down */
function needle(u: number) {
  const lo = Math.PI - 0.35, hi = 0.28;
  if (u < 0.35) return lo + (hi - lo) * easeInOut(u / 0.35);
  if (u < 0.75) return hi + Math.sin(u * 90) * 0.05 + Math.sin(u * 37) * 0.04;
  return hi + (lo - hi) * easeInOut((u - 0.75) / 0.25);
}

export const gauge: Illustration = {
  k: "gauge", name: "Rate limit", title: "Slow down a little", body: "You have hit the request limit for now. Try again in a minute.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -10);
    p.rotate("z", TURN);
    p.shadow(0, 1, 36, 15, 0.12);
    // the plinth
    p.box(-R - 2, -4, 0, R * 2 + 4, 9, Z0, { top: SH.top, left: SH.left, right: SH.right });
    p.line([[-R, 5.05, Z0 / 2], [-R + 6, 5.05, Z0 / 2]], SH.edge, 0.6);
    p.dot([R - 1.5, 5.05, Z0 / 2], 0.9, 1);
    // the dial housing
    slab(p, DIAL, Z0 + 2, -3, F - 0.05, SH.top);
    // the face sits 2 above the plinth: shift every mark up with it
    p.push(); p.translate(0, 0, 2);
    // the red zone: the bright band at the fast end
    const red: V3[] = [...Array.from({ length: 9 }, (_, i) => at((0.7 * i) / 8, R - 1.6)), ...Array.from({ length: 9 }, (_, i) => at(0.7 - (0.7 * i) / 8, R - 4.6))];
    p.face(red, u > 0.3 && u < 0.78 && Math.sin(t * 22) > -0.3 ? 1 : 0.62, SH.edge, 0.6);
    // the dot styles show no face outlines: cut the zone's edge in as a gap
    if (!p.ink) p.line([...red, red[0]], SH.edge, 0.8);
    // ticks, long every other one
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI - (Math.PI * i) / 10;
      if (a < 0.72) continue;
      p.line([at(a, R - 1.6), at(a, i % 2 ? R - 3.2 : R - 4.6)], SH.edge, i % 2 ? 0.6 : 0.9);
    }
    // the needle's sweep, dashed, in the line style
    p.guide(Array.from({ length: 25 }, (_, i) => at(Math.PI - ((Math.PI - 0.7) * i) / 24, R - 7)));
    // the needle and its hub
    const a = needle(u), c = Math.cos(a), s = Math.sin(a), w = 1;
    const tip = at(a, R - 3), b1: V3 = [s * w, F + 0.05, Z0 - c * w], b2: V3 = [-s * w, F + 0.05, Z0 + c * w], tail: V3 = [-c * 2.5, F + 0.05, Z0 - s * 2.5];
    const nd: V3[] = [b1, [tip[0], F + 0.05, tip[2]], b2, tail];
    p.face(nd, 1, SH.edge, 0.6);
    if (!p.ink) p.line([...nd, nd[0]], SH.edge, 0.7);
    p.ringV("y", [0, F + 0.08, Z0], 2.2, 0.2, SH.edge, 0.6);
    p.pop();
  },
};
