// No deliveries yet: a quadcopter hovering over a landing pad with a parcel slung under it, its props spinning as it bobs.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per bob
const A = 10.5; // arm length, centre to motor

function rotor(p: Pen, x: number, y: number, z: number, a: number) {
  // the dashed sweep of the blades, then the motor and the blades over it
  p.guide(Array.from({ length: 33 }, (_, i) => { const u = (i / 32) * Math.PI * 2; return [x + Math.cos(u) * 4, y + Math.sin(u) * 4, z + 1.9] as V3; }));
  // in dots, a faint disc where the blades blur
  if (!p.ink) p.disc(x, y, z + 1.85, 4, 0.06);
  p.cylinder(x, y, z, 1.3, 1.6, { side: 0.12, top: 0.2 });
  const c = Math.cos(a), s = Math.sin(a), w = 0.85, L = 3.9;
  p.face([[x + c * L - s * w, y + s * L + c * w, z + 1.9], [x + c * L + s * w, y + s * L - c * w, z + 1.9], [x - c * L + s * w, y - s * L - c * w, z + 1.9], [x - c * L - s * w, y - s * L + c * w, z + 1.9]], 0.26, SH.edge, 0.4);
  p.dot([x, y, z + 2], 0.45, 0.04);
}

export const drone: Illustration = {
  k: "drone", name: "Drone", title: "No deliveries yet", body: "When a delivery is on its way, you can follow it from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const z = 19 + Math.sin(u * Math.PI * 2) * 1.3; // the body's floor
    const spin = u * Math.PI * 2 * 5; // whole turns per loop, so it repeats cleanly
    p.translate(0, 0, -15);
    p.shadow(0, 0, 18 - (z - 19) * 1.2, 9, 0.12);
    // the landing pad: a lit square with a ring and an H
    p.box(-7, -7, 0, 14, 14, 0.8, { top: SH.top, left: 0.12, right: SH.right });
    const ring: V3[] = Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * 5, Math.sin(a) * 5, 0.82] as V3; });
    p.line(ring, SH.edge, 0.6);
    p.line([[-2, -2.4, 0.84], [-2, 2.4, 0.84]], SH.edge, 0.9);
    p.line([[2, -2.4, 0.84], [2, 2.4, 0.84]], SH.edge, 0.9);
    p.line([[-2, 0, 0.84], [2, 0, 0.84]], SH.edge, 0.9);
    // dashed drop lines from the parcel down to the pad
    const zb = z - 10.2; // the parcel's bottom
    for (const [x, y] of [[-3, 3], [3, 3], [3, -3]]) p.guide([[x, y, zb], [x, y, 0.9]]);
    // the parcel, slung under the body on two straps
    p.box(-3, -3, zb, 6, 6, 5.2, { top: SH.top, left: 0.13, right: SH.right });
    p.line([[-3, 0, zb + 5.22], [3, 0, zb + 5.22]], SH.edge, 0.9);
    p.line([[0, 3.02, zb + 5.2], [0, 3.02, zb + 0.4]], SH.edge, 0.9);
    p.face([[-2.4, 3.04, zb + 0.9], [-0.8, 3.04, zb + 0.9], [-0.8, 3.04, zb + 2.4], [-2.4, 3.04, zb + 2.4]], 0.26, SH.edge, 0.4);
    for (const x of [-2.2, 2.2]) p.box(x - 0.4, -0.4, zb + 5.2, 0.8, 0.8, z - zb - 5.2, { top: 0.2, left: 0.2, right: 0.1 });
    // back rotors first, then the arms and body, then the near rotors
    rotor(p, -A, 0, z + 1, spin);
    rotor(p, 0, -A, z + 1, -spin + 0.8);
    p.box(-A, -0.7, z + 0.6, A * 2, 1.4, 1.1, { top: 0.2, left: 0.13, right: SH.right });
    p.box(-0.7, -A, z + 0.6, 1.4, A * 2, 1.1, { top: 0.2, left: 0.13, right: SH.right });
    p.box(-4, -4, z, 8, 8, 2.6, { top: SH.top, left: 0.12, right: SH.right });
    p.box(-2.6, -2.6, z + 2.6, 5.2, 5.2, 1, { top: 0.26, left: 0.16, right: 0.08 });
    p.dot([3.2, 4.02, z + 1.3], 0.55, Math.sin(u * Math.PI * 4) > 0 ? 1 : 0.04); // a blinking status light
    rotor(p, 0, A, z + 1, -spin + 2.1);
    rotor(p, A, 0, z + 1, spin + 1.4);
  },
};
