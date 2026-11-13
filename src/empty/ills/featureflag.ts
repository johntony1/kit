// No flags yet: a flag on a pole planted in a toggle switch lying on the floor, its knob on the off side and the pennant at half mast. Hover and the knob slides to on, the track lights up behind it and the flag runs up to the top.
import { easeInOut, type Illustration, type V3 } from "../dots";


// a pill in the floor plane, centred on the origin
const pill = (L: number, R: number, z: number): V3[] => {
  const o: V3[] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; o.push([L + Math.cos(a) * R, Math.sin(a) * R, z]); }
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; o.push([-L + Math.cos(a) * R, Math.sin(a) * R, z]); }
  return o;
};

export const featureflag: Illustration = {
  k: "featureflag", name: "Feature flag", title: "No flags yet", body: "Add a flag to switch a feature on or off without shipping new code.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.25));
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 12, 0.12);
    p.rotate("z", -0.55);
    // the switch body: a thick pill lying down, its dark track and the lit part behind the knob
    for (let z = 0; z < 4; z += 0.4) p.face(pill(9, 8, z), 0.1, 0);
    p.face(pill(9, 8, 4), 0.2, 0);
    p.clear(pill(9, 5.6, 4.05));
    const kx = -9 + 18 * k;
    if (k > 0.02) p.face(pill((kx + 9) / 2, 4, 4.1).map(([x, y, z]) => [x + (kx - 9) / 2, y, z] as V3), 0.3, 0);
    // the knob, and the pole standing in it
    p.cylinder(kx, 0, 4, 5.4, 3.2, { side: 0.12, top: 0.42, edge: 0 });
    p.box(kx - 1, -1, 7.2, 2, 2, 31, { top: 0.3, left: 0.26, right: 0.12, edge: 0 });
    p.dot([kx, 0, 39], 1.8, 1);
    // the pennant, facing us, run up the pole
    const z = 26 + 12 * k + h * Math.sin(t * 3) * 0.3, f = h * Math.sin(t * 4) * 0.8;
    const pen: V3[] = [[kx + 1, 0, z - 16], [kx + 1, 0, z], [kx + 24, 0, z - 8 + f]];
    p.face(pen.map(([x, , zz]) => [x, -1.6, zz] as V3), 0.12, 0);
    p.face(pen.map(([x, , zz]) => [x, 1.1, zz] as V3), 0.42, 0);
    p.line([[kx + 5, 0.95, z - 12.5], [kx + 5, 0.95, z - 3.5]], 1, 1);
  },
};
