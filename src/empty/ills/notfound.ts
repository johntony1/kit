// Page not found: a chunky 4 0 4. The 0 rocks, tips over onto its face with a bump, lies there a moment, then stands back up.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const W = 10, H = 16, T = 3.4, D = 4, C = 2.4; // glyph width, height, stroke, depth, corner chamfer
const GAP = 2.6;
const PERIOD = 5.2;
const R = (x0: number, z0: number, x1: number, z1: number): P2[] => [[x0 - 0.04, z0 - 0.04], [x1 + 0.04, z0 - 0.04], [x1 + 0.04, z1 + 0.04], [x0 - 0.04, z1 + 0.04]];

// outlines in the x z plane, counter clockwise; holes run clockwise. caps: the front face in pieces
const FOUR = {
  loops: [[[5.2, 0], [8.6, 0], [8.6, 4.6], [W, 4.6], [W, 8], [8.6, 8], [8.6, H], [5.2, H], [5.2, 8], [T, 8], [T, H], [0, H], [0, 4.6], [5.2, 4.6]]] as P2[][],
  caps: [R(5.2, 0, 8.6, H), R(0, 4.6, W, 8), R(0, 8, T, H)],
};
const ZERO = {
  loops: [
    [[C, 0], [W - C, 0], [W, C], [W, H - C], [W - C, H], [C, H], [0, H - C], [0, C]],
    [[T, T], [T, H - T], [W - T, H - T], [W - T, T]],
  ] as P2[][],
  caps: [
    [[C, 0], [W - C, 0], [W, C], [W, T + 0.04], [0, T + 0.04], [0, C]],
    [[0, H - T - 0.04], [W, H - T - 0.04], [W, H - C], [W - C, H], [C, H], [0, H - C]],
    R(0, T, T, H - T), R(W - T, T, W, H - T),
  ] as P2[][],
};

/** screen winding of a face: < 0 when its outward side looks at us */
const wind = (p: Pen, f: V3[]) => {
  const q = f.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s;
};

/** a glyph pushed back from y=D/2 to y=-D/2. tilt: how far it has tipped back (for the wall tones) */
function glyph(p: Pen, g: { loops: P2[][]; caps: P2[][] }, tilt: number) {
  const y0 = -D / 2, y1 = D / 2, s = Math.sin(tilt), c = Math.cos(tilt);
  for (const out of g.loops) for (let i = 0; i < out.length; i++) {
    const a = out[i], b = out[(i + 1) % out.length];
    const f: V3[] = [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]];
    if (wind(p, f) > -0.01) continue;
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    const nx = dz / L, nz = -dx / L; // outward normal, then as the world sees it
    const wy = s * nz, wz = c * nz;
    p.face(f, wz > 0.5 ? 0.12 : Math.abs(wy) > 0.5 ? 0.1 : nx > 0.3 ? 0.06 : 0.09, 0);
  }
  // the front cap, or the back one once it has tipped far enough to show its back
  const fy = wind(p, g.loops[0].map(([x, z]) => [x, y1, z] as V3)) < 0 ? y1 : y0;
  for (const cap of g.caps) p.face(cap.map(([x, z]) => [x, fy, z] as V3), 0.24, 0);
}

export const notfound: Illustration = {
  k: "notfound", name: "404", title: "Error 404", body: "The page you are looking for has moved or never existed. Let's get you back on track.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    // the 0: a rock that grows, a fall onto its back, a bump, a rest, then up again
    let rock = 0, tip = 0;
    if (u > 0.1 && u < 0.36) { const k = (u - 0.1) / 0.26; rock = 0.13 * Math.sin(k * Math.PI * 5) * Math.sin(k * Math.PI * 0.5); }
    if (u >= 0.36 && u < 0.46) { const k = (u - 0.36) / 0.1; tip = (Math.PI / 2) * k * k; }
    else if (u >= 0.46 && u < 0.53) tip = Math.PI / 2 - 0.14 * Math.sin(((u - 0.46) / 0.07) * Math.PI);
    else if (u >= 0.53 && u < 0.78) tip = Math.PI / 2;
    else if (u >= 0.78 && u < 0.94) tip = (Math.PI / 2) * (1 - easeInOut((u - 0.78) / 0.16));
    if (u >= 0.94) { const k = (u - 0.94) / 0.06; rock = -0.05 * Math.sin(k * Math.PI * 2) * (1 - k); }

    p.translate(0, 0, -9);
    p.rotate("z", -0.5); // turn the word toward us so it reads
    const xs = [-W * 1.5 - GAP, -W / 2, W / 2 + GAP];
    // shadows first
    p.shadow(xs[0] + W / 2, 0, 11, 5.5, 0.1);
    p.shadow(xs[2] + W / 2, 0, 11, 5.5, 0.1);
    const lie = Math.sin(tip);
    p.shadow(0, lie * (H / 2), 10 + lie * 2, 5.5 + lie * 2, 0.1);

    const zero = () => {
      p.push(); p.translate(xs[1], 0, 0);
      if (rock) p.rotate("y", rock, [rock > 0 ? W - C : C, 0, 0]);
      if (tip) p.rotate("x", -tip, [0, D / 2, 0]);
      glyph(p, ZERO, tip);
      p.pop();
    };
    p.push(); p.translate(xs[0], 0, 0); glyph(p, FOUR, 0); p.pop();
    if (tip < 0.3) zero();

    // a puff of dust where it lands
    if (u > 0.45 && u < 0.62) {
      const k = (u - 0.45) / 0.17;
      for (let i = 0; i < 7; i++) {
        const x = -W / 2 - 1 + (i / 6) * (W + 2);
        const side = i % 2 ? 1 : -1;
        p.dot([x + side * k * 1.5, D / 2 + H + 1 + k * 3, 1 + k * 4 * (0.6 + (i % 3) * 0.2)], 0.75, 1 - k);
      }
    }

    p.push(); p.translate(xs[2], 0, 0); glyph(p, FOUR, 0); p.pop();
    if (tip >= 0.3) zero();
  },
};
