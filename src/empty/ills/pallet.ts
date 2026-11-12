// No shipments yet: a bare wooden pallet. Hover and three boxes drop onto it, one after another, each with a small bounce.
import { SH, type Illustration, type Pen } from "../dots";

const W = 14, D = 11; // half width, half depth
// height above its resting place: a drop, a bounce, rest
function drop(k: number) {
  if (k <= 0) return 15;
  if (k < 0.6) return 15 * (1 - Math.pow(k / 0.6, 2));
  if (k < 1) { const v = (k - 0.6) / 0.4; return 3 * 4 * v * (1 - v); }
  return 0;
}
function carton(p: Pen, x: number, y: number, z: number, w: number, d: number, hh: number, a: number) {
  p.box(x, y, z, w, d, hh, { top: 0.26 * a, left: 0.15 * a, right: 0.08 * a, edge: a });
  const cx = x + w / 2;
  p.face([[cx - 1, y, z + hh + 0.02], [cx + 1, y, z + hh + 0.02], [cx + 1, y + d, z + hh + 0.02], [cx - 1, y + d, z + hh + 0.02]], 0.45 * a, 0);
  p.face([[cx - 1, y + d + 0.02, z + hh], [cx + 1, y + d + 0.02, z + hh], [cx + 1, y + d + 0.02, z + hh - 2.6], [cx - 1, y + d + 0.02, z + hh - 2.6]], 0.36 * a, 0);
}

export const pallet: Illustration = {
  k: "pallet", name: "Pallet", title: "No shipments yet", body: "Create a shipment and its cartons will be stacked up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -7);
    p.shadow(0, 0, 30, 15, 0.11);
    // three runners on blocks, then the deck boards across them
    for (const y of [-D, -1.3, D - 2.6]) {
      p.box(-W, y, 0, W * 2, 2.6, 0.9, { top: 0.1, left: 0.2, right: 0.1, edge: 0 });
      for (const x of [-W, -2, W - 4]) p.box(x, y, 0.9, 4, 2.6, 2.4, { top: 0.1, left: 0.24, right: 0.12, lw: 0.45 });
    }
    for (let i = 0; i < 5; i++) {
      const x = -W + i * 5.9;
      p.box(x, -D, 3.3, 4.4, D * 2, 1.1, { top: 0.22, left: 0.3, right: 0.12, lw: 0.5 });
    }
    p.line([[W, -D, 4.42], [W, D, 4.42]], SH.edge, 0.5);
    // the cartons, back to front
    const k = (a: number) => Math.min(1, Math.max(0, (h - a) / 0.5));
    const Z = 4.4;
    if (h > 0.01) carton(p, -11, -9, Z + drop(k(0)), 11, 10, 9, Math.min(1, k(0) * 4));
    if (h > 0.18) carton(p, 0.5, -7.5, Z + drop(k(0.18)), 10.5, 14, 7.5, Math.min(1, k(0.18) * 4));
    if (h > 0.4) carton(p, -8.5, 1.8, Z + drop(k(0.4)), 8, 7.5, 6.5, Math.min(1, k(0.4) * 4));
  },
};
