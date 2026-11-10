// No certificates: an open scroll between its two rolls, a wax seal hanging beside it. Hover and the scroll opens wider as the seal swoops in and stamps down.
import { type Illustration, type Pen, type V3 } from "../dots";

const D = 8; // half depth of the paper (y)
const R = 2.4; // roll radius
const SX = 3, SY = 3.4; // where the seal lands on the paper

/** a paper roll lying along y at x, resting on the floor */
function roll(p: Pen, x: number) {
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, m = (a0 + a1) / 2;
    if (Math.cos(m) + Math.sin(m) < -0.05) continue;
    const at = (a: number, y: number): V3 => [x + Math.cos(a) * R, y, R + Math.sin(a) * R];
    const f = Math.sin(m) > 0.45 ? 0.24 : Math.sin(m) > -0.35 ? 0.12 : 0.065;
    p.face([at(a0, -D - 0.6), at(a1, -D - 0.6), at(a1, D + 0.6), at(a0, D + 0.6)], f, 0);
  }
  // the end: the paper curls in a spiral
  p.ringV("y", [x, D + 0.6, R], R, 0.2, 1, 0.5);
  p.line(Array.from({ length: 16 }, (_, i) => { const a = i * 0.7, r = 0.3 + i * 0.12; return [x + Math.cos(a) * r, D + 0.62, R + Math.sin(a) * r] as V3; }), 1, 0.45);
}

export const certificate: Illustration = {
  k: "certificate", name: "Certificate", title: "No certificates yet", body: "Finish a course and your certificate will be waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const s = 11 + h * 2.2; // half width of the open paper
    // the seal: hangs high at rest, stamps down on hover with a little bounce
    const fall = Math.min(1, h * 1.35);
    const bounce = fall >= 1 ? 0 : Math.sin(fall * Math.PI) * 0.15;
    const air = 1 - fall * fall; // 1 while it hangs, 0 once it lands
    const zs = 0.3 + air * 10 + bounce * 2;
    const ox = 6 * air, oy = -8 * air; // it hangs off to the side, and swoops in
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 15, 0.12);
    // the paper, flat on the floor
    const z = 0.25;
    p.face([[-s, -D, z], [s, -D, z], [s, D, z], [-s, D, z]], 0.2, 1);
    // the title, the body lines and a signature
    p.line([[-6, -5.2, z], [6, -5.2, z]], 1, 0.9);
    p.line([[-4, -3.2, z], [4, -3.2, z]], 1, 0.55);
    for (let i = 0; i < 3; i++) p.line([[-7, -0.8 + i * 1.6, z], [i === 2 ? 0 : 7, -0.8 + i * 1.6, z]], 1, 0.5);
    p.line(Array.from({ length: 12 }, (_, i) => [-7 + i * 0.5, 5.2 + Math.sin(i * 1.3) * 0.5, z] as V3), 1, 0.55);
    p.line([[-7.5, 6.3, z], [-1, 6.3, z]], 1, 0.45);
    // where the seal will land: a dashed ring, and the drop lines
    const ring = (r: number, zz: number) => Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [SX + Math.cos(a) * r, SY + Math.sin(a) * r, zz] as V3; });
    if (zs > 1) {
      p.guide(ring(3.2, z), true);
      const k = Math.SQRT1_2 * 3.2;
      p.guide([[SX + k, SY - k, z], [SX + k + ox, SY - k + oy, zs]]);
      p.guide([[SX - k, SY + k, z], [SX - k + ox, SY + k + oy, zs]]);
    }
    roll(p, -s);
    // the seal: two ribbon tails, then a fat wax disc with a star pressed in
    p.push(); p.translate(SX + ox, SY + oy, zs);
    const sq = 1 - bounce * 0.6;
    p.face([[-0.8, 1, 0.1], [0.6, 1.4, 0.1], [-0.4, 5.6, 0.1], [-1.6, 5.4, 0.1]], 0.13, 1);
    p.face([[0.6, 0.8, 0.1], [1.8, 0.2, 0.1], [4.4, 4.2, 0.1], [3.2, 4.8, 0.1]], 0.13, 1);
    p.cylinder(0, 0, 0, 3.2, 1.3 * sq, { top: 0.34, side: 0.3 });
    const zt = 1.32 * sq;
    p.line(Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, r = i % 2 ? 0.9 : 2; return [Math.cos(a) * r, Math.sin(a) * r, zt] as V3; }), 1, 0.55);
    p.pop();
    roll(p, s);
    // the stamp lands: a ring of specks
    if (fall >= 1 && h < 0.98) for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r = 4 + (h - 0.74) * 12;
      p.dot([SX + Math.cos(a) * r, SY + Math.sin(a) * r, 0.6], 0.55, 1);
    }
  },
};
