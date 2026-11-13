// No films yet: a film reel lying in its open tin, a strip of film running out over the rim. The reel turns and the strip feeds out, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const TR = 15, TH = 3.6, RR = 13.2; // tin radius and height, reel radius
const ring = (cx: number, cy: number, r: number, z: number, n = 40, a0 = 0, a1 = Math.PI * 2): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const filmreel: Illustration = {
  k: "filmreel", name: "Film reel", title: "No films yet", body: "Upload your first film and it will be kept here, ready to watch.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, spin = -u * Math.PI * 2 * (2 / 5); // turns two holes a loop, so it loops seamlessly
    p.translate(-2, -2, -4);
    p.scale(1.1);
    p.shadow(0, 0, 30, 13, 0.12);
    // the tin: a low round dish, lit rim, dark inside
    p.cylinder(0, 0, 0, TR, TH, { side: 0.12, top: 0.03, edge: 0 });
    p.face([...ring(0, 0, TR, TH), ...ring(0, 0, TR - 0.9, TH).reverse()], 0.3, 0);
    // the reel: a lit flange with five round windows that turn, a hub in the middle
    const z = TH - 0.6;
    p.cylinder(0, 0, 0.6, RR, z - 0.6, { side: 0.065, top: 0.24, edge: 0 });
    for (let i = 0; i < 5; i++) {
      const a = spin + (i / 5) * Math.PI * 2;
      p.face(ring(Math.cos(a) * 7.6, Math.sin(a) * 7.6, 3.4, z + 0.02, 28), 0.015, 0);
    }
    p.face(ring(0, 0, 2.6, z + 0.02, 28), 0.04, 0);
    p.dot([0, 0, z + 0.05], 1.1, 1);
    p.line(ring(0, 0, RR - 1.2, z + 0.03, 48), 0, 0.6);
    // the strip: off the reel's edge, over the rim, down to the floor and out toward us
    const W = 2.4, path: V3[] = [[3, RR - 0.5, z + 0.1], [3, TR + 0.4, TH + 0.4], [3, TR + 2, 0.6], [3, TR + 3.5, 0.05], [12, TR + 4.5, 0.05], [19, TR + 3.5, 0.05]];
    const L = path.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - path[i][0], q[1] - path[i][1], q[2] - path[i][2]), 0);
    const at = (s: number): [V3, V3] => {
      let acc = 0;
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i], d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        if (acc + d >= s || i === path.length - 1) { const k = Math.min(1, (s - acc) / d); return [[a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k], [(b[0] - a[0]) / d, (b[1] - a[1]) / d, (b[2] - a[2]) / d]]; }
        acc += d;
      }
      return [path[path.length - 1], [1, 0, 0]];
    };
    // the strip's two edges: sideways is across the strip, flat on whatever it lies on
    const side = (dir: V3): V3 => { const s: V3 = [dir[1], -dir[0], 0], n = Math.hypot(s[0], s[1]) || 1; return [s[0] / n, s[1] / n, 0]; };
    const N = 40, e1: V3[] = [], e2: V3[] = [];
    for (let i = 0; i <= N; i++) { const [q, d] = at((L * i) / N), s = side(d); e1.push([q[0] + s[0] * W, q[1] + s[1] * W, q[2] + 0.02]); e2.push([q[0] - s[0] * W, q[1] - s[1] * W, q[2] + 0.02]); }
    p.face([...e1, ...e2.reverse()], 0.3, 0);
    // sprocket holes marching along both edges, and a frame line every few holes
    const step = 2.2, off = (u * 5 * step) % step;
    for (let s = off + 0.6; s < L - 0.6; s += step) {
      const [q, d] = at(s), sd = side(d);
      for (const k of [-1, 1]) {
        const c: V3 = [q[0] + sd[0] * W * 0.68 * k, q[1] + sd[1] * W * 0.68 * k, q[2] + 0.05];
        const hx = d[0] * 0.5, hy = d[1] * 0.5, hz = d[2] * 0.5, sx = sd[0] * 0.38, sy = sd[1] * 0.38;
        p.face([[c[0] - hx - sx, c[1] - hy - sy, c[2] - hz], [c[0] + hx - sx, c[1] + hy - sy, c[2] + hz], [c[0] + hx + sx, c[1] + hy + sy, c[2] + hz], [c[0] - hx + sx, c[1] - hy + sy, c[2] - hz]], 0.015, 0);
      }
    }
  },
};
