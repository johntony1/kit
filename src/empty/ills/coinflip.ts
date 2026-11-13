// Nothing decided yet: a big coin lying flat. It flips up into the air, tumbling end over end, and lands face up with a little bounce, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.6; // seconds per loop
const R = 10.5, TH = 2.2; // radius and thickness
const A: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0]; // the axis it tumbles about: level, across the screen
const B: V3 = [-Math.SQRT1_2, -Math.SQRT1_2, 0];

/** the coin at height z (its centre), turned th about A */
function coin(p: Pen, z: number, th: number) {
  const c = Math.cos(th), s = Math.sin(th);
  const n: V3 = [B[0] * s, B[1] * s, c]; // its face normal
  const m: V3 = [B[0] * c, B[1] * c, -s]; // the second axis in its face
  const at = (a: number, r: number, off: number): V3 => [A[0] * Math.cos(a) * r + m[0] * Math.sin(a) * r + n[0] * off, A[1] * Math.cos(a) * r + m[1] * Math.sin(a) * r + n[1] * off, z + m[2] * Math.sin(a) * r + n[2] * off];
  const disc = (off: number, r = R) => Array.from({ length: 40 }, (_, i) => at((i / 40) * Math.PI * 2, r, off));
  const side = n[0] + n[1] + n[2] >= 0 ? 1 : -1; // which face looks at us
  for (let k = 0; k <= 5; k++) p.face(disc(-side * TH / 2 + (side * TH * k) / 5), 0.12, 0);
  const o = side * (TH / 2 + 0.02), face = Math.abs(n[0] + n[1] + n[2]) / Math.sqrt(3);
  p.face(disc(o), face > 0.25 ? 0.22 : 0.14, SH.edge, 0.6);
  if (face < 0.25) return;
  const ring = disc(o, R - 1.8);
  p.line([...ring, ring[0]], SH.edge, 0.8);
  // a star struck on each face
  const star = Array.from({ length: 10 }, (_, i) => at(Math.PI / 2 + (i * Math.PI) / 5, i % 2 ? 2.4 : 5.4, o));
  p.face(star, 0.4, 0);
  p.line([...star, star[0]], SH.edge, 0.7);
}

export const coinflip: Illustration = {
  k: "coinflip", name: "Coin flip", title: "Nothing decided yet", body: "Make your first choice and the decision will be recorded here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P + 0.26) % 1; // shifted so a third of the way in it is high, face on
    let z = 0, th = 0;
    if (u > 0.12 && u < 0.82) { const s = (u - 0.12) / 0.7; z = 4 * 13 * s * (1 - s); th = 4 * Math.PI * s; }
    else if (u >= 0.82) { const s = (u - 0.82) / 0.18; z = 1.4 * Math.sin(Math.PI * s); }
    p.translate(0, 0, -6);
    // a shadow that tightens as the coin rises
    p.shadow(0, 0, 21 - z * 0.4, 10.5 - z * 0.2, 0.12);
    coin(p, TH / 2 + z, th);
  },
};
