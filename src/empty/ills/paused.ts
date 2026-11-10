// Paused: a media tile with a raised pause sign and a progress bar. Hover and the two bars fold into a play triangle and the progress moves on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 14, D = 11, H = 4.5; // half width, half depth, height of the tile
type P2 = [number, number];
// the symbol's own axes on the tile's top: r runs right on screen, v runs back (up on screen)
const S = Math.SQRT1_2, CX = -0.5, CY = -2.5;
const to = ([r, v]: P2): P2 => [CX + (r - v) * S, CY + (-r - v) * S];
const lerp = (a: P2[], b: P2[], k: number) => a.map((q, i) => [q[0] + (b[i][0] - q[0]) * k, q[1] + (b[i][1] - q[1]) * k] as P2);
const BARS: P2[][] = [[[-5, -6], [-1.6, -6], [-1.6, 6], [-5, 6]], [[1.6, -6], [5, -6], [5, 6], [1.6, 6]]];
const PLAY: P2[][] = [[[-4.5, -6.5], [1, -3.25], [1, 3.25], [-4.5, 6.5]], [[1, -3.25], [6.5, -0.01], [6.5, 0.01], [1, 3.25]]];

/** a flat shape raised off a level surface: its walls toward us, then its top */
function prism(p: Pen, pts: P2[], z: number, h: number, top: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; }
  const sgn = a > 0 ? 1 : -1;
  const sides = pts.map((q, i) => {
    const b = pts[(i + 1) % pts.length], dx = b[0] - q[0], dy = b[1] - q[1], L = Math.hypot(dx, dy) || 1;
    const nx = (sgn * dy) / L, ny = (-sgn * dx) / L;
    return { q, b, nx, ny, k: q[0] + q[1] + b[0] + b[1] };
  }).filter((s) => s.nx + s.ny > 0.05).sort((u, v) => u.k - v.k);
  for (const s of sides) p.face([[s.q[0], s.q[1], z], [s.b[0], s.b[1], z], [s.b[0], s.b[1], z + h], [s.q[0], s.q[1], z + h]], s.ny > s.nx ? SH.left : SH.right, SH.edge, 0.5);
  const lid = pts.map(([x, y]) => [x, y, z + h] as V3);
  p.face(lid, top, SH.edge, 0.6);
  if (!p.ink) p.line([...lid, lid[0]], SH.edge, 0.7); // the dot styles show no face outlines
}

export const paused: Illustration = {
  k: "paused", name: "Paused", title: "Playback is paused", body: "Pick up where you left off whenever you are ready.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -3);
    p.shadow(0, 0, 32, 16, 0.12);
    // a thinner tile under it, then the tile itself
    p.box(-W + 1, -D + 1, -2.2, W * 2 - 2, D * 2 - 2, 2.2, { top: SH.top, left: SH.right, right: 0.04 });
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: SH.top, left: SH.left, right: SH.right });
    // the screen: a dark well the sign stands in
    p.face([[-W + 1.6, -D + 0.6, H + 0.02], [W - 1.6, -D + 0.6, H + 0.02], [W - 1.6, D - 5, H + 0.02], [-W + 1.6, D - 5, H + 0.02]], 0.03, SH.edge, 0.6);
    // the play triangle it wants to become, dashed, in the line style
    p.guide([...PLAY[0].slice(0, 1), PLAY[1][1], PLAY[0][3], PLAY[0][0]].map((q) => { const [x, y] = to(q); return [x, y, H] as V3; }), true);
    // the progress bar along the front edge: a slot, the part played, a knob
    const k = 0.32 + h * 0.18 + (h > 0.5 ? ((t * 0.05) % 0.3) : 0);
    const y0 = D - 4.4, y1 = D - 2.8, x0 = -W + 3, x1 = W - 3, xk = x0 + (x1 - x0) * k;
    p.face([[x0, y0, H + 0.02], [x1, y0, H + 0.02], [x1, y1, H + 0.02], [x0, y1, H + 0.02]], 0.03, SH.edge, 0.55);
    p.face([[x0, y0, H + 0.04], [xk, y0, H + 0.04], [xk, y1, H + 0.04], [x0, y1, H + 0.04]], 0.6, 0);
    p.cylinder(xk, (y0 + y1) / 2, H, 1.5, 0.9, { top: 0.24, side: SH.left });
    // a time code on the front wall
    p.line([[-W + 2.5, D + 0.03, H - 1.6], [-W + 7.5, D + 0.03, H - 1.6]], SH.edge, 0.9);
    p.line([[W - 7.5, D + 0.03, H - 1.6], [W - 2.5, D + 0.03, H - 1.6]], SH.edge, 0.9);
    // the sign: two bars folding into a triangle, the back one first
    const m = h * h * (3 - 2 * h);
    const shapes = [0, 1].map((i) => lerp(BARS[i], PLAY[i], m).map(to));
    shapes.sort((a, b) => a.reduce((s, q) => s + q[0] + q[1], 0) - b.reduce((s, q) => s + q[0] + q[1], 0));
    for (const s of shapes) prism(p, s, H, 1.8, 0.62);
  },
};
