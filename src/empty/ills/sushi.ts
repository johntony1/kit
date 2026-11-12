// No specials today: a sushi board with a piece of nigiri, a maki roll and a dab of wasabi. A pair of chopsticks lifts a second roll off the board and sets it back, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const S2 = Math.SQRT1_2, ZT = 3.6; // the board's top
/** a point in the plane that faces us, through c: u across the screen, v up */
const flat = (c: V3, u: number, v: number): V3 => [c[0] + u * S2, c[1] - u * S2, c[2] + v];

// a maki roll: a dark wrap, a bright top of rice, the filling in the middle
function maki(p: Pen, x: number, y: number, z: number) {
  p.cylinder(x, y, z, 4, 4.6, { top: 0.36, side: 0.04, lw: 0.6 });
  p.disc(x, y, z + 4.62, 1.6, 0.04, SH.edge);
}
// a chopstick: a long thin bright bar in the plane that faces us
function stick(p: Pen, c: V3, u0: number, v0: number, u1: number, v1: number) {
  const w = 0.55;
  p.face([flat(c, u0, v0 - w), flat(c, u1, v1 - w * 1.5), flat(c, u1, v1 + w * 1.5), flat(c, u0, v0 + w)], 0.34, SH.edge, 0.4);
}

export const sushi: Illustration = {
  k: "sushi", name: "Sushi", title: "No specials today", body: "The kitchen has not posted any specials yet. Fresh plates will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const lift = 9 * Math.pow(0.5 - 0.5 * Math.cos(u * Math.PI * 2), 1.4);
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 14, 0.12);
    // the board on its two feet
    for (const x of [-12, 9]) p.box(x, -8, 0, 3, 16, 1.8, { top: 0.1 });
    p.box(-16, -9, 1.8, 32, 18, 1.8);
    // nigiri at the back: a block of rice under a striped slice that hangs over its ends
    p.box(-13, -6.4, ZT, 11, 5.4, 2.6, { top: 0.2 });
    p.box(-14, -6.8, ZT + 2.6, 13, 6.2, 1.1, { top: 0.36, left: 0.26, right: 0.16 });
    for (const x of [-10.6, -7.4, -4.2]) p.line([[x - 0.8, -6.8, ZT + 3.72], [x + 0.8, -0.6, ZT + 3.72]], SH.edge, 0.45);
    // the roll that stays, and the wasabi
    maki(p, 8.4, -3.4, ZT);
    p.cylinder(11.6, 4.6, ZT, 2, 1, { top: 0.3, side: 0.2, lw: 0.4 });
    p.cylinder(11.6, 4.6, ZT + 1, 1.1, 0.8, { top: 0.34, side: 0.24, lw: 0.4 });
    // the roll that is lifted: its shadow shrinks on the board as it rises
    const c: V3 = [-1.5, 3.2, ZT + lift];
    p.disc(c[0], c[1], ZT + 0.02, 4 - lift * 0.18, 0.09, 0);
    stick(p, [c[0], c[1], c[2] + 4.6], -5, 0.4, 19, 13.5);
    maki(p, c[0], c[1], c[2]);
    stick(p, [c[0] + 3, c[1] + 3, c[2] + 2.2], -5, 0.2, 20, 12.5);
  },
};
