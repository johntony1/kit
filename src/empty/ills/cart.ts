// Your cart is empty: a shopping cart with a solid wire basket rolls forward, tips to a stop over its front wheels, and rolls back.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const PER = 3.6, WR = 2.6; // loop seconds, wheel radius

// where the cart is along x at time t, and how much it tips forward
function track(t: number) {
  const u = (t % PER) / PER;
  let x = 0, tip = 0;
  if (u < 0.3) x = 5 * easeInOut(u / 0.3);
  else if (u < 0.55) x = 5;
  else if (u < 0.9) x = 5 * (1 - easeInOut((u - 0.55) / 0.35));
  if (u > 0.27 && u < 0.5) { const v = (u - 0.27) / 0.23; tip = Math.sin(v * Math.PI * 2) * (1 - v) * (v < 0.5 ? 1 : 0.45); }
  return { x, tip };
}

const lerp = (a: V3, c: V3, k: number): V3 => [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];

export const cart: Illustration = {
  k: "cart", name: "Shopping cart", title: "Your cart is empty", body: "Browse the shop and add something you like. It will wait for you here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const { x, tip } = track(t);
    p.translate(0, 0, -14);
    p.shadow(0, 0, 26, 11, 0.12);
    p.translate(x * 0.85, -x * 0.45, 0);
    p.rotate("z", -0.42); // turned so its side faces us
    p.rotate("y", tip * 0.1, [10, 0, 0]);
    const spin = x / WR;
    // a wheel: a solid disc standing in the y plane, its hub and one spoke cut out so it rolls
    const wheel = (wx: number, wy: number, near: boolean) => {
      p.ringV("y", [wx, wy, WR], WR, near ? 0.3 : 0.12, 0);
      p.dot([wx, wy + 0.1, WR], 0.7, 0);
      const c = Math.cos(spin) * WR * 0.8, s = Math.sin(spin) * WR * 0.8;
      if (near) p.line([[wx - c, wy + 0.1, WR - s], [wx + c, wy + 0.1, WR + s]], SH.edge, 0.6);
    };
    // basket corners: the back is upright, the front leans out, the top flares
    const b = (sx: number, sy: number): V3 => [sx < 0 ? -9 : 7, sy * 4.6, 10];
    const T = (sx: number, sy: number): V3 => [sx < 0 ? -10.5 : 12, sy * 6, 21];
    // far wheels and legs
    wheel(-7.5, -4.2, false); wheel(7, -4.2, false);
    p.box(-8, -4.6, WR, 1, 1, 10 - WR, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(6.5, -4.6, WR, 1, 1, 10 - WR, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the handle at the back: two arms and a thick lit bar
    const arm = (sy: number, fill: number) => { const a = T(-1, sy), c: V3 = [-15, sy * 6, 25]; p.face([a, c, [c[0], c[1], c[2] + 1.3], [a[0], a[1], a[2] + 1.3]], fill, 0); };
    arm(-1, 0.12);
    p.box(-16, -7, 24.6, 1.8, 14, 1.8, { top: 0.28, left: 0.16, right: 0.08, edge: 0 });
    // the inside of the basket: the far walls seen through the open top, sparse with the wires cut through them
    const far: V3[] = [b(-1, -1), b(1, -1), T(1, -1), T(-1, -1)];
    const back: V3[] = [b(-1, -1), b(-1, 1), T(-1, 1), T(-1, -1)];
    p.face(far, 0.055, 0);
    p.face(back, 0.09, 0);
    p.face([b(-1, -1), b(1, -1), b(1, 1), b(-1, 1)], 0.03, 0); // the empty floor
    for (let i = 1; i < 6; i++) { const k = i / 6; p.line([lerp(b(-1, -1), b(1, -1), k), lerp(T(-1, -1), T(1, -1), k)], SH.edge, 0.6); }
    for (let i = 1; i < 3; i++) { const k = i / 3; p.line([lerp(b(-1, -1), b(-1, 1), k), lerp(T(-1, -1), T(-1, 1), k)], SH.edge, 0.6); }
    // the lower rail between the legs
    p.box(-8, -4.6, 4.6, 15.5, 1, 1, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // the near wall (dense) and the front wall (sparse), wires cut through both as a grid
    const near: V3[] = [b(-1, 1), b(1, 1), T(1, 1), T(-1, 1)];
    const front: V3[] = [b(1, -1), b(1, 1), T(1, 1), T(1, -1)];
    p.face(front, SH.right, 0);
    p.face(near, 0.15, 0);
    for (let i = 1; i < 6; i++) { const k = i / 6; p.line([lerp(b(-1, 1), b(1, 1), k), lerp(T(-1, 1), T(1, 1), k)], SH.edge, 0.65); }
    for (let i = 1; i < 3; i++) { const k = i / 3; p.line([lerp(b(1, -1), b(1, 1), k), lerp(T(1, -1), T(1, 1), k)], SH.edge, 0.65); }
    for (const k of [0.36, 0.68]) p.line([lerp(b(-1, 1), T(-1, 1), k), lerp(b(1, 1), T(1, 1), k), lerp(b(1, -1), T(1, -1), k)], SH.edge, 0.65);
    p.line([b(1, 1), T(1, 1)], SH.edge, 0.7); // the corner
    // the rim: a solid lit band round the top, cut where it meets the walls
    const rim = (sx: number, sy: number, k: number): V3 => { const c = T(sx, sy); return [c[0] - sx * k, c[1] - sy * k, 23]; };
    const ring: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = ring[i], [bx, by] = ring[(i + 1) % 4];
      p.face([rim(ax, ay, 0), rim(bx, by, 0), rim(bx, by, 1.4), rim(ax, ay, 1.4)], 0.3, 0);
    }
    p.line([rim(-1, 1, 0), rim(1, 1, 0), rim(1, -1, 0)], SH.edge, 0.55);
    arm(1, 0.22);
    p.box(-8, 4, 4.6, 15.5, 1, 1, { top: 0.22, left: 0.14, right: 0.065, edge: 0 });
    // near legs and wheels
    p.box(-8, 4, WR, 1, 1, 10 - WR, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    p.box(6.5, 4, WR, 1, 1, 10 - WR, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    wheel(-7.5, 4.8, true); wheel(7, 4.8, true);
  },
};
