// No fees charged: a thick coin with a percent sign cut in its face. A wedge slides out of it, lifts, and slides back in, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const R = 12.5, T = 4.2; // radius and thickness
const AL = Math.PI / 2 - 0.15, HW = Math.PI / 6; // the wedge's direction and half angle
const VIS: [number, number] = [-Math.PI / 4, (3 * Math.PI) / 4]; // the half of a round side that faces us
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
/** a piece of the coin between angles a0 and a1: its round side, the cut wall at a1 and its top */
function piece(p: Pen, a0: number, a1: number, wall: number) {
  // the cut wall at angle `wall`, from the centre out
  p.face([[0, 0, 0], [Math.cos(wall) * R, Math.sin(wall) * R, 0], [Math.cos(wall) * R, Math.sin(wall) * R, T], [0, 0, T]], 0.09, SH.edge, 0.55);
  for (const [s0, s1] of [[a0, a1], [a0 - 2 * Math.PI, a1 - 2 * Math.PI]]) {
    const s = Math.max(s0, VIS[0]), e = Math.min(s1, VIS[1]);
    if (e > s) {
      p.face([...arc(R, 0, s, e), ...arc(R, T, e, s)], 0.12, 0);
      p.line(arc(R, T * 0.5, s, e), SH.edge, 0.45);
    }
  }
  p.face([[0, 0, T], ...arc(R, T, a0, a1, 40)], 0.21, SH.edge, 0.6);
  p.line(arc(R - 1.8, T + 0.03, a0 + 0.12, a1 - 0.12, 36), SH.edge, 0.6);
}

export const fees: Illustration = {
  k: "fees", name: "Fees", title: "No fees charged", body: "Any fees taken from your payments will be listed here, so nothing comes as a surprise.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // out, hold up, back in, rest
    const out = u < 0.3 ? ease(u / 0.3) : u < 0.62 ? 1 : u < 0.9 ? 1 - ease((u - 0.62) / 0.28) : 0;
    const up = u < 0.62 ? Math.sin(Math.min(1, u / 0.62) * Math.PI) * 2.2 : 0;
    p.translate(0, 0, -6);
    p.scale(1.05);
    p.shadow(0, 0, 28, 14, 0.12);
    p.rotate("z", -0.2);
    // the coin less its wedge, with the percent sign on its back half
    piece(p, AL + HW, AL + 2 * Math.PI - HW, AL + HW);
    const Z = T + 0.05, e1: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0], e2: V3 = [-Math.SQRT1_2, -Math.SQRT1_2, 0];
    const c: V3 = [-Math.cos(AL) * 3.2, -Math.sin(AL) * 3.2, Z];
    const at = (a: number, b: number): V3 => [c[0] + e1[0] * a + e2[0] * b, c[1] + e1[1] * a + e2[1] * b, Z];
    const o = (a: number, b: number) => Array.from({ length: 17 }, (_, i) => { const q = (i / 16) * Math.PI * 2; return at(a + Math.cos(q) * 1.4, b + Math.sin(q) * 1.6); });
    p.line(o(-2.6, 2.4), SH.edge, 1);
    p.line(o(2.6, -2.4), SH.edge, 1);
    p.line([at(-3, -3.6), at(3, 3.6)], SH.edge, 1.1);
    // the wedge, slid out toward us
    p.push();
    p.translate(Math.cos(AL) * 6 * out, Math.sin(AL) * 6 * out, up);
    piece(p, AL - HW, AL + HW, AL - HW);
    p.pop();
  },
};
