// Time to relax: a stack of four smooth stones. The top stones rock gently, finding their balance, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
// each stone: half width, half height, sideways offset
const STONES: [number, number, number][] = [[15, 4.6, 0], [11.5, 4, 1.2], [9, 3.6, -0.8], [6, 3.1, 0.5]];

export const spa: Illustration = {
  k: "spa", name: "Spa", title: "Time to relax", body: "Nothing booked. Take a moment, and your treatments will show up here once you plan one.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 32, 12, 0.12);
    // each stone sits on the one below and rocks about where they touch, the higher ones a little more
    let bu = 0, bv = 0, ang = 0;
    STONES.forEach(([ru, rv, off], i) => {
      ang += i === 0 ? 0 : Math.sin(ph - i * 0.6) * 0.045;
      const c = Math.cos(ang), s = Math.sin(ang);
      const at = (u: number, v: number, d = 0): V3 => F(bu + u * c - v * s, bv + u * s + v * c, d);
      const ell = (cu: number, cv: number, a: number, b: number, d = 0): V3[] => Array.from({ length: 40 }, (_, j) => { const q = (j / 40) * Math.PI * 2; return at(cu + Math.cos(q) * a, cv + Math.sin(q) * b, d); });
      const cv = rv - 0.5;
      // depth first so its top shows lit, then the dense body, a lit cap, and a cut outline that parts it from the stone below
      for (let d = -3; d < 0; d += 0.5) p.face(ell(off, cv, ru, rv, d), 0.2, 0);
      p.face(ell(off, cv, ru, rv), 0.1, 0);
      p.face(ell(off - ru * 0.12, cv + rv * 0.32, ru * 0.78, rv * 0.55, 0.1), 0.22, 0);
      const o = ell(off, cv, ru, rv, 0.2);
      p.line([...o, o[0]], 1, 1);
      // the next stone sits on this one's top
      const [nu, nv] = [off * c - (cv + rv - 0.8) * s, off * s + (cv + rv - 0.8) * c];
      bu += nu; bv += nv;
    });
  },
};
