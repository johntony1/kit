// No expenses yet: a desk spike with a few receipts pushed onto it. Hover and another receipt drops down the spike and settles on the pile.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const W = 5.6, D = 8.4; // half width and half depth of a receipt

// a receipt pierced through its middle, lying at height z, turned and tipped a little
function slip(p: Pen, z: number, rot: number, tipX: number, tipY: number, fill: number) {
  p.push();
  p.translate(0, 0, z); p.rotate("z", rot); p.rotate("x", tipX); p.rotate("y", tipY);
  const teeth: V3[] = [];
  for (let i = 0; i <= 8; i++) teeth.push([W - (2 * W * i) / 8, i % 2 ? D - 0.9 : D, 0]);
  p.face([[-W, -D, 0], [W, -D, 0], ...teeth], fill, SH.edge, 0.55);
  p.line([[-3.6, -6.2, 0.03], [1.2, -6.2, 0.03]], SH.edge, 0.9);
  p.line([[-3.6, -3.8, 0.03], [3.6, -3.8, 0.03]], SH.edge, 0.5);
  p.line([[-3.6, 2.6, 0.03], [3.6, 2.6, 0.03]], SH.edge, 0.5);
  p.line([[-3.6, 4.6, 0.03], [-0.6, 4.6, 0.03]], SH.edge, 0.5);
  p.line([[1.2, 5.4, 0.03], [3.8, 5.4, 0.03]], SH.edge, 0.95);
  p.pop();
}
const spike = (p: Pen, z0: number, z1: number) => p.box(-0.45, -0.45, z0, 0.9, 0.9, z1 - z0, { top: 0.5, left: 0.4, right: 0.2, lw: 0.4 });
// height above its seat: a slide down, a small bounce, rest
function drop(k: number) {
  if (k < 0.6) return 24 * (1 - Math.pow(k / 0.6, 2));
  if (k < 0.85) { const v = (k - 0.6) / 0.25; return 2 * 4 * v * (1 - v); }
  return 0;
}

export const expense: Illustration = {
  k: "expense", name: "Expense report", title: "No expenses yet", body: "Add a receipt and your expenses will start to pile up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const TOP = 31;
    p.translate(0, 0, -14);
    p.shadow(0, 0, 24, 12, 0.11);
    // the base and the spike
    p.cylinder(0, 0, 0, 8.5, 2.2, { side: 0.12, top: 0.2 });
    spike(p, 2.2, TOP);
    // the pile
    slip(p, 4.6, 0.5, 0.05, -0.06, 0.12);
    slip(p, 6.4, -0.35, -0.07, 0.04, 0.2);
    slip(p, 8.2, 0.12, 0.05, 0.07, 0.12);
    spike(p, 8.3, TOP);
    // the new receipt, turning as it slides down
    const k = clamp(h / 0.85);
    if (k > 0.02) {
      const z = 10.2 + drop(k), settle = k < 0.6 ? 1 - k / 0.6 : 0;
      slip(p, z, -0.75 + settle * 0.9, -0.05 - settle * 0.25, 0.04 + settle * 0.2, 0.24);
      if (z + 0.4 < TOP) spike(p, z + 0.1, TOP);
    }
    p.dot([0, 0, TOP + 0.4], 0.9, 1);
  },
};
