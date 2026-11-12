// Campfire: two crossed logs in a ring of stones with a fire burning on them. The flames lick and sway and sparks rise.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
// a plane that faces the viewer: u runs right, v runs up, both in dots
const bb = (c: V3) => (u: number, v: number): V3 => [c[0] + 0.5774 * u, c[1] - 0.5774 * u, c[2] + v];

// a tongue of flame: round at the foot, pointed at the top, its tip pushed sideways by `sway`
function flame(p: Pen, c: V3, W: number, H: number, sway: number, fill: number, edge: number) {
  const f = bb(c), n = 14, L: V3[] = [], Rt: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, wd = W * Math.sin(Math.PI * Math.pow(s, 0.55)) * (1 - 0.3 * s), x = sway * s * s;
    L.push(f(x - wd, s * H)); Rt.unshift(f(x + wd, s * H));
  }
  p.face([...L, ...Rt], fill, edge, 0.6);
}

export const campfire: Illustration = {
  k: "campfire", name: "Campfire", title: "No camps booked", body: "Book a camp and your stays will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 28, 14, 0.12);
    // the ring of stones: the far ones first
    const stones = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + 0.3; return [Math.cos(a) * 14, Math.sin(a) * 14] as [number, number]; }).sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    const stone = ([x, y]: [number, number]) => p.cylinder(x, y, 0, 2.5, 2, { side: 0.12, top: 0.22, lw: 0.5 });
    stones.filter((s) => s[0] + s[1] < 0).forEach(stone);
    // two crossed logs, their sawn ends bright
    const log = (a: number, z: number) => { p.push(); p.rotate("z", a); p.box(-10, -1.7, z, 20, 3.4, 3.4, { top: 0.2, left: 0.12, right: 0.3, lw: 0.6 }); p.pop(); };
    log(0.62, 0); log(-0.62, 2.2);
    // the fire: two side tongues, the main flame and its bright heart
    const base = bb([0, 0, 4.6]);
    const s1 = Math.sin(w), s2 = Math.sin(2 * w + 1), s3 = Math.sin(3 * w + 2);
    flame(p, base(-4.4, 0), 3.4, 11 + 1.6 * s2, 1.6 * s3, 0.24, SH.edge);
    flame(p, base(4.6, 0), 3, 9 - 1.6 * s2, -1.5 * s1, 0.24, SH.edge);
    flame(p, base(0, 0), 6.6, 21 + 2.2 * s1, 2.4 * s2 + s3, 0.3, SH.edge);
    flame(p, base(0, 0.6), 3.3, 11 + 1.6 * s3, 1.3 * s2, 1, 0);
    // sparks rising and fading
    for (let i = 0; i < 4; i++) {
      const k = (u + i / 4) % 1;
      p.dot(base(Math.sin(i * 2.4) * 7 + Math.sin(k * Math.PI * 2 + i) * 1.5, 15 + k * 15), 0.25 + 0.6 * (1 - k), 1 - k);
    }
    stones.filter((s) => s[0] + s[1] >= 0).forEach(stone);
  },
};
