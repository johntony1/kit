// No clusters yet: three server nodes huddled on a pad, the fourth place marked out and empty. Hover and the fourth node drops in, then their lights come on one by one.
import { SH, type Illustration, type Pen } from "../dots";

const cl = (x: number) => Math.max(0, Math.min(1, x));
const S = 9, HN = 11, PAD = 1.6; // node footprint and height, pad thickness
const LO = -10.8, HI = 1.8; // where a node starts, on either axis

// height above the pad: a drop, a bounce, rest
function drop(k: number) {
  if (k < 0.55) return 17 * (1 - Math.pow(k / 0.55, 2));
  if (k < 0.82) { const v = (k - 0.55) / 0.27; return 2.6 * 4 * v * (1 - v); }
  return 0;
}

function node(p: Pen, x: number, y: number, z: number, lit: number) {
  p.box(x, y, z, S, S, HN, { top: 0.24 + 0.1 * lit, left: 0.13, right: 0.065, lw: 0.6 });
  const fy = y + S + 0.03;
  for (const dz of [3.4, 6]) p.line([[x + 1.5, fy, z + dz], [x + S - 1.5, fy, z + dz]], SH.edge, 0.55);
  p.dot([x + 2.2, fy, z + HN - 2.2], 0.5 + 0.7 * lit, 0.5 + 0.5 * lit);
}

export const cluster: Illustration = {
  k: "cluster", name: "Cluster", title: "No clusters yet", body: "Create a cluster and its nodes will be listed here with their health.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -8);
    p.scale(1.02);
    p.shadow(0, 0, 30, 15, 0.12);
    p.box(-13, -13, 0, 26, 26, PAD, { top: 0.05, left: 0.12, right: 0.065, lw: 0.6 });
    const k = cl(h / 0.6);
    const lit = (i: number) => cl((h - 0.56 - i * 0.1) / 0.12);
    node(p, LO, LO, PAD, lit(0));
    node(p, HI, LO, PAD, lit(1));
    node(p, LO, HI, PAD, lit(2));
    // the fourth place: marked on the pad until its node lands
    const zt = PAD + 0.03;
    p.line([[HI, HI, zt], [HI + S, HI, zt], [HI + S, HI + S, zt], [HI, HI + S, zt], [HI, HI, zt]], 0.6, 0.5);
    p.line([[HI + S / 2 - 1.6, HI + S / 2, zt], [HI + S / 2 + 1.6, HI + S / 2, zt]], SH.edge, 0.6);
    p.line([[HI + S / 2, HI + S / 2 - 1.6, zt], [HI + S / 2, HI + S / 2 + 1.6, zt]], SH.edge, 0.6);
    if (k > 0.01) {
      p.push();
      p.scale(0.5 + 0.5 * cl(k / 0.3), [HI + S / 2, HI + S / 2, PAD + drop(k) + HN / 2]);
      node(p, HI, HI, PAD + drop(k), lit(3));
      p.pop();
    }
  },
};
