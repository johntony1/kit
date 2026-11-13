// No music yet: a big pair of beamed notes standing upright. They hop on the beat, squashing as they land, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.6; // seconds per loop, two hops
type Q = [number, number][];
const oval = (cx: number, cv: number, rx: number, ry: number, a: number): Q =>
  Array.from({ length: 28 }, (_, i) => { const s = (i / 28) * Math.PI * 2, x = Math.cos(s) * rx, y = Math.sin(s) * ry; return [cx + x * Math.cos(a) - y * Math.sin(a), cv + x * Math.sin(a) + y * Math.cos(a)]; });
// the two heads, their stems and the beam, in the plane of the note (across, up)
const HEADS: Q[] = [oval(-8.5, 4, 4.6, 3.3, 0.38), oval(7.5, 7, 4.6, 3.3, 0.38)];
const STEMS: Q[] = [[[-5.1, 6], [-3.2, 6], [-3.2, 28], [-5.1, 28]], [[10.9, 9], [12.8, 9], [12.8, 31], [10.9, 31]]];
const BEAM: Q = [[-5.1, 24], [12.8, 27], [12.8, 32.5], [-5.1, 29.5]];

export const musicnote: Illustration = {
  k: "musicnote", name: "Music note", title: "No music yet", body: "Add a song or an album and your music will play from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) * 2) % 1; // two hops per loop
    const air = u < 0.7 ? Math.sin((u / 0.7) * Math.PI) : 0;
    const lift = 6 * air;
    const sq = u >= 0.7 ? 1 - 0.14 * Math.sin(((u - 0.7) / 0.3) * Math.PI) : 1 + 0.05 * air; // squash on landing, stretch in the air
    const rock = 0.07 * Math.sin(((t / P) * 2 * Math.PI)) ;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24 - lift, 10, 0.12 * (1 - lift / 14));
    p.rotate("z", -0.62);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [(a - 2) * (2 - sq) * Math.cos(rock) - v * sq * Math.sin(rock), y, lift + v * sq * Math.cos(rock) + (a - 2) * Math.sin(rock) * 0.3] as V3);
    const all = [BEAM, ...STEMS, ...HEADS];
    const solid = (pen: Pen, fill: number, y: number) => all.forEach((q) => pen.face(put(q, y), fill, 0));
    // the depth: layers stepped back from the face, then the lit face itself
    for (let y = -3; y < 0; y += 0.5) solid(p, 0.065, y);
    solid(p, 0.22, 0);
    // a cut where each stem meets the beam, and a bright shine on each head
    p.line([put([[-5.1, 24]], 0.05)[0], put([[12.8, 27]], 0.05)[0]], 1, 0.6);
    for (const [cx, cv] of [[-10, 5.4], [6, 8.4]]) p.dot(put([[cx, cv]], 0.1)[0], 0.9, 1);
  },
};
