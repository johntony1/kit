// Keyboard: a compact keyboard, three rows of keys and a space bar. Hover and two keys light and lift, a shortcut picked out.
import { type Illustration } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const COLS = 6, P = 6, K = 4.7, KH = 1; // keys per row, pitch, key size, key height
const W = (COLS * P + 1.9) / 2, D = (4 * P + 1.9) / 2, X0 = -W + 1.7;

export const keyboard: Illustration = {
  k: "keyboard", name: "Keyboard", title: "No shortcuts yet", body: "Add a shortcut to do the things you repeat with a couple of keys.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -3);
    p.scale(0.98);
    p.shadow(0, 1, 34, 14, 0.1);
    p.rotate("z", -0.5);
    // the deck: a dark top so the keys read as tiles
    p.box(-W, -D, 0, W * 2, D * 2, 2.6, { top: 0.02, left: 0.12, right: 0.065, lw: 0.6 });
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const key = (x: number, y: number, w: number, on: number) => {
      const up = on > 0 ? 2.6 * back(on) + on * 0.4 * Math.sin(t * 4 + x) : 0;
      p.box(x, y, 2.6 + up, w, K, KH, { top: 0.5 + 0.5 * on, left: 0.03 + 0.5 * on, right: 0.02 + 0.3 * on, edge: 0 });
    };
    const a = clamp((h - 0.1) / 0.4), b = clamp((h - 0.45) / 0.4);
    for (let r = 0; r < 4; r++) {
      const y = -D + 1.7 + r * P;
      if (r === 3) {
        // the bottom row: a key, the space bar, a key
        key(X0, y, K, a);
        key(X0 + P, y, 4 * P - (P - K), 0);
        key(X0 + 5 * P, y, K, 0);
        continue;
      }
      for (let c = 0; c < COLS; c++) key(X0 + c * P, y, K, r === 1 && c === 4 ? b : 0);
    }
  },
};
