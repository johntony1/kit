// Add tile: a shallow square tray with a thick plus lying in it. Hover and the plus lifts out of the tray, turning to face us square on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const S = 14, B = 3.6; // the tile's half size and height
const plus = (a: number, b: number): P2[] => [[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]];

/** an outline in [x, y] raised from z by hgt: the walls that face us, back to front, then the top */
function block(p: Pen, prof: P2[], z: number, hgt: number, top: number) {
  const walls: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length; i++) {
    const [x0, y0] = prof[i], [x1, y1] = prof[(i + 1) % prof.length], nx = y1 - y0, ny = -(x1 - x0);
    if (nx + ny <= 0) continue;
    walls.push({ d: x0 + x1 + y0 + y1, pts: [[x0, y0, z], [x1, y1, z], [x1, y1, z + hgt], [x0, y0, z + hgt]], f: ny > nx ? 0.065 : 0.04 });
  }
  walls.sort((a, b) => a.d - b.d).forEach((w) => p.face(w.pts, w.f, 0));
  p.face(prof.map(([x, y]) => [x, y, z + hgt] as V3), top, SH.edge, 0.6);
}

export const addtile: Illustration = {
  k: "addtile", name: "Add tile", title: "Add your first item", body: "Create an item to get started. It will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.6)), lift = 4.5 * k + h * Math.sin(t * 2.2) * 0.6;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 32, 16, 0.12);
    p.box(-S, -S, 0, 2 * S, 2 * S, B, { top: 0.2, left: 0.12, right: 0.065 });
    // the tray: a dark floor inside the rim
    const e = S - 2.6, z = B + 0.02, F = 1;
    p.clear([[-e, -e, z], [e, -e, z], [e, e, z], [-e, e, z]]);
    // it turns an eighth as it rises, so it ends square to the screen
    const r = (Math.PI / 4) * k, c = Math.cos(r), sn = Math.sin(r);
    block(p, plus(2.1, 8.2).map(([x, y]) => [x * c - y * sn, x * sn + y * c] as P2), F + 0.8 + lift, 1.5, 0.22 + 0.14 * k);
  },
};
