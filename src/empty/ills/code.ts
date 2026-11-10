// No snippets: chunky angle brackets and a slash standing on a slab. Hover and the brackets part while the slash hops and rocks.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number]; // a point in the glyph's own plane: u along the baseline, v up
const TH = 3; // stroke thickness
const HT = 3.2; // how far the glyphs stand up off the slab
const ZB = 4; // slab top
const K = Math.SQRT1_2;
// the glyphs lie on the slab with their baseline running across the screen, so they read upright
const W = ([u, v]: P2, z: number): V3 => [(u - v) * K, (-u - v) * K, z];

/** one straight stroke from a to b, raised off the slab: a lit top, a dense left side, a sparse right side */
function stroke(p: Pen, a: P2, b: P2, z0: number) {
  const du = b[0] - a[0], dv = b[1] - a[1], L = Math.hypot(du, dv);
  const nu = (-dv / L) * (TH / 2), nv = (du / L) * (TH / 2);
  const poly: P2[] = [[a[0] - nu, a[1] - nv], [b[0] - nu, b[1] - nv], [b[0] + nu, b[1] + nv], [a[0] + nu, a[1] + nv]];
  const z1 = z0 + HT;
  const wp = poly.map((q) => W(q, z0));
  const area = wp.reduce((s, q, i) => { const r = wp[(i + 1) % 4]; return s + q[0] * r[1] - r[0] * q[1]; }, 0);
  for (let i = 0; i < 4; i++) {
    const q = wp[i], r = wp[(i + 1) % 4];
    const ex = r[0] - q[0], ey = r[1] - q[1];
    const nx = area > 0 ? ey : -ey, ny = area > 0 ? -ex : ex; // outward normal
    if (nx + ny <= 0.001) continue;
    p.face([q, r, [r[0], r[1], z1], [q[0], q[1], z1]], ny > nx ? SH.left : SH.right, 0);
  }
  p.face(poly.map((q) => W(q, z1)), SH.top, 0);
}

export const code: Illustration = {
  k: "code", name: "Code", title: "No snippets", body: "Save a piece of code and it will be kept here for next time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -10);
    p.shadow(0, 0, 34, 17, 0.1);
    // the slab
    p.box(-16.5, -16.5, 0, 33, 33, ZB, { top: 0.035, left: 0.13, right: 0.065 });
    const spread = h * 3;
    // "<"
    const lx = -17 - spread;
    stroke(p, [lx + 8, 8], [lx, 0], ZB);
    stroke(p, [lx, 0], [lx + 8, -8], ZB);
    // "/": hops and rocks while hovered
    const hop = h * (1.2 + 3 * Math.abs(Math.sin(t * 5)));
    const rock = h * 0.2 * Math.sin(t * 5);
    const rot = (q: P2): P2 => { const c = Math.cos(rock), s = Math.sin(rock); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; };
    stroke(p, rot([-3.6, -8.6]), rot([3.6, 8.6]), ZB + hop);
    // ">"
    const rx = 9 + spread;
    stroke(p, [rx, 8], [rx + 8, 0], ZB);
    stroke(p, [rx + 8, 0], [rx, -8], ZB);
    // a blinking caret on the slab while hovered
    if (h > 0.5 && Math.sin(t * 7) > 0) p.face([W([-3, -11.4], ZB + 0.03), W([3, -11.4], ZB + 0.03), W([3, -12.6], ZB + 0.03), W([-3, -12.6], ZB + 0.03)], SH.top, 0);
  },
};
