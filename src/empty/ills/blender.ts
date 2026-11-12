// Blender: a tall clear jug on a square base, with a lid and a handle. The liquid in it rises and falls.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.8, Z0 = 8.6, Z1 = 31; // seconds per loop, the jug's bottom and top
const rad = (z: number) => 4.6 + 2.4 * ((z - Z0) / (Z1 - Z0)); // the jug widens toward the top
// a point in the plane that faces us: u to the right, at height z
const F = (u: number, z: number): V3 => [u * 0.707, -u * 0.707, z];

// a bright stroke through points in space: the glass and the handle
function stroke(p: Pen, pts: V3[], w: number) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}

export const blender: Illustration = {
  k: "blender", name: "Blender", title: "No blends yet", body: "Mix your first blend and it will be saved here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = Math.sin(((t / P) % 1) * Math.PI * 2);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 15, 5, 0.1);
    // seen more from the side than from above, so the jug stands tall
    p.rotate("z", -Math.PI / 4); p.rotate("x", 0.33); p.rotate("z", Math.PI / 4);
    // the base: a square block with a dial and two buttons, and the collar the jug sits in
    p.box(-8.5, -8.5, 0, 17, 17, 7, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
    p.dot([-3.4, 8.55, 3.5], 1.9, 0);
    p.dot([2.6, 8.55, 3.5], 1, 0);
    p.dot([5.6, 8.55, 3.5], 1, 0);
    p.cylinder(0, 0, 7, 5.6, 1.6, { side: 0.1, top: 0.12, edge: 0 });
    // the liquid: filled to a level that rises and falls
    const zl = Z0 + 11.5 + 1.3 * w;
    for (let z = Z0; z < zl; z += 0.4) p.disc(0, 0, z, rad(z) - 0.3, 0.2);
    p.disc(0, 0, zl, rad(zl) - 0.3, 0.3);
    p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * (rad(zl) - 0.3), Math.sin(a) * (rad(zl) - 0.3), zl] as V3; }), 1, 0.8);
    // the clear jug above it: two bright sides and two measure marks
    for (const s of [-1, 1]) stroke(p, [F(s * rad(Z0), Z0), F(s * rad(Z1), Z1)], 1.8);
    for (const z of [Z0 + 16, Z0 + 19.5]) stroke(p, [F(-rad(z), z), F(-rad(z) + 3, z)], 1.2);
    // the handle
    stroke(p, [F(rad(29), 29), F(rad(29) + 7, 28.5), F(rad(29) + 7, 19.5), F(rad(18), 18)], 2.4);
    // the lid and its knob
    p.cylinder(0, 0, Z1, rad(Z1) + 0.7, 1.8, { side: 0.2, top: 0.3, edge: 0 });
    p.cylinder(0, 0, Z1 + 1.8, 2.6, 2, { side: 0.2, top: 0.3, edge: 0 });
  },
};
