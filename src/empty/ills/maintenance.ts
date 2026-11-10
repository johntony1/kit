// Down for maintenance: a big monitor with a gear turning on its screen over a progress bar that fills and starts again; a striped barrier stands in front.
import { easeInOut, type Illustration, type V3 } from "../dots";

const P = 6; // seconds per loop
type P2 = [number, number];
/** clip a polygon (in x,z) to a rectangle */
const clipRect = (poly: P2[], x0: number, x1: number, z0: number, z1: number): P2[] => {
  const edge = (pts: P2[], inside: (q: P2) => boolean, cut: (a: P2, b: P2) => P2) => {
    const out: P2[] = [];
    pts.forEach((b, i) => {
      const a = pts[(i + pts.length - 1) % pts.length];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); }
      else if (inside(a)) out.push(cut(a, b));
    });
    return out;
  };
  const atX = (x: number) => (a: P2, b: P2): P2 => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])];
  const atZ = (z: number) => (a: P2, b: P2): P2 => [a[0] + ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]), z];
  let r = edge(poly, (q) => q[0] >= x0, atX(x0));
  r = edge(r, (q) => q[0] <= x1, atX(x1));
  r = edge(r, (q) => q[1] >= z0, atZ(z0));
  return edge(r, (q) => q[1] <= z1, atZ(z1));
};
const MW = 13, MZ = 7, MH = 18, MD = 3; // the monitor: half width, bottom, height, depth (front at y = 0)

export const maintenance: Illustration = {
  k: "maintenance", name: "Maintenance", title: "Down for maintenance", body: "We're tuning a few things behind the scenes. Please check back soon.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(1, -1, -15);
    p.shadow(0, 2, 30, 14, 0.11);
    p.rotate("z", -0.38); // turned a little so its screen faces us
    // the stand: a lit foot and a neck
    p.box(-6, -5, 0, 12, 7, 1.2, { edge: 0 });
    p.box(-1.6, -3, 1.2, 3.2, 2, MZ - 1.2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the monitor: a lit top, a dense bezel, a sparse end
    p.box(-MW, -MD, MZ, MW * 2, MD, MH, { top: 0.22, left: 0.13, right: 0.065, edge: 0 });
    // the screen: dark glass inside the bezel
    const f = 0.03, z0 = MZ + 1.6, z1 = MZ + MH - 1.6, x0 = -MW + 1.6, x1 = MW - 1.6;
    p.clear([[x0, f, z0], [x1, f, z0], [x1, f, z1], [x0, f, z1]]);
    // a big gear turning on the screen, lit, with its hub cut out
    const gc: V3 = [0, f + 0.02, MZ + MH / 2 + 2];
    const turn = u * (Math.PI * 2) / 4; // a quarter turn per loop: two teeth, so it repeats seamlessly
    const N = 8, ro = 5.6, ri = 4.2;
    const gear: V3[] = [];
    for (let i = 0; i < N * 4; i++) {
      const a = turn + (i / (N * 4)) * Math.PI * 2, r = i % 4 < 2 ? ro : ri;
      gear.push([gc[0] + Math.cos(a) * r, gc[1], gc[2] + Math.sin(a) * r]);
    }
    p.face(gear, 0.3, 0);
    p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [gc[0] + Math.cos(a) * 1.9, gc[1] + 0.01, gc[2] + Math.sin(a) * 1.9] as V3; }));
    // a progress bar under it: a sparse track that fills, then starts again
    const bz = z0 + 1.8, bx0 = -7, bx1 = 7;
    p.face([[bx0, f + 0.02, bz], [bx1, f + 0.02, bz], [bx1, f + 0.02, bz + 1.6], [bx0, f + 0.02, bz + 1.6]], 0.065, 0);
    const k = easeInOut(Math.min(1, u / 0.85)) * (u < 0.94 ? 1 : 0);
    if (k > 0.02) p.face([[bx0, f + 0.04, bz], [bx0 + (bx1 - bx0) * k, f + 0.04, bz], [bx0 + (bx1 - bx0) * k, f + 0.04, bz + 1.6], [bx0, f + 0.04, bz + 1.6]], 0.3, 0);
    // a striped barrier standing in front: two legs and a plank with bold diagonal stripes
    const bx = -18, bw = 13, by = 8;
    for (const x of [bx + 1.5, bx + bw - 1.5]) p.box(x - 0.8, by - 1, 0, 1.6, 1.6, 11, { top: 0.22, left: 0.13, right: 0.065, edge: 0 });
    p.box(bx, by + 0.6, 6, bw, 1, 4.6, { top: 0.22, left: 0.02, right: 0.065, edge: 0 });
    const w = 2.2, sk = 3, zb = 6, zt = 10.6;
    for (let x = bx; x < bx + bw + sk; x += w * 2) {
      const band = clipRect([[x, zb], [x + w, zb], [x + w - sk, zt], [x - sk, zt]], bx, bx + bw, zb, zt);
      if (band.length > 2) p.face(band.map(([xx, z]) => [xx, by + 1.63, z] as V3), 0.3, 0);
    }
  },
};
