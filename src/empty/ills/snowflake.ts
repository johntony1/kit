// Everything is frozen: one big six armed snowflake with a branch pair on each arm. It turns slowly in place and rocks to show its depth.
import { type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const P = 4.2; // seconds per loop
const D = 1.4; // thickness
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
/** a bar from (ox, oz) along angle a, len long and w wide */
const bar = (a: number, ox: number, oz: number, len: number, w: number): P2[] => {
  const c = Math.cos(a), s = Math.sin(a), nx = (-s * w) / 2, nz = (c * w) / 2;
  return [[ox + nx, oz + nz], [ox + c * len + nx, oz + s * len + nz], [ox + c * len - nx, oz + s * len - nz], [ox - nx, oz - nz]];
};
/** the snowflake as a list of bars, turned by `turn` */
const parts = (turn: number): P2[][] => {
  const out: P2[][] = [];
  for (let i = 0; i < 6; i++) {
    const a = turn + (i * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
    out.push(bar(a, 0, 0, 21, 3.2));
    for (const side of [-1, 1]) out.push(bar(a + side * (Math.PI / 4), c * 11, s * 11, 6.8, 2.6));
  }
  return out;
};

export const snowflake: Illustration = {
  k: "snowflake", name: "Snowflake", title: "Everything is frozen", body: "This is on hold for now. Unfreeze it to make changes again.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2, turn = u * (Math.PI / 3) + Math.PI / 2;
    p.push(); p.translate(0, 0, -24); p.shadow(0, 0, 15, 6.5, 0.1); p.pop();
    p.translate(0, 0, Math.sin(w) * 0.8);
    p.rotate("z", -0.6 + Math.sin(w) * 0.15); // turned to face us, rocking
    const q = parts(turn);
    for (let y = -D; y < 0; y += 0.35) for (const b of q) p.face(at(b, y), 0.06, 0);
    for (const b of q) p.face(at(b), 0.3, 0);
    // a dark hexagon cut in the middle
    p.face(at(Array.from({ length: 6 }, (_, i) => { const a = turn + Math.PI / 6 + (i * Math.PI) / 3; return [Math.cos(a) * 2.4, Math.sin(a) * 2.4] as P2; }), 0.05), 0.03, 0);
  },
};
