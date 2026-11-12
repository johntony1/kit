// No celebrations yet: a two tier cake on a plate, icing running down its sides, three candles on top. Hover and the candles light one after another and flicker, with a few sparks around.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

/** an upright drum on the origin: a dense side toward +y, a sparse side toward +x, a lit top */
function drum(p: Pen, r: number, z0: number, z1: number, top = SH.top) {
  if (p.ink) p.face([...arc(r, z0, -Q, 3 * Q), ...arc(r, z1, -Q, 3 * Q).reverse()], SH.left, 0);
  else {
    p.face([...arc(r, z0, -Q, SPLIT), ...arc(r, z1, -Q, SPLIT).reverse()], SH.right, 0);
    p.face([...arc(r, z0, SPLIT, 3 * Q), ...arc(r, z1, SPLIT, 3 * Q).reverse()], SH.left, 0);
  }
  p.line(arc(r, z0, -Q, 3 * Q), SH.edge, 0.6);
  p.line([[r * S2, -r * S2, z0], [r * S2, -r * S2, z1]], SH.edge, 0.6);
  p.line([[-r * S2, r * S2, z0], [-r * S2, r * S2, z1]], SH.edge, 0.6);
  p.face(arc(r, z1, 0, Math.PI * 2, 44), top, SH.edge, 0.6);
}
/** icing hanging over the rim in drips */
function icing(p: Pen, r: number, z: number, n: number) {
  const wavy = arc(r + 0.04, z, -Q, 3 * Q, 60).map(([x, y], i) => [x, y, z - 1.7 - 1.2 * Math.cos((i / 60) * Math.PI * 2 * n)] as V3);
  p.face([...arc(r + 0.04, z, -Q, 3 * Q, 60), ...wavy.reverse()], 0.24, 0);
  p.line(wavy, SH.edge, 0.6);
}

export const cake: Illustration = {
  k: "cake", name: "Cake", title: "No celebrations yet", body: "Birthdays and anniversaries you add will show up here, so you never miss one.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 27, 13.5, 0.12);
    drum(p, 15.5, 0, 1.3);
    drum(p, 11.5, 1.3, 10.5);
    icing(p, 11.5, 10.5, 6);
    drum(p, 7.2, 10.5, 17.5);
    icing(p, 7.2, 17.5, 4);
    // three candles in a row across the top
    const Z = 17.5;
    ([[-3.3, 3.3], [0, 0], [3.3, -3.3]] as [number, number][]).forEach(([x, y], i) => {
      p.box(x - 0.9, y - 0.9, Z, 1.8, 1.8, 5.2, { top: 0.3, left: 0.26, right: 0.12, lw: 0.45 });
      p.line([[x, y, Z + 5.2], [x, y, Z + 6.1]], SH.edge, 0.4);
      const k = seg(h, 0.08 + i * 0.22, 0.4 + i * 0.22);
      if (k <= 0) return;
      // the flame: a bright teardrop that leans and breathes
      const s = 1.45 * k * (1 + 0.14 * Math.sin(t * 9 + i * 2.1)), dx = Math.sin(t * 5.3 + i * 1.7) * 0.6 * k;
      const [fx, fy] = p.pt([x, y, Z + 8.2]);
      p.screen((c) => {
        c.fillStyle = "#fff"; c.beginPath();
        c.moveTo(fx + dx, fy - 3.3 * s); c.quadraticCurveTo(fx + 2.1 * s, fy, fx, fy + 1.2 * s); c.quadraticCurveTo(fx - 2.1 * s, fy, fx + dx, fy - 3.3 * s); c.fill();
      });
    });
    // sparks once all three burn
    const k = seg(h, 0.75, 1);
    if (k > 0) ([[-13, 6, 20], [9, -13, 23], [-3, -9, 29], [12, 2, 14]] as V3[]).forEach((q, i) => p.dot(q, 0.75 + 0.35 * Math.sin(t * 3.4 + i * 1.9), k));
  },
};
