// No lunch planned: a lunch box with a carry handle and a clasp, an apple beside it. Hover and the lid swings back to show a sandwich, a snack and a divider inside.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S2 = Math.SQRT1_2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** screen winding: > 0 when an outward face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a box that may be turned any way: only the faces that look at us are drawn */
function slab(p: Pen, x: number, y: number, z: number, w: number, d: number, h: number, under = 0.1) {
  const X = x + w, Y = y + d, Z = z + h;
  const top: V3[] = [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]];
  const bot: V3[] = top.map(([a, b]) => [a, b, z] as V3).reverse();
  const fills = [SH.left, SH.right, SH.left, SH.right];
  top.forEach((a, i) => { const b = top[(i + 1) % 4], f: V3[] = [a, [a[0], a[1], z], [b[0], b[1], z], b]; if (facing(p, f) > 0) p.face(f, fills[i], SH.edge, 0.6); });
  if (facing(p, bot) > 0) p.face(bot, under, SH.edge, 0.6);
  if (facing(p, top) > 0) p.face(top, SH.top, SH.edge, 0.6);
}
/** a ball, as a circle that faces the screen */
function ball(p: Pen, c: V3, r: number, fill: number) {
  const k = (r / 1.2247) * S2;
  p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [c[0] + Math.cos(a) * k, c[1] - Math.cos(a) * k, c[2] + Math.sin(a) * r] as V3; }), fill, SH.edge, 0.6);
}
const W = 13, D = 8.5, H = 8.5, LID = 3;

export const lunchbox: Illustration = {
  k: "lunchbox", name: "Lunch box", title: "No lunch planned", body: "Plan a lunch for the week and it will be packed and waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 1, -8);
    p.scale(1.08);
    p.shadow(1, 0, 29, 14, 0.12);
    const a = ease(Math.min(1, h * 1.15)) * 1.5;
    const lid = () => {
      p.push();
      p.rotate("x", a, [0, -D, H]);
      const handle = () => {
        // the carry handle: an arch standing on the lid
        for (const x of [-6, 4.6]) p.box(x, -0.9, H + LID, 1.4, 1.8, 3, { top: 0.34, left: 0.3, right: 0.16, lw: 0.4 });
        p.box(-6, -0.9, H + LID + 3, 12, 1.8, 1.5, { top: 0.36, left: 0.3, right: 0.16, lw: 0.4 });
      };
      if (a > 1.2) handle();
      slab(p, -W, -D, H, W * 2, D * 2, LID, 0.14);
      if (a <= 1.2) {
        // a sunk panel on the lid, so the handle stands out
        p.face([[-W + 2, -D + 2, H + LID + 0.02], [W - 2, -D + 2, H + LID + 0.02], [W - 2, D - 2, H + LID + 0.02], [-W + 2, D - 2, H + LID + 0.02]], 0.07, SH.edge, 0.5);
        handle();
      }
      p.pop();
    };
    if (a > 0.9) lid();
    // the box: open, with a divider, a sandwich cut in two and a round snack
    p.box(-W, -D, 0, W * 2, D * 2, H, { open: true });
    if (a > 0.05) {
      p.box(2.6, -D + 2, H - 2.4, 1, D * 2 - 4, 2.6, { top: 0.26 });
      p.face([[-10.6, -5.6, H + 1.2], [0, -5.6, H + 1.2], [-10.6, 5.2, H + 1.2]], 0.36, SH.edge, 0.6);
      p.face([[-10.6, 5.2, H - 1.6], [0, -5.6, H - 1.6], [0, -5.6, H + 1.2], [-10.6, 5.2, H + 1.2]], 0.07, SH.edge, 0.5);
      p.face([[0.6, -4.6, H + 0.4], [0.6, 6, H + 0.4], [-9.8, 6, H + 0.4]], 0.3, SH.edge, 0.6);
      p.face([[-9.8, 6, H - 1.6], [0.6, 6, H - 1.6], [0.6, 6, H + 0.4], [-9.8, 6, H + 0.4]], 0.07, SH.edge, 0.5);
      p.cylinder(7.6, -2.6, H - 1.6, 2.7, 2.4, { top: 0.32, side: 0.14 });
      p.cylinder(7.6, 3.4, H - 1.6, 2.1, 1.8, { top: 0.28, side: 0.14 });
    }
    // the clasp on the front
    p.face([[-1.8, D + 0.03, H - 3.4], [1.8, D + 0.03, H - 3.4], [1.8, D + 0.03, H - 0.6], [-1.8, D + 0.03, H - 0.6]], 0.3, SH.edge, 0.5);
    if (a <= 0.9) lid();
    // the apple beside it, with a stalk and a leaf
    const ap: V3 = [19.5, 4.5, 3.9];
    p.shadow(19.5, 4.5, 6, 3, 0.1);
    ball(p, ap, 4.1, 0.22);
    p.face([[ap[0], ap[1], 7.2], [ap[0] + 0.5, ap[1] - 0.5, 7.2], [ap[0] + 0.7, ap[1] - 0.7, 9.4], [ap[0] + 0.2, ap[1] - 0.2, 9.4]], 0.3, 0);
    p.face([[ap[0] + 0.5, ap[1] - 0.5, 8.6], [ap[0] + 2, ap[1] - 2, 10.6], [ap[0] + 3.6, ap[1] - 3.6, 9.8], [ap[0] + 2.2, ap[1] - 2.2, 8.2]], 0.3, SH.edge, 0.4);
  },
};
