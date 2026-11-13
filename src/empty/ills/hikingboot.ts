// No trails yet: a hiking boot seen from the side, a chunky lugged sole and laces up to the ankle. Hover and it lifts and stomps down, a puff of dust kicking up round the sole.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const Y = 3.4; // half width of the boot
// side profiles (x along the foot, toe at +x; z up)
const SOLE: P2[] = [[-12.5, 0], [12.5, 0], [15.6, 2.2], [15.2, 4], [-12.8, 4], [-13.2, 1.6]];
const UPPER: P2[] = [[-12.6, 4], [15.2, 4], [15.2, 6.4], [13.2, 8.8], [9.4, 10.6], [5.4, 13.6], [2.4, 18.6], [1.6, 25.6], [-1.6, 26], [-3, 23.4], [-6.6, 24.4], [-11.4, 24], [-12.4, 18], [-13.2, 10]];

/** a side profile extruded across the boot: the walls we see, then the side looking at us */
function prism(p: Pen, pts: P2[], side: number, top: number, end: number) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  const walls: { d: number; q: V3[]; f: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const nx = (b[1] - a[1]) * sg, nz = -(b[0] - a[0]) * sg;
    if (nx + nz <= 0.02) continue;
    walls.push({ d: a[0] + b[0] + a[1] + b[1], f: nz > Math.abs(nx) * 0.8 ? top : end, q: [[a[0], -Y, a[1]], [b[0], -Y, b[1]], [b[0], Y, b[1]], [a[0], Y, a[1]]] });
  }
  walls.sort((u, v) => u.d - v.d).forEach((w) => p.face(w.q, w.f, 0));
  p.face(pts.map(([x, z]) => [x, Y, z] as V3), side, 0);
}

export const hikingboot: Illustration = {
  k: "hikingboot", name: "Hiking boot", title: "No trails yet", body: "Save a trail you want to walk and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // lift with the toe down, then stomp flat with a small bounce
    const up = seg(h, 0, 0.4), down = seg(h, 0.4, 0.6), b = seg(h, 0.6, 0.8);
    const lift = down > 0 ? 6 * (1 - down * down) + Math.sin(Math.PI * b) * 1 : 6 * Math.sin((up * Math.PI) / 2);
    const tilt = down > 0 ? 0.22 * (1 - down) : 0.22 * up;
    p.translate(-1, 0, -13);
    p.shadow(1, 0, 28, 12, 0.1);
    // dust kicked up round the sole once it lands
    const dust = seg(h, 0.55, 1);
    p.rotate("z", -0.7);
    p.push();
    p.translate(0, 0, lift);
    p.rotate("y", -tilt, [15, 0, 0]);
    // the sole: dark, with deep lugs cut along its side
    prism(p, SOLE, 0.13, 0.2, 0.05);
    for (let x = -11; x < 14; x += 2.6) p.line([[x, Y + 0.04, 0], [x, Y + 0.04, 1.8]], SH.edge, 1.1);
    p.line([[-12.6, Y + 0.04, 2.2], [15.4, Y + 0.04, 2.2]], SH.edge, 0.5);
    // the upper: a bright side, a lit lace slope, a toe cap and a heel patch cut in
    prism(p, UPPER, 0.24, 0.2, 0.065);
    const f = (x: number, z: number): V3 => [x, Y + 0.04, z];
    p.line([f(4.4, 4), f(6.2, 8), f(9.6, 10.4)], SH.edge, 0.8);
    p.line([f(-11.2, 22), f(-6.4, 22.4), f(-3, 21.4)], SH.edge, 0.7);
    p.line([f(-12.6, 4.1), f(15.2, 4.1)], SH.edge, 1.1);
    // laces: hooks up the front, crossed laces between them
    const hooks: V3[] = [[8.6, 0, 11.4], [5.9, 0, 14.4], [3.6, 0, 18], [2.4, 0, 21.4], [1.8, 0, 24.6]];
    hooks.forEach(([x, , z]) => p.dot([x - 0.6, Y + 0.05, z - 0.6], 0.9, 0));
    for (let i = 0; i < hooks.length - 1; i++) p.line([[hooks[i][0] + 0.5, -Y + 0.8, hooks[i][2] + 0.6], [hooks[i + 1][0] + 0.5, Y - 0.8, hooks[i + 1][2] + 0.6]], 1, 0.9);
    p.pop();
    if (dust > 0) for (let i = 0; i < 8; i++) {
      const s = i % 2 ? 1 : -1, u = (dust * 0.9 + (t * 0.5 + i / 8) % 1 * 0.3) % 1;
      const x = s > 0 ? 15 + u * 5 : -13 - u * 5, z = 0.5 + Math.sin(u * Math.PI) * (2 + (i % 3)), y = Y + 1 - (i % 4) * 2.6;
      p.dot([x, y, z], 0.9 * (1 - u * 0.5), 0.9 * Math.sin(Math.PI * Math.min(1, dust * 1.4)) * (1 - u) + 0.15);
    }
  },
};
