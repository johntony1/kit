// Cache is empty: a stack of platters. The top one floats free and spins, a lightning bolt on its face.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 2.4;
const R = 12, H = 3.4, GAP = 1.3; // platter radius, thickness, gap

/** a platter: its side lit on the +y half and in shade on the +x half, notches cut round the rim */
function platter(p: Pen, z: number, top: number, spin = 0) {
  const N = 12;
  const arc = (zz: number, a0: number, a1: number) => Array.from({ length: N + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / N;
    return [Math.cos(a) * R, Math.sin(a) * R, zz] as V3;
  });
  const side = (a0: number, a1: number, fill: number) => p.face([...arc(z, a0, a1), ...arc(z + H, a0, a1).reverse()], fill, 0);
  side(-Math.PI / 4, Math.PI / 4, SH.right);
  side(Math.PI / 4, (3 * Math.PI) / 4, SH.left);
  p.disc(0, 0, z + H, R, top, SH.edge);
  // notches on the rim that travel round as it spins
  for (let i = 0; i < 10; i++) {
    const a = spin + (i / 10) * Math.PI * 2, w = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (w < Math.PI / 4 + 0.15 || w > (3 * Math.PI) / 4 - 0.15) continue;
    p.line([[Math.cos(w) * R * 1.003, Math.sin(w) * R * 1.003, z + 0.7], [Math.cos(w) * R * 1.003, Math.sin(w) * R * 1.003, z + H - 0.7]], SH.edge, 0.8);
  }
}

export const cache: Illustration = {
  k: "cache", name: "Cache stack", title: "Cache is empty", body: "Nothing has been cached yet. Responses will be stored here after the first request.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const spin = u * Math.PI * 2; // one turn per loop
    const lift = 7.5 + Math.sin(u * Math.PI * 2) * 0.8;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 25, 12.5, 0.12);
    for (let i = 0; i < 3; i++) platter(p, i * (H + GAP), SH.top);
    const zt = 3 * (H + GAP) + lift - GAP;
    // drop lines from the floating platter to the stack
    const zs = 3 * (H + GAP) - GAP;
    for (const a of [Math.PI * 0.75, -Math.PI * 0.25]) p.guide([[Math.cos(a) * R, Math.sin(a) * R, zt], [Math.cos(a) * R, Math.sin(a) * R, zs]]);
    platter(p, zt, SH.right, spin);
    // the bolt on its face, turning with it
    p.push(); p.rotate("z", spin, [0, 0, 0]);
    const z = zt + H + 0.03;
    const bolt: V3[] = [[-5.5, 1.2, z], [0.8, 3.4, z], [-0.2, 0.6, z], [5.5, -1.2, z], [-0.8, -3.4, z], [0.2, -0.6, z]];
    p.face(bolt, 0.32, SH.edge, 0.6);
    p.pop();
    // sparks flung off the rim
    for (let i = 0; i < 3; i++) {
      const v = (u * 2 + i / 3) % 1, a = spin + i * 2.1 + v * 0.8, r = R + 1.5 + v * 5;
      if (v < 0.75) p.dot([Math.cos(a) * r, Math.sin(a) * r, zt + H / 2 + v * 2], 0.9, 1);
    }
  },
};
