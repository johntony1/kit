// Store closed: a little shop with a striped awning, its window dark and a closed sign swaying on the door.
import { SH, type Illustration, type V3 } from "../dots";

const X = 13, Y = 3.5, H = 25; // half width, half depth, height of the shop
const F = Y + 0.03; // just in front of the shop's front wall (+y)

export const store: Illustration = {
  k: "store", name: "Storefront", title: "Store closed", body: "The shop is not open right now. Check back soon to see what is on the shelves.",
  kind: "loop", period: 3.6, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const sw = 0.22 * Math.sin((Math.PI * 2 * t) / 3.6);
    p.translate(-2.5, -2.5, -13.5);
    p.shadow(0, 2, 26, 13, 0.12);
    // the building
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.21, left: SH.right, right: 0.12 });
    // the name board across the top of the front
    p.face([[-10, F, 20], [10, F, 20], [10, F, 23.6], [-10, F, 23.6]], 0.3, 0);
    p.line([[-7.6, F + 0.03, 21.8], [-1.4, F + 0.03, 21.8]], SH.edge, 1);
    p.line([[1, F + 0.03, 21.8], [7.6, F + 0.03, 21.8]], SH.edge, 1);
    // the window: dark glass, lights off, a frame bar and a glare
    p.face([[-11.8, F, 2.6], [-0.8, F, 2.6], [-0.8, F, 12.8], [-11.8, F, 12.8]], 0.26, 0);
    p.clear([[-11, F + 0.01, 3.4], [-1.6, F + 0.01, 3.4], [-1.6, F + 0.01, 12], [-11, F + 0.01, 12]]);
    p.face([[-6.6, F + 0.02, 3.4], [-6, F + 0.02, 3.4], [-6, F + 0.02, 12.4], [-6.6, F + 0.02, 12.4]], 0.24, 0);
    p.face([[-10.2, F + 0.02, 7], [-9.6, F + 0.02, 7], [-8, F + 0.02, 10.6], [-8.6, F + 0.02, 10.6]], 0.2, 0);
    p.face([[-4.8, F + 0.02, 5.2], [-4.2, F + 0.02, 5.2], [-2.6, F + 0.02, 8.8], [-3.2, F + 0.02, 8.8]], 0.2, 0);
    // a sill under the window
    p.box(-11.5, Y, 2.4, 10.4, 1.2, 1, { top: 0.24, left: 0.13, right: 0.065 });
    // the door: dark and shut, with a lit handle
    p.face([[1, F, 0], [10, F, 0], [10, F, 12.6], [1, F, 12.6]], 0.26, 0);
    p.clear([[1.6, F + 0.01, 0], [9.4, F + 0.01, 0], [9.4, F + 0.01, 12], [1.6, F + 0.01, 12]]);
    p.face([[2.2, F + 0.02, 0], [8.8, F + 0.02, 0], [8.8, F + 0.02, 11.4], [2.2, F + 0.02, 11.4]], 0.12, 0);
    p.face([[2.6, F + 0.04, 5.2], [3.4, F + 0.04, 5.2], [3.4, F + 0.04, 7], [2.6, F + 0.04, 7]], 0.4, 0);
    // the closed sign, hanging from a nail on two strings, swaying
    const nx = 5.5, nz = 11;
    p.push();
    p.rotate("y", sw, [nx, F, nz]);
    const sy = F + 0.25;
    p.face([[nx - 0.3, sy, nz], [nx + 0.3, sy, nz], [nx - 2.9, sy, nz - 2.6], [nx - 3.5, sy, nz - 2.6]], 0.3, 0);
    p.face([[nx - 0.3, sy, nz], [nx + 0.3, sy, nz], [nx + 3.5, sy, nz - 2.6], [nx + 2.9, sy, nz - 2.6]], 0.3, 0);
    p.face([[nx - 4.2, sy, nz - 2.5], [nx + 4.2, sy, nz - 2.5], [nx + 4.2, sy, nz - 7.3], [nx - 4.2, sy, nz - 7.3]], 0.3, 0);
    p.line([[nx - 3, sy + 0.04, nz - 4.3], [nx + 3, sy + 0.04, nz - 4.3]], SH.edge, 0.9);
    p.line([[nx - 3, sy + 0.04, nz - 5.9], [nx + 0.8, sy + 0.04, nz - 5.9]], SH.edge, 0.6);
    p.pop();
    p.dot([nx, F + 0.4, nz], 0.6, 1);
    // the awning: a lit slope out from the wall, then a striped valance with a scalloped hem
    const z0 = 18.4, z1 = 16.6, y1 = Y + 2.6, zh = z1 - 3.2, xs = -X + 0.4, xe = X - 0.4, N = 9, w = (xe - xs) / N;
    p.face([[xs, F, z0], [xe, F, z0], [xe, y1, z1], [xs, y1, z1]], 0.26, 0);
    p.line([[xs, F + 0.05, z0 + 0.1], [xe, F + 0.05, z0 + 0.1]], SH.edge, 0.6);
    for (let i = 0; i < N; i++) {
      const a = xs + i * w, b = a + w, lit = i % 2 === 0;
      const hem: V3[] = [[a, y1, z1], [b, y1, z1], ...Array.from({ length: 9 }, (_, j) => { const u = (Math.PI * j) / 8; return [a + w / 2 + (Math.cos(u) * w) / 2, y1, zh - Math.sin(u) * 1.3] as V3; })];
      p.face(hem, lit ? 0.27 : 0.02, 0);
    }
    p.face([[xe, F, z0], [xe, y1, z1], [xe, y1, zh], [xe, F, zh + 1]], SH.right, 0); // its end
    p.line([[xs, y1, z1], [xe, y1, z1]], SH.edge, 0.55); // the fold
    // a step in front of the door
    p.box(0.6, Y, 0, 9.8, 2.4, 0.9, { top: 0.24, left: 0.12, right: 0.065 });
  },
};
