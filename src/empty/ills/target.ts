// No goals set: a target on an easel. Hover and an arrow flies in along its aim line, lands in the bullseye and quivers.
import { SH, type Illustration, type V3 } from "../dots";

const R = 13, ZC = 19, D = 2.4; // radius, height of the centre, thickness of the board
const DIR: V3 = (() => { const v = [-0.18, 1, 0.16], l = Math.hypot(...v); return v.map((x) => x / l) as V3; })(); // the way the arrow points back

export const target: Illustration = {
  k: "target", name: "Target", title: "No goals set", body: "Set a goal and track how close you are to hitting it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // seconds since the hover began, read back from the eased hover value
    const since = -Math.log(Math.max(1e-4, 1 - h)) / 7;
    p.translate(2, -4, -16);
    p.shadow(0, -1, 26, 10, 0.1);
    // the easel: two legs at the back and a strut
    p.box(-8, -D - 2, 0, 1.6, 1.6, ZC, { top: 0.2 });
    p.box(6.4, -D - 2, 0, 1.6, 1.6, ZC, { top: 0.2 });
    p.box(-0.8, -D - 9, 0, 1.6, 1.6, 2, { top: 0.2 });
    // the board: rings stepped back to front, then the painted rings
    for (let y = -D; y < 0; y += 0.25) p.ringV("y", [0, y, ZC], R, SH.right, 0);
    const rings: [number, number][] = [[R, 0.21], [R * 0.79, 0.03], [R * 0.59, 0.21], [R * 0.4, 0.03], [R * 0.21, 0.34]];
    rings.forEach(([r, f], i) => p.ringV("y", [0, 0.01 * (i + 1), ZC], r, f, SH.edge, 0.55));
    // two short feet in front, under the rim
    p.box(-7.4, 0, 0, 2, 2, ZC - R + 2.5, { top: 0.2, left: 0.14 });
    p.box(5.4, 0, 0, 2, 2, ZC - R + 2.5, { top: 0.2, left: 0.14 });
    // the arrow: far off at rest, then flying in and quivering once it lands
    const f = Math.min(1, since / 0.32);
    const dist = 13 * (1 - f * f);
    const q = f >= 1 ? Math.sin((since - 0.32) * 38) * Math.exp(-(since - 0.32) * 3.5) * h * 0.9 : 0;
    const tip: V3 = [DIR[0] * dist, 0.2 + DIR[1] * dist, ZC + DIR[2] * dist];
    const L = 15;
    const tail: V3 = [tip[0] + DIR[0] * L + q * 2, tip[1] + DIR[1] * L, tip[2] + DIR[2] * L + q * 3];
    // the aim line, from the arrow to the bullseye
    if (dist > 0.5) p.guide([[0, 0.1, ZC], tip], true);
    const off = (v: V3, dz: number, dx = 0): V3 => [v[0] + dx, v[1], v[2] + dz];
    const mid = (k: number): V3 => [tip[0] + (tail[0] - tip[0]) * k, tip[1] + (tail[1] - tip[1]) * k, tip[2] + (tail[2] - tip[2]) * k];
    // shaft: a thin lit strip
    p.face([off(mid(0.1), -0.45), off(tail, -0.45), off(tail, 0.45), off(mid(0.1), 0.45)], 0.2, SH.edge, 0.4);
    // head
    p.face([tip, off(mid(0.16), -1.4), off(mid(0.16), 1.4)], 0.2, SH.edge, 0.45);
    // fletching: two vanes at the tail
    const f0 = mid(0.78);
    p.face([f0, tail, off(tail, 2.6), off(mid(0.86), 2.4)], 0.22, SH.edge, 0.45);
    p.face([f0, tail, off(tail, -2.6), off(mid(0.86), -2.4)], 0.14, SH.edge, 0.45);
    // a burst where it lands
    if (f >= 1 && since < 0.82) {
      const k = (since - 0.32) / 0.5;
      for (let i = 0; i < 7; i++) {
        const an = (i / 7) * Math.PI * 2 + 0.3;
        p.dot([Math.cos(an) * (3 + k * 6), 1.5, ZC + Math.sin(an) * (3 + k * 6)], 0.7, 1 - k);
      }
    }
  },
};
