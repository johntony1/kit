// No rounds played: a dimpled golf ball sitting on a tee. Hover and the ball hops up off the tee with a spin and drops back with a little bounce.
import { type Illustration, type V3 } from "../dots";

const R = 11.5, ZT = 10; // ball radius, top of the tee
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
const cl = (x: number) => Math.max(0, Math.min(1, x));
const circ = (cu: number, cv: number, r: number, d = 0, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return F(cu + Math.cos(a) * r, cv + Math.sin(a) * r, d); });

// height of the ball above the tee: up, down, a small bounce, rest
function hop(k: number) {
  if (k <= 0) return 0;
  if (k < 0.6) return 9 * Math.sin((k / 0.6) * Math.PI);
  if (k < 0.85) return 1.6 * Math.sin(((k - 0.6) / 0.25) * Math.PI);
  return 0;
}

export const golf: Illustration = {
  k: "golf", name: "Golf", title: "No rounds played", body: "Play your first round and your scores and stats will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = cl(h / 0.8), lift = hop(k), spin = k * Math.PI * 1.5;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20 - lift * 0.6, 9, 0.12);
    // the tee: a cup on a tapering peg, lit on its left
    const tee = (a: number, b: number, fill: number) => p.face([F(3.8 * a, ZT), F(3.8 * b, ZT), F(1.6 * b, ZT - 3), F(0.8 * b, 0), F(0.8 * a, 0), F(1.6 * a, ZT - 3)], fill, 0);
    tee(-1, 0.2, 0.24);
    tee(0.2, 1, 0.09);
    p.face([F(-3.8, ZT, 0.1), F(3.8, ZT, 0.1), F(3.8, ZT - 1, 0.1), F(-3.8, ZT - 1, 0.1)], 0.3, 0);
    // the ball: a dense round body, lit on its upper left, a bright glint
    const cv = ZT + R - 1.2 + lift;
    p.face(circ(0, cv, R), 0.12, 0);
    p.face(circ(-1.8, cv + 1.8, R - 2.6, 0.1), 0.2, 0);
    p.face(circ(-4.6, cv + 4.8, 2, 0.2), 0.45, 0);
    // dimples: dark pits on the facing half, turning as it spins
    for (let i = 0; i < 5; i++) {
      const lat = -1.05 + i * 0.52;
      const n = Math.max(3, Math.round(9 * Math.cos(lat)));
      for (let j = 0; j < n; j++) {
        const lon = spin + (j + (i % 2) * 0.5) * ((Math.PI * 2) / n);
        const z = Math.cos(lat) * Math.cos(lon); // toward us
        if (z < 0.3) continue;
        const u = Math.cos(lat) * Math.sin(lon) * R, v = Math.sin(lat) * R;
        if (Math.hypot(u + 4.6, v - 4.8) < 2.6) continue;
        p.dot(F(u, cv + v, 0.4), 0.55 + 0.45 * z, 0);
      }
    }
  },
};
