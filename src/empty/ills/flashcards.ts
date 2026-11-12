// No flashcards yet: a small stack of cards, a question mark on the top one. Hover and the top card lifts, flips over and lands showing a tick.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** screen winding: > 0 when an outward face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a box that may be turned any way: only the faces that look at us are drawn */
function slab(p: Pen, x: number, y: number, z: number, w: number, d: number, h: number, top: number = SH.top, under = 0.1) {
  const X = x + w, Y = y + d, Z = z + h;
  const up: V3[] = [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]];
  const bot: V3[] = up.map(([a, b]) => [a, b, z] as V3).reverse();
  const fills = [SH.left, SH.right, SH.left, SH.right];
  up.forEach((a, i) => { const b = up[(i + 1) % 4], f: V3[] = [a, [a[0], a[1], z], [b[0], b[1], z], b]; if (facing(p, f) > 0) p.face(f, fills[i], SH.edge, 0.6); });
  if (facing(p, bot) > 0) p.face(bot, under, SH.edge, 0.6);
  if (facing(p, up) > 0) p.face(up, top, SH.edge, 0.6);
}
const ASK: [number, number][] = [[-0.6, -0.45], [-0.35, -0.95], [0.3, -0.95], [0.62, -0.5], [0.45, -0.1], [0, 0.2], [0, 0.45]];
const TICK: [number, number][] = [[-0.8, 0.1], [-0.25, 0.7], [0.85, -0.7]];
const CW = 10.5, CD = 7.5, TH = 1;

export const flashcards: Illustration = {
  k: "flashcards", name: "Flashcards", title: "No flashcards yet", body: "Make your first card with a question on one side and the answer on the other.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.scale(1.12);
    p.shadow(0, 0, 21, 10.5, 0.13);
    // two cards underneath, a little askew
    ([[0.14, 0], [-0.1, TH]] as [number, number][]).forEach(([a, z]) => { p.push(); p.rotate("z", a); slab(p, -CW, -CD, z, CW * 2, CD * 2, TH); p.pop(); });
    // the top card: up, over on its long axis, and down again
    const e = ease(h), zc = TH * 2.5 + Math.sin(e * Math.PI) * 4, k = 3.1;
    p.push();
    p.rotate("x", e * Math.PI, [0, 0, zc]);
    slab(p, -CW, -CD, zc - TH / 2, CW * 2, CD * 2, TH, 0.22, 0.34);
    const up = facing(p, [[-1, -1, zc], [1, -1, zc], [1, 1, zc], [-1, 1, zc]]) > 0;
    // marks lie on the card and read upright on screen; the back one is mirrored so it lands the right way round
    const mark = (s: [number, number][]) => p.line(s.map(([u, v]) => [(u + v) * k, (up ? 1 : -1) * (v - u) * k, zc + (up ? 1 : -1) * (TH / 2 + 0.03)] as V3), SH.edge, 1);
    if (up) { mark(ASK); p.dot([0.9 * k, 0.9 * k, zc + TH / 2 + 0.03], 0.7, 0.02); }
    else mark(TICK);
    p.pop();
  },
};
