// No commits yet: commit discs threaded on a pole, the newest on top. A new one drops on, then the whole history sinks down by one.
import { type Illustration } from "../dots";

const P = 3; // seconds per loop
const BASE = 2, SLOT = 7.6, TH = 2.6, R = 7.4, TOP = 33; // base height, slot pitch, disc thickness and radius, pole top
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));

// the new disc's height above its slot: a drop, a bounce, rest
function drop(k: number) {
  if (k < 0.6) return 15 * (1 - Math.pow(k / 0.6, 2));
  if (k < 0.85) { const v = (k - 0.6) / 0.25; return 2.2 * 4 * v * (1 - v); }
  return 0;
}

export const commit: Illustration = {
  k: "commit", name: "Commits", title: "No commits yet", body: "Commit a change and the history of this branch will build up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const fall = cl(u / 0.5), shift = SLOT * ease(cl((u - 0.58) / 0.38));
    p.translate(0, 0, -17);
    p.scale(1.08, [0, 0, 17]);
    p.shadow(0, 0, 22, 11, 0.12);
    p.cylinder(0, 0, 0, 9, BASE, { side: 0.12, top: 0.14 });
    let zp = BASE;
    const pole = (z0: number, z1: number) => { if (z1 - z0 > 0.05) p.cylinder(0, 0, z0, 0.95, z1 - z0, { side: 0.34, top: 0.34, edge: 0 }); };
    for (let i = 0; i < 4; i++) {
      let z = BASE + 3 + i * SLOT - shift, r = R, top = 0.2;
      if (i === 3) { z += drop(fall); r = R * cl(fall / 0.12); top = 0.34; }
      if (i === 2) top = 0.34 - 0.14 * cl(u / 0.3);
      const zb = Math.max(BASE, z), hh = z + TH - zb;
      if (hh <= 0.05 || r < 0.4) continue;
      pole(zp, Math.min(zb, TOP));
      p.cylinder(0, 0, zb, r, hh, { side: 0.07, top: top + 0.06, lw: 0.7 });
      zp = zb + hh;
    }
    pole(zp, TOP);
    p.dot([0, 0, TOP], 1.1, 1);
  },
};
