// Cash register: a till with a sloping keypad and a small display on top. Hover and the cash drawer slides open with coins and notes inside, and the display rings.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 11.5, D = 8; // half width and half depth of the till
const slope = (x: number, v: number): V3 => [x, -1 + 9 * v, 18 - 10.5 * v]; // a point on the keypad

export const till: Illustration = {
  k: "till", name: "Cash register", title: "No sales yet", body: "Ring up your first sale and the day's takings will be counted here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const s = 10 * ease(clamp(h / 0.6));
    p.translate(1, -4, -10);
    p.scale(1.08);
    p.shadow(0, 2, 26, 13, 0.12);
    // the base that houses the drawer
    p.box(-W, -D, 0, W * 2, D * 2, 6.5, { top: 0.2, left: 0.12, right: 0.065 });
    // the drawer: its front plate at rest, an open tray as it slides out
    const fy = D + s + 0.8;
    p.box(-W + 1.2, D, 0.9, W * 2 - 2.4, s + 0.8, 4.6, { top: 0.2, left: 0.2, right: 0.1, open: s > 1 });
    if (s > 3) {
      // coins in their cups and a wad of notes
      for (const [x, y] of [[-7, D + 2.2], [-3.2, D + 2.2], [-7, D + 5.6], [-3.2, D + 5.6]]) if (y < D + s - 1.4) p.disc(x, y, 5.3, 1.5, 0.3, 0);
      p.face([[1, D + 0.8, 5.3], [8.6, D + 0.8, 5.3], [8.6, D + s - 1, 5.3], [1, D + s - 1, 5.3]], 0.22, 0);
      p.line([[2.4, D + 0.8, 5.32], [2.4, D + s - 1, 5.32]], SH.edge, 0.5);
      p.line([[7.2, D + 0.8, 5.32], [7.2, D + s - 1, 5.32]], SH.edge, 0.5);
    }
    p.line([[-3.4, fy + 0.03, 3.4], [3.4, fy + 0.03, 3.4]], SH.edge, 1.3); // the handle
    p.line([[-W + 1.2, fy + 0.03, 0.9], [-W + 1.2, fy + 0.03, 5.5], [W - 1.2, fy + 0.03, 5.5]], SH.edge, 0.5);
    // the body: a block at the back and the keypad sloping down to the front
    p.box(-W, -D, 6.5, W * 2, D - 1, 11.5, { top: 0.2, left: 0.12, right: 0.065 });
    p.face([[W, -1, 6.5], [W, D, 6.5], [W, D, 7.5], [W, -1, 18]], SH.right, 0);
    p.face([[-W, D, 6.5], [W, D, 6.5], [W, D, 7.5], [-W, D, 7.5]], 0.12, 0);
    p.face([slope(-W, 0), slope(W, 0), slope(W, 1), slope(-W, 1)], 0.2, 0);
    p.line([slope(-W, 0), slope(W, 0), slope(W, 1)], SH.edge, 0.5);
    p.line([[-W, D + 0.02, 6.5], [W, D + 0.02, 6.5], [W + 0.02, -D, 6.5]], SH.edge, 0.5);
    // the keys: three rows of four, and one wide key
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = -9.6 + c * 3.3, v = 0.14 + r * 0.27;
      p.face([slope(x, v), slope(x + 2.3, v), slope(x + 2.3, v + 0.17), slope(x, v + 0.17)], 0.03, 0);
    }
    p.face([slope(5, 0.14), slope(9.4, 0.14), slope(9.4, 0.85), slope(5, 0.85)], 0.03, 0);
    // the display on top, a nought on its screen
    p.box(0.5, -D + 1, 18, 9.5, 3.4, 6, { top: 0.2, left: 0.2, right: 0.065 });
    const dy = -D + 4.44;
    p.line([[1.6, dy, 19.2], [8.9, dy, 19.2], [8.9, dy, 22.8], [1.6, dy, 22.8], [1.6, dy, 19.2]], SH.edge, 0.6);
    p.line([[6.2, dy, 20], [7.6, dy, 20], [7.6, dy, 22], [6.2, dy, 22], [6.2, dy, 20]], SH.edge, 0.8);
    // the ring: glints over the display once the drawer is out
    const k = clamp((h - 0.6) / 0.3);
    if (k > 0) ([[-2, -D + 2, 27], [5, -D + 2, 29.5], [12, -D + 2, 26.5]] as V3[]).forEach((q, i) => p.dot(q, (0.75 + 0.3 * Math.sin(t * 3.2 + i * 2.1)) * k, 1));
  },
};
