// Your cart is empty: a wire shopping cart rolls in, tips to a stop, and rolls back out.
import { easeInOut, type Illustration, type V3 } from "../dots";

const PER = 3.6, WR = 2.3; // loop seconds, wheel radius

// where the cart is along x at time t, and how much it tips forward
function track(t: number) {
  const u = (t % PER) / PER;
  let x = -10, tip = 0;
  if (u < 0.36) x = -10 + 10 * easeInOut(u / 0.36);
  else if (u < 0.62) x = 0;
  else if (u < 0.97) x = -10 * easeInOut((u - 0.62) / 0.35);
  if (u > 0.32 && u < 0.54) { const v = (u - 0.32) / 0.22; tip = Math.sin(v * Math.PI * 2) * (1 - v) * (v < 0.5 ? 1 : 0.45); }
  return { x, tip };
}

const lerp = (a: V3, c: V3, k: number): V3 => [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];

export const cart: Illustration = {
  k: "cart", name: "Shopping cart", title: "Your cart is empty", body: "Browse the shop and add something you like. It will wait for you here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const { x, tip } = track(t);
    p.translate(6, -1, -13);
    p.shadow(x, 0, 21, 10, 0.11);
    p.translate(x, 0, 0);
    // a small tip forward over the front wheels as it stops
    p.rotate("y", tip * 0.12, [9, 0, 0]);
    const spin = x / WR;
    const wheel = (wx: number, wy: number, near: boolean) => {
      p.ringV("y", [wx, wy, WR], WR, near ? 0.16 : 0.08, near ? 1 : 0.6, 0.6);
      const c = Math.cos(spin) * WR, s = Math.sin(spin) * WR;
      p.line([[wx - c, wy + 0.05, WR - s], [wx + c, wy + 0.05, WR + s]], near ? 0.95 : 0.5, 0.6);
    };
    // basket corners: the back is upright, the front leans forward, the top flares
    const b = (sx: number, sy: number): V3 => [sx < 0 ? -9 : 6, sy * 4.6, 9];
    const T = (sx: number, sy: number): V3 => [sx < 0 ? -10 : 11.5, sy * 6.2, 20];
    // far wheels and legs
    wheel(-8, -4.4, false); wheel(7, -4.4, false);
    p.line([[-8, -4.4, WR], [-8, -4.4, 9]], 0.5, 0.5); p.line([[7, -4.4, WR], [6, -4.4, 9]], 0.5, 0.5);
    p.line([[-8, -4.4, 4.5], [7, -4.4, 4.5]], 0.4, 0.5);
    // far walls and floor: faint fills, dim wires
    p.face([b(-1, -1), b(1, -1), b(1, 1), b(-1, 1)], 0.05, 0.45, 0.45);
    p.face([b(-1, -1), b(1, -1), T(1, -1), T(-1, -1)], 0.05, 0.45, 0.45);
    p.face([b(-1, -1), b(-1, 1), T(-1, 1), T(-1, -1)], 0.07, 0.45, 0.45);
    for (let i = 1; i < 5; i++) { const k = i / 5; p.line([lerp(b(-1, -1), b(1, -1), k), lerp(T(-1, -1), T(1, -1), k)], 0.3, 0.45); }
    // the handle at the back (-x end)
    p.line([T(-1, -1), [-14, -6.2, 24]], 0.85, 0.7);
    p.line([T(-1, 1), [-14, 6.2, 24]], 1, 0.7);
    p.line([[-14, -6.6, 24], [-14, 6.6, 24]], 1, 1.5);
    // near walls: open wire with bright edges and a grid
    for (let i = 1; i < 5; i++) { const k = i / 5; p.line([lerp(b(-1, 1), b(1, 1), k), lerp(T(-1, 1), T(1, 1), k)], 0.62, 0.45); }
    for (let i = 1; i < 3; i++) { const k = i / 3; p.line([lerp(b(1, -1), b(1, 1), k), lerp(T(1, -1), T(1, 1), k)], 0.62, 0.45); }
    p.line([lerp(b(-1, 1), T(-1, 1), 0.5), lerp(b(1, 1), T(1, 1), 0.5), lerp(b(1, -1), T(1, -1), 0.5)], 0.62, 0.45);
    p.line([b(-1, 1), b(1, 1), b(1, -1)], 1, 0.65);
    p.line([b(-1, 1), T(-1, 1)], 1, 0.65); p.line([b(1, 1), T(1, 1)], 1, 0.65); p.line([b(1, -1), T(1, -1)], 1, 0.65);
    p.line([T(-1, -1), T(1, -1), T(1, 1), T(-1, 1), T(-1, -1)], 1, 0.8);
    // near legs, the lower rail, near wheels
    p.line([[-8, 4.4, WR], [-8, 4.4, 9]], 0.9, 0.6); p.line([[7, 4.4, WR], [6, 4.4, 9]], 0.9, 0.6);
    p.line([[-8, 4.4, 4.5], [7, 4.4, 4.5]], 0.8, 0.6);
    wheel(-8, 4.4, true); wheel(7, 4.4, true);
  },
};
