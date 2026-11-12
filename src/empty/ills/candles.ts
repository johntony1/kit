// Candlesticks: a row of price candles on a base, one of them a falling day. Hover and they stretch up one after another, the last one tallest.
import { easeInOut, type Illustration } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
// x, low, high, open, close (heights above the base), and whether the day rose
const C: [number, number, number, number, number, boolean][] = [
  [-15.2, 3, 15, 5, 12, true], [-7.6, 7, 21, 10, 18, true], [0, 4, 18, 7, 15, false], [7.6, 9, 25, 12, 21, true], [15.2, 13, 34, 16, 29, true],
];

export const candles: Illustration = {
  k: "candles", name: "Candlesticks", title: "No market data", body: "Prices will chart here once the market opens or you pick an asset.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 28, 12, 0.1);
    p.rotate("z", -0.62);
    p.box(-20, -4, 0, 40, 8, 1.5, { top: 0.2 });
    C.forEach(([x, lo, hi, a, b, up], i) => {
      const g = easeInOut(clamp((h - i * 0.1) / 0.55));
      const k = (i === 4 ? 0.5 : 0.72) + (i === 4 ? 0.5 : 0.28) * g;
      const z = (v: number) => 1.5 + v * k;
      const wick = (z0: number, z1: number) => p.box(x - 0.6, -0.6, z0, 1.2, 1.2, z1 - z0, { top: 0.55, left: 0.55, right: 0.4, edge: 0 });
      wick(z(lo), z(a));
      p.box(x - 2.8, -2.8, z(a), 5.6, 5.6, z(b) - z(a), up ? { top: 0.36, left: 0.28, right: 0.16 } : { top: 0.13, left: 0.07, right: 0.04 });
      wick(z(b), z(hi));
    });
  },
};
