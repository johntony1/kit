// No prescriptions: a pill bottle with a labelled front and a ridged cap. Hover and the cap lifts off and two capsules jump out and land beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 8.4, HB = 17; // the bottle's radius and height
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const surf = (a: number, z: number, r = R + 0.05): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
const run = (a0: number, a1: number, z: number, r?: number): V3[] => Array.from({ length: 13 }, (_, i) => surf(a0 + ((a1 - a0) * i) / 12, z, r));

/** a two tone capsule, flat to the viewer, turned by ang */
function capsule(p: Pen, c: V3, ang: number) {
  const L = 2.6, r = 1.9, co = Math.cos(ang), si = Math.sin(ang);
  const f = (u: number, v: number): V3 => { const U = u * co - v * si, V = u * si + v * co; return [c[0] + 0.5774 * U, c[1] - 0.5774 * U, c[2] + V]; };
  const cap = (sx: number): V3[] => [f(0, -r * sx), ...Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI; return f(sx * (L + Math.cos(a) * r), sx * Math.sin(a) * r); }), f(0, r * sx)];
  p.face(cap(-1), 0.1, SH.edge, 0.5);
  p.face(cap(1), 0.36, SH.edge, 0.5);
}

export const prescription: Illustration = {
  k: "prescription", name: "Prescription", title: "No prescriptions", body: "Prescriptions from your doctor will be listed here, ready to refill.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, -2, -12);
    p.scale(1.1);
    p.shadow(1, 1, 22, 11, 0.12);
    // the bottle and its neck
    p.cylinder(0, 0, 0, R, HB, { side: 0.11, top: 0.2 });
    p.cylinder(0, 0, HB, 6.6, 1.6, { side: 0.1, top: 0.03 });
    // the label: a pale wrap with a printed cross and two lines
    p.face([...run(-0.55, 2.1, 3.4), ...run(2.1, -0.55, 13.6)], 0.34, SH.edge, 0.5);
    p.line(run(0.1, 0.75, 8.6, R + 0.1), 0, 1.3);
    p.line([surf(0.425, 6.2, R + 0.1), surf(0.425, 11, R + 0.1)], 0, 1.3);
    p.line(run(1.1, 1.85, 10.4, R + 0.1), 0, 0.7);
    p.line(run(1.1, 1.6, 7.6, R + 0.1), 0, 0.7);
    // the cap: lifts and tips on hover
    const e = ease(clamp(h / 0.5));
    p.push();
    p.translate(-3 * e, -3 * e, 9 * e + h * Math.sin(t * 2.2) * 0.5);
    p.rotate("y", -0.3 * e, [0, 0, HB + 3]);
    const zc = HB + 0.9;
    p.cylinder(0, 0, zc, R + 0.6, 5, { side: 0.14, top: 0.24 });
    for (let a = -0.6; a < 2.3; a += 0.29) p.line([surf(a, zc + 0.7, R + 0.65), surf(a, zc + 4.3, R + 0.65)], 0.7, 0.4);
    p.pop();
    // the capsules: out of the neck in an arc, down to the floor
    ([[15, 2, 0.5, 0.22], [3, 15.5, -0.35, 0.36]] as const).forEach(([ex, ey, ang, start]) => {
      const q = clamp((h - start) / 0.6);
      if (q <= 0) return;
      const land = q < 0.8 ? q / 0.8 : 1, hop = q < 0.8 ? 0 : Math.sin(((q - 0.8) / 0.2) * Math.PI) * 1.4;
      const z = (HB + 2) * (1 - land) + 1.9 + 13 * 4 * land * (1 - land) * (1 - land * 0.5) + hop;
      capsule(p, [ex * land, ey * land, z], ang + (1 - land) * 3);
    });
  },
};
