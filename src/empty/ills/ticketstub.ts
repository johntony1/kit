// No tickets yet: a tall ticket standing slightly tilted, round notches bitten from both sides at a perforated line, a bold star above it. It sways and hops gently, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const W = 11, T = 40, NR = 3.2, NZ = 12; // half width, height, notch radius, notch and perforation height
type Q = [number, number][];

/** the outline: square corners, a round notch bitten from each side at the perforation */
const OUT: Q = (() => {
  const q: Q = [[-W, 0], [W, 0]];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; q.push([W - Math.cos(a) * NR, NZ + Math.sin(a) * NR]); }
  q.push([W, T], [-W, T]);
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 - (i / 12) * Math.PI; q.push([-W + Math.cos(a) * NR, NZ + Math.sin(a) * NR]); }
  return q;
})();
const star = (cx: number, cz: number, r: number): Q => Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.44 : r; return [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr]; });

export const ticketstub: Illustration = {
  k: "ticketstub", name: "Ticket stub", title: "No tickets yet", body: "Book a show or an event and your tickets will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, sway = 0.05 * Math.sin(u * Math.PI * 2), hop = Math.max(0, Math.sin(u * Math.PI * 2)) * 1.4;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20 - hop, 8, 0.12);
    p.rotate("z", -0.66);
    p.translate(0, 0, hop);
    p.rotate("y", 0.14 + sway, [0, 0, 0]); // the slight tilt, swaying
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v] as V3);
    // the card's thickness, then its lit face
    for (let y = -2.4; y < 0; y += 0.4) p.face(put(OUT, y), 0.065, 0);
    p.face(put(OUT, 0), 0.26, 0);
    // the perforation between the notches: a row of dark dashes
    for (let i = 0; i < 6; i++) { const x = -W + NR + 1.2 + i * ((2 * W - 2 * NR - 2.4 - 1.6) / 5); p.line([[x, 0.05, NZ], [x + 1.6, 0.05, NZ]], 0, 1); }
    // a bold star cut into the main part, a line of print under it
    p.face(put(star(0, NZ + 15.5, 8.2), 0.05), 0.02, 0);
    p.line([[-W + 4, 0.05, NZ + 4], [W - 4, 0.05, NZ + 4]], 0, 1);
    // the stub below: two short lines of print
    p.line([[-W + 4, 0.05, 7], [W - 7, 0.05, 7]], 0, 1);
    p.line([[-W + 4, 0.05, 3.6], [W - 10, 0.05, 3.6]], 0, 1);
  },
};
