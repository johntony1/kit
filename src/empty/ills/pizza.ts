// No slices left: a pizza box, its lid just ajar. Hover and the lid swings open on an empty box: a ring of grease, a crust and crumbs.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 11, H = 3.2, T = 0.8; // half width, height of the tray, thickness of the lid
/** > 0 when a face whose corners run counter clockwise from outside looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
const ring = (r: number, z: number, n = 40): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

/** the lid: a thin slab hinged along the back edge, drawn from whichever side shows */
function lid(p: Pen, a: number) {
  p.push();
  p.rotate("x", a, [0, -W, H]);
  const z = H, Z = H + T;
  const top: V3[] = [[-W, -W, Z], [W, -W, Z], [W, W, Z], [-W, W, Z]];
  const bot: V3[] = [[-W, W, z], [W, W, z], [W, -W, z], [-W, -W, z]];
  const sides: [V3[], number][] = [
    [[[W, W, z], [-W, W, z], [-W, W, Z], [W, W, Z]], 0.13],
    [[[W, -W, z], [W, W, z], [W, W, Z], [W, -W, Z]], 0.07],
    [[[-W, W, z], [-W, -W, z], [-W, -W, Z], [-W, W, Z]], 0.07],
  ];
  if (facing(p, bot) > 0) { // the inside of the lid, with its fold lines
    p.face(bot, 0.2, SH.edge, 0.6);
    p.line([[-W + 1.6, -W + 1.6, z], [W - 1.6, -W + 1.6, z], [W - 1.6, W - 1.6, z], [-W + 1.6, W - 1.6, z], [-W + 1.6, -W + 1.6, z]], 0.45, 0.45);
  }
  for (const [f, fill] of sides) if (facing(p, f) > 0) p.face(f, fill, SH.edge, 0.6);
  if (facing(p, top) > 0) { // the printed top: a pizza cut in six
    p.face(top, 0.2, SH.edge, 0.6);
    p.line(ring(7, Z + 0.02), SH.edge, 0.8);
    for (let i = 0; i < 3; i++) { const b = (i * Math.PI) / 3 + 0.3; p.line([[Math.cos(b) * 7, Math.sin(b) * 7, Z + 0.02], [-Math.cos(b) * 7, -Math.sin(b) * 7, Z + 0.02]], SH.edge, 0.55); }
  }
  p.pop();
}

export const pizza: Illustration = {
  k: "pizza", name: "Pizza box", title: "No slices left", body: "That was the last of it. Order again and the box fills back up.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(h), a = 0.16 + 1.84 * k;
    p.translate(2 * k, 2 * k, -6 - 5 * k);
    p.scale(1.08);
    p.shadow(0, 0, 27, 13.5, 0.11);
    if (a > Math.PI / 2) lid(p, a);
    // the tray: a dark floor and the inside of the two far walls
    p.face([[-W, -W, 0.4], [W, -W, 0.4], [W, W, 0.4], [-W, W, 0.4]], 0.12, 0);
    p.face([[-W, -W, 0.4], [W, -W, 0.4], [W, -W, H], [-W, -W, H]], 0.18, SH.edge, 0.5);
    p.face([[-W, -W, 0.4], [-W, W, 0.4], [-W, W, H], [-W, -W, H]], 0.15, SH.edge, 0.5);
    // what is left: a ring of grease, one crust and some crumbs
    const z = 0.45;
    p.line(ring(8.2, z), 0.3, 0.5);
    const crust = (r: number) => Array.from({ length: 9 }, (_, i) => { const b = 0.3 + (i / 8) * 0.9; return [-1 + Math.cos(b) * r, -1 + Math.sin(b) * r, z + 0.02] as V3; });
    p.face([...crust(7.6), ...crust(5.6).reverse()], 0.9, 0);
    ([[-5, -3], [-2, 4.5], [3.5, -5], [-6.5, 2], [1, -1.5], [5.5, 1], [-3, -6.5], [-0.5, 1.5]] as [number, number][]).forEach(([x, y], i) => p.dot([x, y, z], i % 3 ? 0.55 : 0.8, 1));
    // the near walls
    p.face([[-W, W, 0], [W, W, 0], [W, W, H], [-W, W, H]], SH.left, SH.edge, 0.6);
    p.face([[W, -W, 0], [W, W, 0], [W, W, H], [W, -W, H]], SH.right, SH.edge, 0.6);
    if (a <= Math.PI / 2) lid(p, a);
  },
};
