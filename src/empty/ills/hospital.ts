// Hospital: a hospital with a tall middle block, two wings and a cross sign on the roof. Hover and the sign rises on its post and lights up, and the entrance glows.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const plus = (cx: number, y: number, cz: number, a: number, b: number): V3[] =>
  ([[-b, a], [b, a], [b, b], [a, b], [a, -b], [b, -b], [b, -a], [-b, -a], [-b, -b], [-a, -b], [-a, b], [-b, b]] as [number, number][]).map(([u, v]) => [cx + u, y, cz + v] as V3);
const ST = { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 };
// windows: on a front face (y fixed) or on a right face (x fixed)
const winF = (p: Pen, y: number, x: number, z: number, w = 2.5, hh = 2.8) => p.clear([[x, y, z], [x + w, y, z], [x + w, y, z + hh], [x, y, z + hh]]);
const winR = (p: Pen, x: number, y: number, z: number, w = 2.5, hh = 2.8) => p.clear([[x, y, z], [x, y + w, z], [x, y + w, z + hh], [x, y, z + hh]]);

export const hospital: Illustration = {
  k: "hospital", name: "Hospital", title: "No clinics nearby", body: "No clinics were found in this area. Try a wider search.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h / 0.6)), g = clamp((h - 0.5) / 0.5);
    p.translate(0, 0, -19);
    p.shadow(0, 1, 32, 15, 0.1);
    p.rotate("z", -0.42);
    const HW = 13, HC = 25; // wing height, middle height
    // the left wing
    p.box(-20, -5, 0, 12, 10, HW, ST);
    for (const x of [-18.6, -15, -11.4]) for (const z of [3, 8]) winF(p, 5.03, x, z);
    // the middle block: a door under a canopy, three floors of windows
    p.box(-8, -6.5, 0, 16, 13, HC, ST);
    const door: V3[] = [[-2.5, 6.53, 0], [2.5, 6.53, 0], [2.5, 6.53, 6], [-2.5, 6.53, 6]];
    if (g > 0.3) p.face(door, 1, SH.edge, 0.5); else p.clear(door);
    p.line([[0, 6.56, 0], [0, 6.56, 6]], SH.edge, 0.5);
    p.box(-4, 6.5, 6.6, 8, 2.6, 0.8, { top: 0.28, left: 0.16, right: 0.08, lw: 0.5 });
    for (const x of [-6.2, -1.25, 3.7]) for (const z of [10, 14.8, 19.6]) winF(p, 6.53, x, z);
    for (const y of [-4.4, 1.6]) for (const z of [14.8, 19.6]) winR(p, 8.03, y, z);
    // the right wing
    p.box(8, -5, 0, 12, 10, HW, ST);
    for (const x of [9.6, 13.2, 16.8]) for (const z of [3, 8]) winF(p, 5.03, x, z, 2.4);
    for (const y of [-3.6, 1]) for (const z of [3, 8]) winR(p, 20.03, y, z);
    // the cross sign on the roof: rises on its post and lights up
    const zs = HC + 6 + 4 * k;
    p.box(-0.6, -0.6, HC, 1.2, 1.2, zs - HC - 3, { top: 0.2, left: 0.24, right: 0.1, edge: 0 });
    p.face(plus(0, -1.4, zs, 4.8, 1.7), 0.08, 0);
    p.face(plus(0, 0, zs, 4.8, 1.7), 0.34 + 0.66 * g, SH.edge, 0.6);
    if (g > 0) {
      const [x, y] = p.pt([0, 0, zs]), r = 7.5 + 0.8 * Math.sin(t * 3);
      p.screen((c) => {
        c.strokeStyle = `rgba(255,255,255,${g})`; c.lineWidth = 0.8; c.lineCap = "round";
        for (const a of [-2.6, -2.05, -1.1, -0.55, 0.55, 2.6]) { c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a) * (r + 2.6), y + Math.sin(a) * (r + 2.6)); c.stroke(); }
      });
    }
  },
};
