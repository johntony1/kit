// Out of stock: an empty shelving rack. Hover and boxes pop back onto the shelves one after another.
import { SH, type Illustration } from "../dots";

const W = 14, D = 3.8, TOP = 32; // half width, half depth, height of the uprights
const SHELF = [2, 12.5, 23];
// the stock: shelf, x, width, depth, height, when it arrives
const STOCK: [number, number, number, number, number, number][] = [
  [0, -11, 8, 5.6, 6.5, 0], [0, 1, 6, 5, 5, 0.12], [1, 3, 8.5, 5.6, 6, 0.24], [1, -10.5, 6, 5, 4.5, 0.36], [2, -6, 8, 5.6, 5.5, 0.48], [2, 5, 5, 4.6, 4, 0.58],
];
const backOut = (x: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

export const inventory: Illustration = {
  k: "inventory", name: "Stock shelves", title: "Out of stock", body: "Nothing is left on the shelves. Restock an item and it will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 27, 12, 0.11);
    p.rotate("z", -0.5); // turned so the long side faces us
    const post = (x: number, y: number) => p.box(x, y, 0, 1.4, 1.4, TOP, { top: 0.3, left: 0.4, right: 0.12, edge: 0 });
    post(-W - 1.4, -D);
    for (const [i, z] of SHELF.entries()) {
      p.box(-W, -D, z, W * 2, D * 2, 1.2, { top: 0.07, left: 0.4, right: 0.12, lw: 0.5 });
      for (const [s, x, w, d, hh, at] of STOCK) {
        if (s !== i) continue;
        const k = Math.min(1, Math.max(0, (h - at) / 0.36));
        if (k <= 0) continue;
        const g = backOut(k), cx = x + w / 2, cy = D - 0.8 - d / 2;
        p.box(cx - (w / 2) * g, cy - (d / 2) * g, z + 1.2, w * g, d * g, hh * g, { top: 0.36, left: 0.2, right: 0.1 });
        p.line([[cx, cy - (d / 2) * g, z + 1.23 + hh * g], [cx, cy + (d / 2) * g, z + 1.23 + hh * g], [cx, cy + (d / 2) * g + 0.03, z + 1.2 + hh * g * 0.55]], SH.edge, 0.6);
      }
    }
    // the near uprights and the cross brace at the end
    post(W, -D); post(-W - 1.4, D - 1.4); post(W, D - 1.4);
    p.line([[W + 1.43, -D + 1.4, 2], [W + 1.43, D - 1.4, 12.5]], 0.6, 0.5); p.line([[W + 1.43, -D + 1.4, 12.5], [W + 1.43, D - 1.4, 23]], 0.6, 0.5);
    p.line([[-W - 1.4, D + 0.02, TOP], [-W, D + 0.02, TOP]], SH.edge, 0.5); p.line([[W, D + 0.02, TOP], [W + 1.4, D + 0.02, TOP]], SH.edge, 0.5);
  },
};
