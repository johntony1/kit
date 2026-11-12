// Skateboard: a skateboard standing on its four wheels. Hover and it pops an ollie: the nose kicks up, the board leaves the ground and hangs in the air.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const L = 21, W = 5.4, Z0 = 5.2; // half length, half width, deck height
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const half = (x: number) => { const a = Math.abs(x); return a <= L - W ? W : W * Math.sqrt(Math.max(0, 1 - Math.pow((a - (L - W)) / W, 2))); };
const rise = (x: number) => { const a = Math.abs(x) - 13.5; return Z0 + (a > 0 ? a * a * 0.085 : 0); };
const XS = Array.from({ length: 85 }, (_, i) => -L + (i / 84) * L * 2);

function wheel(p: Pen, x: number, y: number, near: boolean, spin: number) {
  p.ringV("y", [x, y - 1.8, 2.5], 2.5, 0.08, 0);
  p.ringV("y", [x, y, 2.5], 2.5, near ? 0.34 : 0.16, 0);
  if (near) { p.dot([x, y + 0.03, 2.5], 0.8, 0); p.dot([x + Math.cos(spin) * 1.6, y + 0.03, 2.5 + Math.sin(spin) * 1.6], 0.35, 0); }
}

export const skateboard: Illustration = {
  k: "skateboard", name: "Skateboard", title: "No skate sessions yet", body: "Log a session and your spots, tricks and time on the board will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, -7 - 2 * e);
    p.scale(1.32);
    p.shadow(0, 0, 25 - 5 * e, 10 - 2 * e, 0.13 - 0.05 * e);
    p.translate(0, 0, 9 * e + h * Math.sin(t * 2.6) * 0.8);
    p.rotate("y", -(0.26 * e + h * Math.sin(t * 2.6 + 1) * 0.04), [0, 0, Z0]);
    const spin = h * t * 6;
    // the far wheels, the trucks, the near wheels
    for (const x of [-11.5, 11.5]) wheel(p, x, -2.6, false, 0);
    for (const x of [-11.5, 11.5]) p.box(x - 1, -3.6, 1.8, 2, 7.2, Z0 - 2.6, { top: 0.1, left: 0.1, right: 0.06, edge: 0 });
    for (const x of [-11.5, 11.5]) wheel(p, x, 5, true, spin);
    // the deck: its near edge, then the top, kicked up at both ends
    const near: V3[] = XS.map((x) => [x, half(x), rise(x)] as V3), far: V3[] = XS.map((x) => [x, -half(x), rise(x)] as V3);
    p.face([...near, ...near.slice().reverse().map(([x, y, z]) => [x, y, z - 1.1] as V3)], 0.11, 0);
    p.face([...near, ...far.slice().reverse()], 0.22, 0);
    p.line([...near, ...far.slice().reverse(), near[0]], SH.edge, 0.5);
    // the bolts over each truck
    for (const x of [-11.5, 11.5]) for (const dx of [-1.3, 1.3]) for (const dy of [-1.5, 1.5]) p.dot([x + dx, dy, rise(x) + 0.03], 0.42, 0);
  },
};
