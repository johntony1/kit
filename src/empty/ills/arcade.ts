// No high scores: an arcade cabinet with a dark screen. Hover and the screen wakes with a little invader, the stick wiggles and the marquee glows.
import { SH, type Illustration, type V3 } from "../dots";

const W = 9.5; // half width
// the side profile as [y, z], from the front of the base up and over to the back
const PROF: [number, number][] = [[7, 0], [7, 13], [10.5, 15], [10.5, 17], [4, 19.5], [2, 30.5], [6.5, 31.5], [6.5, 37], [-8, 37], [-8, 0]];
const ALIEN = ["..#.#..", ".#####.", "##.#.##", "#######", ".#...#."];

export const arcade: Illustration = {
  k: "arcade", name: "Arcade cabinet", title: "No high scores", body: "Play a round and your best scores will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 1, -16);
    p.scale(0.9);
    p.shadow(0, 0, 25, 12.5, 0.11);
    p.rotate("z", -0.3);
    // the front, panel by panel: only the ones that look at us
    for (let i = 0; i < PROF.length - 1; i++) {
      const [y0, z0] = PROF[i], [y1, z1] = PROF[i + 1], ny = z1 - z0, nz = -(y1 - y0), l = Math.hypot(ny, nz);
      if (ny + nz <= 0) continue;
      p.face([[-W, y0, z0], [W, y0, z0], [W, y1, z1], [-W, y1, z1]], 0.115 + 0.11 * Math.max(0, nz / l), SH.edge, 0.6);
    }
    p.face(PROF.map(([y, z]) => [W, y, z] as V3), 0.065, SH.edge, 0.65);
    // the marquee: a band that glows
    p.face([[-W + 1.3, 6.53, 32.6], [W - 1.3, 6.53, 32.6], [W - 1.3, 6.53, 35.9], [-W + 1.3, 6.53, 35.9]], 0.04 + 0.9 * h, SH.edge, 0.5);
    // the screen, set into the sloping panel
    const sc = (u: number, s: number): V3 => [u, 4 - 2 * s + 0.03, 19.5 + 11 * s];
    p.clear([sc(-W + 1.6, 0.12), sc(W - 1.6, 0.12), sc(W - 1.6, 0.9), sc(-W + 1.6, 0.9)]);
    const on = Math.min(1, Math.max(0, (h - 0.25) / 0.3));
    if (on > 0) {
      const hop = Math.sin(t * 4) > 0 ? 0.35 : -0.35;
      ALIEN.forEach((row, r) => [...row].forEach((ch, c) => {
        if (ch !== "#") return;
        const u = (c - 3) * 1.25 + hop, s = 0.75 - r * 0.085;
        p.face([sc(u - 0.62, s - 0.042), sc(u + 0.62, s - 0.042), sc(u + 0.62, s + 0.043), sc(u - 0.62, s + 0.043)], on, 0);
      }));
      p.face([sc(-1.6, 0.2), sc(1.6, 0.2), sc(1.6, 0.25), sc(-1.6, 0.25)], on, 0);
    } else p.face([sc(-1.5, 0.48), sc(1.5, 0.48), sc(1.5, 0.53), sc(-1.5, 0.53)], 0.3, 0);
    // the controls: a stick with a ball, and two buttons
    const cp = (u: number, s: number): V3 => [u, 10.5 - 6.5 * s, 17 + 2.5 * s + 0.03];
    const lean = h * Math.sin(t * 7) * 1.3, b = cp(-4, 0.5);
    p.face([[b[0] - 0.35, b[1], b[2]], [b[0] + 0.35, b[1], b[2]], [b[0] + 0.35 + lean, b[1], b[2] + 3.4], [b[0] - 0.35 + lean, b[1], b[2] + 3.4]], 0.4, 0);
    p.dot([b[0] + lean, b[1], b[2] + 4], 1.35, 1);
    for (const u of [2, 5.2]) { const q = cp(u, 0.5); p.disc(q[0], q[1], q[2] + 0.3, 1.1, 0.5 + 0.5 * h * (Math.sin(t * 9 + u) > 0 ? 1 : 0), SH.edge); }
    // a coin door
    p.face([[-2.4, 7.03, 4], [2.4, 7.03, 4], [2.4, 7.03, 10], [-2.4, 7.03, 10]], 0.04, SH.edge, 0.5);
    p.clear([[-0.3, 7.05, 6], [0.3, 7.05, 6], [0.3, 7.05, 8.4], [-0.3, 7.05, 8.4]]);
  },
};
