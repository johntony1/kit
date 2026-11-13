// This shelf is empty: a store shelving unit, three bare shelves between four posts. Hover and a box pops onto the middle shelf with a bounce; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 11, D = 4, HT = 32, PS = 1.6; // half width, half depth, height, post size
const LEVELS = [1.5, 11.5, 21.5];

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const shelf: Illustration = {
  k: "shelf", name: "Shelf", title: "This shelf is empty", body: "Products added to this shelf will be lined up here for shoppers to find.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 27, 13, 0.12);
    p.rotate("z", -0.5);
    const post = (x: number, y: number) => p.box(x, y, 0, PS, PS, HT, { top: 0.3, left: 0.24, right: 0.08, edge: 0 });
    // the back posts
    post(-W, -D); post(W - PS, -D);
    // the shelves: lit tops, bright price edges along the front
    for (const z of LEVELS) {
      p.box(-W, -D, z, W * 2, D * 2, 1.4, { top: 0.035, left: 0.4, right: 0.08, edge: 0 });
    }
    // a box pops onto the middle shelf
    const k = Math.max(0, Math.min(1, h / 0.65));
    if (k > 0) {
      const s = k < 0.7 ? ease(k / 0.7) * 1.15 : 1.15 - 0.15 * ease((k - 0.7) / 0.3);
      p.push();
      p.scale(s, [0, 0, LEVELS[1] + 1.4]);
      p.box(-4.5, -3, LEVELS[1] + 1.4, 9, 6, 6.4, { top: 0.3, left: 0.22, right: 0.1, edge: 0 });
      p.face([[-1.1, -3, LEVELS[1] + 7.83], [1.1, -3, LEVELS[1] + 7.83], [1.1, 3, LEVELS[1] + 7.83], [-1.1, 3, LEVELS[1] + 7.83]], 0.06, 0);
      p.pop();
    }
    // the front posts and the top cap
    post(-W, D - PS); post(W - PS, D - PS);
    p.box(-W, -D, HT, W * 2, D * 2, 1.4, { top: 0.22, left: 0.4, right: 0.08, edge: 0 });
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [-W + 2, 0, HT + 4], 4.4 * pop);
    }
  },
};
