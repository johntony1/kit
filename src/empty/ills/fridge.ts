// The fridge is empty: a fridge freezer, shut. Hover and the big door swings open on bare lit shelves.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 8, D = 7, H = 28, SPLIT = 19.4;
/** > 0 when a face whose corners run counter clockwise from outside looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

export const fridge: Illustration = {
  k: "fridge", name: "Fridge", title: "The fridge is empty", body: "Add what you have at home and we will suggest something to cook with it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(h), a = 1.75 * k;
    p.translate(4.5 * k, -4.5 * k, -15);
    p.shadow(0, 2, 25, 12.5, 0.11);
    p.box(-W, -D, 0, 2 * W, 2 * D, H, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    const y = D + 0.03;
    // the freezer door up top, with its handle
    p.line([[-W, y, SPLIT], [W, y, SPLIT]], SH.edge, 0.7);
    p.line([[W - 2, y, SPLIT + 1.6], [W - 2, y, SPLIT + 5.4]], SH.edge, 1.2);
    // inside: lit, two bare shelves and a drawer
    const z0 = 1.2, z1 = SPLIT - 0.8;
    if (k > 0.02) {
      p.face([[-W + 0.9, y, z0], [W - 0.9, y, z0], [W - 0.9, y, z1], [-W + 0.9, y, z1]], 0.42, SH.edge, 0.6);
      // the far wall of the cabinet, set back: a darker panel that gives it depth
      p.face([[-W + 3, y + 0.01, z0 + 2.6], [W - 0.9, y + 0.01, z0 + 2.6], [W - 0.9, y + 0.01, z1], [-W + 3, y + 0.01, z1]], 0.32, 0);
      for (const z of [7.4, 12.8]) p.line([[-W + 0.9, y + 0.03, z], [W - 0.9, y + 0.03, z]], 0.02, 0.8);
      p.line([[-W + 0.9, y + 0.03, 4], [W - 0.9, y + 0.03, 4]], 0.02, 0.5);
    }
    // the door: a slab hinged on its left edge, drawn from whichever side shows
    p.push();
    p.rotate("z", a, [-W, D, 0]);
    const x0 = -W, x1 = W, y0 = D, y1 = D + 1.3, zb = 0.8, zt = SPLIT - 0.4;
    const outer: V3[] = [[x1, y1, zb], [x0, y1, zb], [x0, y1, zt], [x1, y1, zt]];
    const inner: V3[] = [[x0, y0, zb], [x1, y0, zb], [x1, y0, zt], [x0, y0, zt]];
    const end: V3[] = [[x1, y0, zb], [x1, y1, zb], [x1, y1, zt], [x1, y0, zt]];
    const top: V3[] = [[x0, y0, zt], [x1, y0, zt], [x1, y1, zt], [x0, y1, zt]];
    if (facing(p, inner) > 0) {
      p.face(inner, 0.1, SH.edge, 0.6);
      // the door shelves
      for (const z of [4.2, 10.4]) {
        p.face([[x0 + 1.6, y0 - 0.03, z], [x1 - 1.6, y0 - 0.03, z], [x1 - 1.6, y0 - 0.03, z + 2.6], [x0 + 1.6, y0 - 0.03, z + 2.6]], 0.2, SH.edge, 0.5);
      }
    }
    if (facing(p, end) > 0) p.face(end, 0.07, SH.edge, 0.6);
    if (facing(p, outer) > 0) {
      p.face(outer, 0.15, SH.edge, 0.6);
      p.line([[x1 - 2, y1 + 0.03, zt - 7], [x1 - 2, y1 + 0.03, zt - 1.6]], SH.edge, 1.2);
    }
    p.face(top, 0.22, SH.edge, 0.5);
    p.pop();
  },
};
