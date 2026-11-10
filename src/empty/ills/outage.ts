// Service outage: a striped roadwork sign on its A frame with two traffic cones. Hover and the last cone drops into its dashed spot and the lamp blinks.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const HB = 8, LEAN = 4.2, TOP = 16; // the sign's half width, how far the panel leans, its height

/** a traffic cone on its square foot at (x, y, z) */
function cone(p: Pen, x: number, y: number, z: number) {
  p.box(x - 3.6, y - 3.6, z, 7.2, 7.2, 1.1, { top: SH.top, left: SH.left, right: SH.right });
  const r0 = 2.9, r1 = 0.7, z0 = z + 1.1, h = 11, N = 20;
  const at = (a: number, k: number): V3 => { const r = r0 + (r1 - r0) * k; return [x + Math.cos(a) * r, y + Math.sin(a) * r, z0 + h * k]; };
  // the visible half, sliced; a lit band round the middle
  const bands: [number, number, boolean][] = [[0, 0.32, false], [0.32, 0.6, true], [0.6, 1, false]];
  for (let i = 0; i < N; i++) {
    const a0 = -Math.PI / 4 + (Math.PI * i) / N, a1 = a0 + Math.PI / N, left = a0 + Math.PI / (2 * N) > Math.PI / 4;
    for (const [k0, k1, lit] of bands) p.face([at(a0, k0), at(a1, k0), at(a1, k1), at(a0, k1)], lit ? (left ? 0.26 : 0.16) : left ? SH.left : SH.right, 0);
  }
  const arc = (k: number) => Array.from({ length: 13 }, (_, i) => at(-Math.PI / 4 + (Math.PI * i) / 12, k));
  for (const k of [0, 0.32, 0.6]) p.line(arc(k), SH.edge, 0.6);
  p.line([at(-Math.PI / 4, 0), at(-Math.PI / 4, 1)], SH.edge, 0.55);
  p.line([at((3 * Math.PI) / 4, 0), at((3 * Math.PI) / 4, 1)], SH.edge, 0.55);
  p.disc(x, y, z0 + h, r1, SH.top, SH.edge);
}

/** clip a polygon to a rectangle (Sutherland Hodgman, one side at a time) */
function clip(pts: P2[], x0: number, x1: number, s0: number, s1: number): P2[] {
  const sides: [number, number, number][] = [[0, x0, 1], [0, x1, -1], [1, s0, 1], [1, s1, -1]];
  let out = pts;
  for (const [ax, v, d] of sides) {
    const inn = (q: P2) => (q[ax] - v) * d >= 0, res: P2[] = [];
    out.forEach((q, i) => {
      const r = out[(i + 1) % out.length];
      if (inn(q)) res.push(q);
      if (inn(q) !== inn(r)) { const k = (v - q[ax]) / (r[ax] - q[ax]); res.push([q[0] + (r[0] - q[0]) * k, q[1] + (r[1] - q[1]) * k]); }
    });
    out = res;
  }
  return out;
}

export const outage: Illustration = {
  k: "outage", name: "Outage", title: "Something's not working", body: "We are having trouble on our side. Our team is on it, please check back soon.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(-1, -1, 26, 12, 0.12);
    p.shadow(-4, 10, 10, 5, 0.1);
    p.shadow(12, -4, 10, 5, 0.1);
    p.shadow(9, 8, 10, 5, 0.1);
    // a point on the sign's front panel: x across, s from the foot (0) to the top (1)
    const P = (x: number, s: number, dy = 0): V3 => [x, LEAN - LEAN * 2 * s * 0.5 + dy - 2, TOP * s];
    // the back legs, then the front panel
    for (const x of [-HB + 1, HB - 1]) p.line([[x, -2, TOP], [x, -2 - LEAN, 0]], SH.edge, 1.1);
    for (const x of [-HB, HB - 2]) p.face([P(x, 0), P(x + 2, 0), P(x + 2, 0.5), P(x, 0.5)], SH.left, SH.edge, 0.55);
    p.face([P(-HB + 2, 0.18), P(HB - 2, 0.18), P(HB - 2, 0.24), P(-HB + 2, 0.24)], SH.left, SH.edge, 0.55);
    // the board, with hazard stripes running across it
    const s0 = 0.48, s1 = 1;
    const board = [P(-HB, s0), P(HB, s0), P(HB, s1), P(-HB, s1)];
    // the board's thickness, peeking out along its top edge
    p.face(board.map(([x, y, z]) => [x, y - 0.9, z + 0.25] as V3), SH.right, 0);
    p.face(board, SH.top, SH.edge, 0.6);
    const w = 2.4;
    for (let a = -HB - TOP; a < HB; a += w * 2) {
      const q = clip([[a, s0], [a + w, s0], [a + w + 8, s1], [a + 8, s1]], -HB + 0.8, HB - 0.8, s0 + 0.06, s1 - 0.06);
      if (q.length > 2) p.face(q.map(([x, s]) => P(x, s, 0.05)), 0.03, SH.edge, 0.5);
    }
    // the lamp on top, blinking while hovered
    p.cylinder(0, -2, TOP, 1.4, 1.6, { top: 0.24, side: SH.left });
    const on = h < 0.4 || (t % 0.7) < 0.38;
    p.cylinder(0, -2, TOP + 1.6, 1, 1.6, { top: on ? 1 : 0.2, side: on ? 0.6 : SH.left });
    if (on && h > 0.4) for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; p.dot([Math.cos(a) * 3.2, -2 + Math.sin(a) * 3.2, TOP + 4.2], 0.6, 1); }
    // a cone on the left, the third dropping into its dashed spot on the right, one in front
    cone(p, -4, 10, 0);
    const k = easeInOut(Math.min(1, h * 1.15)), zc = 12 * (1 - k) + (k > 0.92 ? Math.sin((k - 0.92) * 40) * 0.3 : 0);
    const cx = 12, cy = -4;
    if (zc > 0.4) {
      p.guide([[cx - 3.6, cy - 3.6, 0], [cx + 3.6, cy - 3.6, 0], [cx + 3.6, cy + 3.6, 0], [cx - 3.6, cy + 3.6, 0], [cx - 3.6, cy - 3.6, 0]], true);
      for (const [dx, dy] of [[3.6, -3.6], [-3.6, 3.6], [3.6, 3.6]]) p.guide([[cx + dx, cy + dy, zc], [cx + dx, cy + dy, 0]]);
    }
    cone(p, cx, cy, zc);
    cone(p, 9, 8, 0);
  },
};
