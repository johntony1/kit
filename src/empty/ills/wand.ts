// Ready when you are: a magic wand, dark with bright tips, held at a slant with a sparkle at its end. Hover and it gives a little flick and the sparkle bursts bigger, two small ones popping beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const pop = (x: number) => { const k = clamp(x); return k < 0.6 ? ease(k / 0.6) * 1.2 : 1.2 - 0.2 * ease((k - 0.6) / 0.4); };
const at = (c: V3, a: number, b: number): V3 => [c[0] + a * 0.577, c[1] - a * 0.577, c[2] + b];
const starPts = (c: V3, R: number, rot: number): V3[] => {
  // four sharp tips joined by inward curves (a quadratic through a point near the middle)
  const out: V3[] = [];
  for (let k = 0; k < 4; k++) {
    const a0 = rot + (k * Math.PI) / 2, a1 = a0 + Math.PI / 2, am = a0 + Math.PI / 4, m = R * 0.16;
    for (let i = 0; i < 12; i++) {
      const s = i / 12, w0 = (1 - s) * (1 - s), w1 = 2 * s * (1 - s), w2 = s * s;
      out.push(at(c, w0 * Math.cos(a0) * R + w1 * Math.cos(am) * m + w2 * Math.cos(a1) * R, w0 * Math.sin(a0) * R + w1 * Math.sin(am) * m + w2 * Math.sin(a1) * R));
    }
  }
  return out;
};
function sparkle(p: Pen, c: V3, R: number, rot: number) {
  if (R < 0.3) return;
  const d = Math.max(0.5, R * 0.09);
  p.face(starPts(at(c, d, -d), R, rot), SH.right, 0);
  const pts = starPts(c, R, rot);
  p.face(pts, 0.13, SH.edge, 0.55);
  for (let k = 0; k < 4; k++) p.face([c, ...pts.slice(k * 12, k * 12 + 7)], 0.4, 0);
}

const L = 30, W = 2.6; // wand length, half thickness

export const wand: Illustration = {
  k: "wand", name: "Magic wand", title: "Ready when you are", body: "Pick a starting point or type an idea, and we will take it from there.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -18);
    p.shadow(-2, 2, 26, 10, 0.12);
    // a flick: up past its rest and back
    const flick = Math.sin(clamp(h * 1.3) * Math.PI) * 0.22 + h * Math.sin(t * 2.6) * 0.03;
    const a = -0.72 - flick;
    p.push();
    p.translate(-4, 12, 9);
    p.rotate("x", a);
    // the shaft along -y: the base cap, the dark body, the bright tip
    p.box(-W, -6, -W, W * 2, 6, W * 2, { top: 0.3, left: 0.24, right: 0.14, lw: 0.55 });
    p.box(-W, -L + 6, -W, W * 2, L - 12, W * 2, { top: 0.16, left: 0.12, right: 0.065, lw: 0.55 });
    p.box(-W, -L, -W, W * 2, 6, W * 2, { top: 0.4, left: 0.34, right: 0.2, lw: 0.55 });
    const tip = p.pt([0, -L - 2, 0]);
    p.pop();
    // the sparkle sits on the tip; find the tip in world space again from its screen point
    const tw: V3 = [0, 0, 0];
    const [ox, oy] = p.pt(tw);
    const c: V3 = at([0, 0, 0], tip[0] - ox, -(tip[1] - oy));
    const k = pop(h * 1.5 - 0.2);
    sparkle(p, c, 9.5 + 3.5 * k + h * Math.sin(t * 4) * 0.4, 0.2 * ease(h));
    sparkle(p, at(c, 11, -6), 4 * pop((h - 0.45) * 2.4), 0);
    sparkle(p, at(c, -9, 7), 3.2 * pop((h - 0.6) * 2.6), 0);
  },
};
