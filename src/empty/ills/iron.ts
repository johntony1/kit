// No wrinkles here: a steam iron on its bright soleplate, a pointed nose, a closed handle and a dial on top. Hover and it glides back and forth while puffs of steam rise from its nose.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
type P2 = [number, number];
const TH = -0.5, C = Math.cos(TH), S = Math.sin(TH); // turned so its side faces us
const qb = (a: P2, c: P2, b: P2, s: number): P2 => [(1 - s) ** 2 * a[0] + 2 * (1 - s) * s * c[0] + s * s * b[0], (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * c[1] + s * s * b[1]];
// the soleplate outline, counter clockwise: a square back and a pointed nose
const SOLE: P2[] = [[-11, -7.5], [2, -7.5]];
for (let i = 1; i <= 8; i++) SOLE.push(qb([2, -7.5], [11, -6.8], [15.5, 0], i / 8));
for (let i = 1; i <= 8; i++) SOLE.push(qb([15.5, 0], [11, 6.8], [2, 7.5], i / 8));
SOLE.push([-11, 7.5]);
const shrink = (k: number, cx: number): P2[] => SOLE.map(([x, y]) => [cx + (x - cx) * k, y * k]);
const at = (o: P2[], z: number): V3[] => o.map(([x, y]) => [x, y, z]);
const BRIGHT = { top: 0.3, left: 0.28, right: 0.13, edge: 0 };

export const iron: Illustration = {
  k: "iron", name: "Iron", title: "No wrinkles here", body: "Everything looks smooth. Anything that needs fixing will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h / 0.4));
    p.translate(-1, 0, -9);
    p.shadow(1, 0, 26, 12, 0.1);
    p.rotate("z", TH);
    p.translate(Math.sin(t * 3) * 1.6 * k, 0, 0);
    // the walls of a layer, between a lower and an upper outline, toned by which way they face
    const walls = (lo: P2[], z0: number, hi: P2[], z1: number, tone: (d: number) => number) => {
      for (let i = 0; i < lo.length; i++) {
        const j = (i + 1) % lo.length, nx = hi[j][1] - hi[i][1], ny = -(hi[j][0] - hi[i][0]);
        const wx = nx * C - ny * S, wy = nx * S + ny * C, l = Math.hypot(wx, wy) || 1;
        if (wx + wy <= 0) continue;
        p.face([[lo[i][0], lo[i][1], z0], [lo[j][0], lo[j][1], z0], [hi[j][0], hi[j][1], z1], [hi[i][0], hi[i][1], z1]], tone((wy - wx) / l), 0);
      }
    };
    // the soleplate: a bright metal band
    walls(SOLE, 0, SOLE, 1.8, () => 0.3);
    p.face(at(SOLE, 1.8), 0.3, 0);
    // the body, tapering up from the plate
    const lo = shrink(0.95, -1), hi = shrink(0.72, -2.5);
    p.line([...at(lo, 1.8), [lo[0][0], lo[0][1], 1.8]], 1, 0.9);
    walls(lo, 1.8, hi, 10.5, (d) => (d > 0.3 ? 0.2 : d > -0.4 ? 0.12 : 0.06));
    p.face(at(hi, 10.5), 0.26, 0);
    // the dial on top
    p.disc(-6, 0, 10.55, 2.6, 0.035);
    p.line([[-6, 0, 10.6], [-4.2, 1.2, 10.6]], 1, 0.6);
    // the closed handle: two posts and a long grip
    p.box(-10.4, -1.6, 10.5, 3.2, 3.2, 5.8, BRIGHT);
    p.box(1.2, -1.6, 10.5, 2.8, 3.2, 5.8, BRIGHT);
    p.box(-10.4, -1.7, 16, 15, 3.4, 3, BRIGHT);
    p.line([[-10.4, 1.73, 16], [4.6, 1.73, 16]], 1, 0.8);
    // puffs of steam out of the nose while hovered
    if (k > 0.02) {
      const puffs: [number, number, number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const v = (t * 0.8 + i / 3) % 1, [x, y] = p.pt([14 + v * 2.5, (i - 1) * 2.2, 4 + v * 14]);
        puffs.push([x, y, 1.4 + v * 2.4, k * Math.sin(v * Math.PI)]);
      }
      p.screen((g) => { for (const [x, y, r, a] of puffs) { g.globalAlpha = a; g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } });
    }
  },
};
