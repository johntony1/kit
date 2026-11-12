// No billing history: a bill spike on a round base with a few paid bills pinned on it. Hover and a new bill drops down the spike and settles on the pile.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const TIP = 24;
// a point on a sheet from a screen offset (sx right, sy down)
const at = (cx: number, cy: number, z: number, sx: number, sy: number): V3 => [cx + sx / 1.732 + sy, cy + sy - sx / 1.732, z];
const S: [number, number][] = [[1.7, -2.3], [0.7, -3.1], [-0.8, -3.1], [-1.8, -2.1], [-1.3, -0.7], [1.3, 0.7], [1.8, 2.1], [0.8, 3.1], [-0.7, 3.1], [-1.7, 2.3]];

/** a bill pinned on the spike at height z, turned by a; the top ones carry a currency mark and a total */
function bill(p: Pen, z: number, a: number, marked: boolean) {
  p.push();
  p.rotate("z", a);
  p.box(-6, -6, z, 18, 18, 0.6, { top: 0.21, left: 0.12, right: 0.065, lw: 0.5 });
  const zz = z + 0.64;
  p.dot([0, 0, zz], 0.9, 0);
  if (marked) {
    p.line(S.map(([sx, sy]) => at(4.4, 4.4, zz, sx * 0.95, sy * 0.95)), SH.edge, 0.9);
    p.line([at(4.4, 4.4, zz, 0, -4), at(4.4, 4.4, zz, 0, 4)], SH.edge, 0.7);
    p.line([[-3.6, 9.4, zz], [3.4, 9.4, zz]], SH.edge, 0.7);
    p.line([[8, -3.4, zz], [8, 0.6, zz]], SH.edge, 0.6);
  }
  p.pop();
}
const spike = (p: Pen, z0: number, z1: number) => { if (z1 > z0) p.box(-0.45, -0.45, z0, 0.9, 0.9, z1 - z0, { top: 0.3, left: 0.3, right: 0.2, edge: 0 }); };

// height above the pile: a drop, a bounce, rest
function drop(k: number) {
  if (k < 0.7) return 27 * (1 - Math.pow(k / 0.7, 2));
  if (k < 0.9) { const v = (k - 0.7) / 0.2; return 2.6 * 4 * v * (1 - v); }
  return 0;
}

export const billing: Illustration = {
  k: "billing", name: "Billing", title: "No billing history", body: "Once you have been charged, every bill will be kept here for you to download.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-2, -2, -11);
    p.scale(1.22);
    p.shadow(2, 2, 26, 13, 0.11);
    p.cylinder(0, 0, 0, 7.5, 2.4, { side: 0.12, top: 0.2, lw: 0.6 });
    spike(p, 2.4, 3.4);
    bill(p, 3.4, 0.32, false);
    bill(p, 4.3, -0.3, false);
    bill(p, 5.2, 0.06, true);
    const k = Math.min(1, h / 0.95);
    const z = 6.1 + drop(k);
    if (k <= 0 || z > TIP) spike(p, 5.8, TIP);
    else spike(p, 5.8, z);
    if (k > 0) bill(p, z, -0.22 + 0.5 * (1 - k), true);
    if (k > 0 && z <= TIP) spike(p, z + 0.6, TIP);
    p.dot([0, 0, TIP + 0.6], 0.9, 1);
  },
};
