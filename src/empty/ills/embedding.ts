// No embeddings yet: three thick axes meeting in a corner, with points floating between them. Hover and the points drift together into a cluster and link up.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const O = -12, LEN = 27, T = 2.6; // the corner, the length of an axis, its thickness
// each point: where it rests, where it settles, its size
const PTS: [V3, V3, number][] = [
  [[12, -8, 15], [11.6, -8, 15.8], 3.8],
  [[4, -8, 27], [3.5, -8, 24.8], 3],
  [[-8, 6, 17], [16.2, -8, 29.1], 3.3],
  [[-7, 11, 28], [2.4, -8, 14.2], 2.6],
];

function stroke(p: Pen, a: V3, b: V3, w: number) {
  const [x0, y0] = p.pt(a), [x1, y1] = p.pt(b);
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
}

export const embedding: Illustration = {
  k: "embedding", name: "Embeddings", title: "No embeddings yet", body: "Embed some text or files and they will be placed in this space by meaning.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 30, 14, 0.11);
    const bar = { top: 0.3, left: 0.2, right: 0.065, edge: 0 }, knob = { top: 0.3, left: 0.16, right: 0.08, edge: 0 };
    // the upright axis at the back, then the two along the floor, each ending in a block
    p.box(O, O, 0, T, T, LEN + 2, bar);
    p.box(O - 0.9, O - 0.9, LEN + 2, T + 1.8, T + 1.8, T + 1.8, knob);
    p.box(O, O, 0, LEN, T, T, bar);
    p.box(O + LEN, O - 0.9, 0, T + 1.8, T + 1.8, T + 1.8, knob);
    p.box(O, O, 0, T, LEN, T, bar);
    p.box(O - 0.9, O + LEN, 0, T + 1.8, T + 1.8, T + 1.8, knob);
    // the points floating between the axes
    const k = ease(h);
    const at = PTS.map(([a, b], i): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k + h * Math.sin(t * 2.4 + i * 1.7) * 0.7]);
    // links between them once they are close
    const l = Math.max(0, (h - 0.6) / 0.4);
    if (l > 0) for (let i = 1; i < at.length; i++) {
      const a = at[0], b = at[i];
      stroke(p, a, [a[0] + (b[0] - a[0]) * l, a[1] + (b[1] - a[1]) * l, a[2] + (b[2] - a[2]) * l], 0.9);
    }
    at.forEach((a, i) => p.dot(a, PTS[i][2], 1));
  },
};
