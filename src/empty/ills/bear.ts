// No market moves: a bear's head, a round chunky cut out with two round ears, asleep. Hover and it wakes: the ears perk up, the eyes open and the head gives a slow nod.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const TURN = -0.4, Y0 = -2.5, Y1 = 2.5;
const CZ = 12, R = 13.5; // the head's centre height and radius

/** a flat outline pushed out into a thick slab between y0 and y1: its rim, then its front */
function slab(p: Pen, out: [number, number][], y0: number, y1: number, front: number) {
  const c = Math.cos(TURN), s = Math.sin(TURN);
  for (let i = 0; i < out.length; i++) {
    const [ax, az] = out[i], [bx, bz] = out[(i + 1) % out.length];
    const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L, nz = (bx - ax) / L;
    if (nx * (c + s) + nz <= 0) continue;
    p.face([[ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]], nz > 0.45 ? SH.top : nx < 0 ? SH.left : SH.right, 0);
  }
  p.face(out.map(([x, z]) => [x, y1, z] as V3), front, 0);
}
/** a clockwise ellipse outline in the plane, [x, z] */
const ell = (cx: number, cz: number, rx: number, rz: number, n = 40): [number, number][] =>
  Array.from({ length: n }, (_, i) => { const a = Math.PI - (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cz + Math.sin(a) * rz]; });
const at = (pts: [number, number][], y: number) => pts.map(([x, z]) => [x, y, z] as V3);

export const bear: Illustration = {
  k: "bear", name: "Bear", title: "No market moves", body: "When the markets move on what you follow, the changes will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 22, 10, 0.1);
    const wake = ease(clamp(h / 0.5)), nod = Math.sin(Math.PI * clamp((h - 0.4) / 0.6)) * 0.12 + h * Math.sin(t * 2.2) * 0.02;
    p.push();
    p.rotate("z", TURN);
    p.rotate("x", nod, [0, 0, 0]);
    // the ears, set a little behind the head, rising as it wakes
    const lift = 1.6 * wake;
    for (const s of [-1, 1]) {
      const e = ell(s * 10.2, CZ + 10.2 + lift, 5.2, 5.2);
      slab(p, e, Y0 - 1, Y1 - 1, 0.2);
      p.face(at(ell(s * 10.2, CZ + 10.2 + lift, 2.6, 2.6), Y1 - 0.96), 0.04, 0);
    }
    slab(p, ell(0, CZ, R, R * 0.94, 56), Y0, Y1, 0.2);
    const y = Y1 + 0.04;
    // the muzzle: a raised lit pad with a dark nose
    p.face(at(ell(0, CZ - 5.4, 7.6, 5.7), y + 0.02), 0.03, 0);
    for (let d = 0; d <= 1.6; d += 0.4) p.face(at(ell(0, CZ - 5.2, 6.6, 4.8), y + d), d < 1.6 ? 0.12 : 0.3, 0);
    p.face(at([[-2.6, CZ - 2.4], [2.6, CZ - 2.4], [0, CZ - 5.2]], y + 1.7), 0.02, 0);
    p.line([[0, y + 1.72, CZ - 5.2], [0, y + 1.72, CZ - 7.2]], SH.edge, 0.7);
    // the eyes: closed lines asleep, round and dark awake
    for (const s of [-1, 1]) {
      if (wake < 0.5) p.line(Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (i / 6); return [s * 5.2 - Math.cos(a) * 1.8, y, CZ + 3 - Math.sin(a) * 0.9] as V3; }), SH.edge, 0.9);
      else p.dot([s * 5.2, y, CZ + 3], 1.6 * (wake - 0.3) / 0.7, 0);
    }
    p.pop();
  },
};
