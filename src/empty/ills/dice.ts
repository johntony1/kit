// No rolls yet: a pair of dice. Hover and they hop and tumble over, one after the other, landing on new numbers.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const H = 5.6; // half a die
const X: V3 = [1, 0, 0], Y: V3 = [0, 1, 0], Z: V3 = [0, 0, 1];
const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]];
// each face: its normal, the two axes that span it, and its number
const FACES: [V3, V3, V3, number][] = [[Z, X, Y, 1], [neg(Z), Y, X, 6], [Y, Z, X, 2], [neg(Y), X, Z, 5], [X, Y, Z, 3], [neg(X), Z, Y, 4]];
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
};
type Rot = (v: V3) => V3;
const rotX = (a: number): Rot => ([x, y, z]) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotZ = (a: number): Rot => ([x, y, z]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];

function die(p: Pen, c: V3, rot: Rot) {
  const at = (n: V3, u: V3, v: V3, a: number, b: number): V3 => { const q = rot([n[0] * H + u[0] * a + v[0] * b, n[1] * H + u[1] * a + v[1] * b, n[2] * H + u[2] * a + v[2] * b]); return [c[0] + q[0], c[1] + q[1], c[2] + q[2]]; };
  for (const [n, u, v, val] of FACES) {
    const m = rot(n);
    if (m[0] + m[1] + m[2] <= 0.001) continue;
    p.face([at(n, u, v, -H, -H), at(n, u, v, H, -H), at(n, u, v, H, H), at(n, u, v, -H, H)], 0.075 + 0.145 * Math.max(0, m[2]) + 0.065 * Math.max(0, m[1]), SH.edge, 0.65);
    for (const [a, b] of PIPS[val]) p.clear(Array.from({ length: 10 }, (_, i) => { const q = (i / 10) * Math.PI * 2; return at([n[0] * 1.004, n[1] * 1.004, n[2] * 1.004], u, v, a * 3.2 + Math.cos(q) * 0.9, b * 3.2 + Math.sin(q) * 0.9); }));
  }
}
/** a hop: up and over, with one small bounce at the end. Returns [turn 0..1, height] */
function hop(k: number): [number, number] {
  if (k <= 0) return [0, 0];
  if (k < 0.7) { const v = k / 0.7; return [v * v * (3 - 2 * v), 10 * 4 * v * (1 - v)]; }
  if (k < 1) { const v = (k - 0.7) / 0.3; return [1, 2.2 * 4 * v * (1 - v)]; }
  return [1, 0];
}

export const dice: Illustration = {
  k: "dice", name: "Dice", title: "No rolls yet", body: "Roll the dice to start. Your rolls will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -8);
    p.scale(1.1);
    const [ta, za] = hop(h / 0.6), [tb, zb] = hop((h - 0.38) / 0.62);
    p.shadow(7.5, -7.5, 12, 6, 0.11); p.shadow(-6.5, 6.5, 12, 6, 0.11);
    // both tumble over; the near one also turns as it goes
    const sb = rotZ(0.3), tum = rotX((-Math.PI / 2) * tb);
    die(p, [7.5, -7.5, H + zb], (v) => sb(tum(v)));
    const ra = rotX((Math.PI / 2) * ta), sa = rotZ(-0.22 - (Math.PI / 2) * ta);
    die(p, [-6.5, 6.5, H + za], (v) => sa(ra(v)));
  },
};
