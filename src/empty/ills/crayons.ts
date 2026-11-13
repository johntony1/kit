// Nothing coloured yet: a box of three fat crayons, their bright pointed tips and banded wrappers standing out of the top. Hover and the crayons rise out of the box one after another, the middle one highest.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => { const v = Math.min(1, Math.max(0, x)); return 1 + 2.4 * Math.pow(v - 1, 3) + 1.4 * Math.pow(v - 1, 2); };
const ROT = -0.5, CR = Math.cos(ROT), SR = Math.sin(ROT);
const R = 3.6; // crayon radius
const ring = (cx: number, cy: number, z: number, r: number, a0: number, a1: number, n = 10): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]; });
const Q = Math.PI / 4;

/** an upright round band seen from the front: the half facing left lit more, the half facing right in shade */
function band(p: Pen, cx: number, cy: number, z0: number, z1: number, r: number, tl: number, tr: number) {
  p.face([...ring(cx, cy, z0, r, Q, 3 * Q), ...ring(cx, cy, z1, r, 3 * Q, Q)], tl, 0);
  p.face([...ring(cx, cy, z0, r, -Q, Q), ...ring(cx, cy, z1, r, Q, -Q)], tr, 0);
}

/** one crayon standing at (cx, cy) from z0: its paper wrapper with two cut rings, then a bright cone tip */
function crayon(p: Pen, cx: number, cy: number, z0: number, top: number, tone: number) {
  const zc = top - 6.5;
  band(p, cx, cy, z0, zc, R, tone, tone * 0.5); // the wrapper
  for (const z of [zc - 1.8, zc - 4.6]) p.line(ring(cx, cy, z, R + 0.05, -Q, 3 * Q), SH.edge, 0.75);
  // the cone: two halves meeting at a small flat tip
  const tr = 0.9;
  p.face([...ring(cx, cy, zc, R, Q, 3 * Q), ...ring(cx, cy, top, tr, 3 * Q, Q, 4)], 0.3, 0);
  p.face([...ring(cx, cy, zc, R, -Q, Q), ...ring(cx, cy, top, tr, Q, -Q, 4)], 0.13, 0);
  p.face(ring(cx, cy, top, tr, 0, Math.PI * 2, 12), 0.3, 0);
  p.line(ring(cx, cy, zc, R + 0.05, -Q, 3 * Q), SH.edge, 0.8); // where the wrapper meets the cone
}

export const crayons: Illustration = {
  k: "crayons", name: "Crayons", title: "Nothing coloured yet", body: "Pick a colour and start drawing. Your pictures will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.scale(1.05);
    p.shadow(0, 0, 26, 12, 0.12);
    const W = 13, D = 5, H = 11; // the box's half width, half depth, height
    // the open top and the far wall inside, dark
    p.push(); p.rotate("z", ROT);
    p.face([[-W, -D, H], [W, -D, H], [W, D, H], [-W, D, H]], 0.035, 0);
    p.pop();
    // the crayons, rising one after another
    const at = (x: number): [number, number] => [x * CR, x * SR];
    const lift = (i: number) => ease((h - i * 0.14) / 0.6);
    const set: [number, number, number][] = [[-8.3, 25 + 3 * lift(0), 0.14], [0, 28 + 6 * lift(1), 0.22], [8.3, 24 + 3.5 * lift(2), 0.14]];
    for (const [x, top, tone] of set) { const [cx, cy] = at(x); crayon(p, cx, cy, 3, top, tone); }
    // the box: its front facing us, lit, with a cut panel; the end in shade
    p.push(); p.rotate("z", ROT);
    p.face([[W, -D, 0], [W, D, 0], [W, D, H], [W, -D, H]], 0.065, 0);
    const F = D + 0.02;
    p.face([[-W, F, 0], [W, F, 0], [W, F, H], [-W, F, H]], 0.22, 0);
    p.line([[-W + 2.2, F + 0.02, 2.4], [W - 2.2, F + 0.02, 2.4], [W - 2.2, F + 0.02, 8], [-W + 2.2, F + 0.02, 8], [-W + 2.2, F + 0.02, 2.4]], SH.edge, 0.7);
    p.pop();
  },
};
