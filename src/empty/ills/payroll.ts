// No payroll runs yet: a tall stack of pay slips and a short pile beside it. Slip after slip lifts off the stack, arcs over and settles on the pile.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 2.8, HW = 6.6, HD = 5.4; // seconds per loop, half width and half depth of a slip
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number) => Math.max(0, Math.min(1, v));

// what is printed on a slip centred on (cx, 0) at height z: a coin mark, a name, two amounts
function print(p: Pen, cx: number, z: number) {
  p.line(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [cx - 3.2 + Math.cos(a) * 1.9, -2 + Math.sin(a) * 1.9, z] as V3; }), SH.edge, 0.6);
  p.line([[cx - 3.2, -2.9, z], [cx - 3.2, -1.1, z]], SH.edge, 0.6);
  p.line([[cx + 0.2, -2.8, z], [cx + 4.8, -2.8, z]], SH.edge, 0.8);
  p.line([[cx + 0.2, -0.9, z], [cx + 3.2, -0.9, z]], 0.6, 0.5);
  p.line([[cx - 5, 1.6, z], [cx + 4.8, 1.6, z]], 0.6, 0.5);
  p.line([[cx - 5, 3.5, z], [cx + 1, 3.5, z]], 0.6, 0.5);
}
function stack(p: Pen, cx: number, hgt: number) {
  p.box(cx - HW, -HD, 0, HW * 2, HD * 2, hgt);
  print(p, cx, hgt + 0.03);
}

export const payroll: Illustration = {
  k: "payroll", name: "Pay slips", title: "No payroll runs yet", body: "Run payroll and a pay slip for each person will be kept here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -7);
    p.shadow(-9, 0, 15, 9, 0.1); p.shadow(9, 0, 15, 9, 0.1);
    const A = -9.2, B = 9.2, HA = 9, HB = 2.7;
    stack(p, A, HA);
    stack(p, B, HB);
    // the slip in flight: lifts, arcs over, settles, then rests as the new top of the pile
    const s = ease(clamp((u - 0.06) / 0.7));
    const cx = A + (B - A) * s, z = HA + (HB - HA) * s + Math.sin(s * Math.PI) * 9 + 0.12;
    if (s > 0.01 && s < 0.995) p.guide([[cx, 0, z], [cx, 0, cx > 2 ? HB : cx < -2 ? HA : 0]]);
    p.push();
    p.rotate("y", Math.sin(s * Math.PI) * 0.32, [cx, 0, z]);
    p.rotate("x", Math.sin(s * Math.PI * 2) * 0.12, [cx, 0, z]);
    p.face([[cx - HW, -HD, z], [cx + HW, -HD, z], [cx + HW, HD, z], [cx - HW, HD, z]], 0.24, SH.edge, 0.6);
    print(p, cx, z + 0.03);
    p.pop();
  },
};
