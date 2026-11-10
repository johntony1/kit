// No coupons: three tickets held in a fan, each with a percent mark and a perforated stub. Hover and they fan out wide.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const L = 30, H = 13, T = 1.2, PF = 21.5, NR = 1.6; // length, height, thickness, perforation, notch radius
type P2 = [number, number];

// the ticket's outline in its own plane (x along, z up), with a notch at each end of the perforation
const OUT: P2[] = (() => {
  const pts: P2[] = [[0, 0]];
  for (let i = 0; i <= 8; i++) { const a = Math.PI - (Math.PI * i) / 8; pts.push([PF + Math.cos(a) * NR, Math.sin(a) * NR]); }
  pts.push([L, 0], [L, H]);
  for (let i = 0; i <= 8; i++) { const a = (Math.PI * i) / 8; pts.push([PF + Math.cos(a) * NR, H - Math.sin(a) * NR]); }
  pts.push([0, H]);
  return pts;
})();
const loop = (cx: number, cz: number, r: number, y: number, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });

/** one ticket, standing in the x,z plane with its face toward +y */
function ticket(p: Pen, face: number) {
  // the top edge and the far end, then the face
  p.face([[0, 0, H], [L, 0, H], [L, T, H], [0, T, H]], 0.22, SH.edge, 0.4);
  p.face([[L, 0, 0], [L, T, 0], [L, T, H], [L, 0, H]], 0.065, SH.edge, 0.4);
  p.face(OUT.map(([x, z]) => [x, T, z] as V3), face, SH.edge, 0.5);
  const y = T + 0.03;
  // a cut around the edge keeps each ticket apart from the one behind
  p.line([...OUT.map(([x, z]) => [x, y, z] as V3), [0, y, 0]], SH.edge, 0.6);
  // the perforation: a row of short cuts
  for (let z = NR + 1; z < H - NR - 0.8; z += 1.75) p.line([[PF, y, z], [PF, y, z + 0.6]], SH.edge, 0.7);
  // the percent mark
  p.line(loop(6.2, 9, 1.9, y), SH.edge, 0.9);
  p.line(loop(14.2, 4, 1.9, y), SH.edge, 0.9);
  p.line([[4.6, y, 2.4], [15.8, y, 10.6]], SH.edge, 1);
  // the stub's barcode
  [[24.4, 0.7], [25.8, 0.55], [27, 0.9]].forEach(([x, w]) => p.line([[x, y, 3.2], [x, y, H - 3.2]], SH.edge, w));
}

export const coupon: Illustration = {
  k: "coupon", name: "Coupons", title: "No coupons", body: "When you get a discount or a promo code, you will find it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-12, -2, -12);
    p.shadow(13, 2, 26, 11, 0.12);
    p.push();
    p.rotate("z", -0.42, [13, 0, 0]);
    const rest = [0.34, 0.17, 0], open = [0.74, 0.38, 0.02];
    const tone = [0.13, 0.17, 0.22];
    for (let i = 0; i < 3; i++) {
      const k = Math.min(1, Math.max(0, h * 1.25 - i * 0.1));
      const sway = Math.sin(t * 2 + i) * 0.025 * k;
      p.push();
      p.translate(0, i * 1.9, 0);
      p.rotate("y", -(rest[i] + (open[i] - rest[i]) * k + sway), [2, 0, 1.5]);
      ticket(p, tone[i]);
      p.pop();
    }
    p.pop();
  },
};
