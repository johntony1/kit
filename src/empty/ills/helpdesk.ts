// No open tickets: a lifebuoy, the sign for help, floating just off the floor. It turns slowly and bobs, its four dark bands going round.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 4;
const R = 15, RI = 7.6, H = 5.6, BAND = 0.4;
const TAU = Math.PI * 2;
const arc = (a0: number, a1: number, z: number, r: number): V3[] => Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

/** the part of a wall between a0 and a1 that we can see: the near half of the outside, the far half of the hole */
function wall(p: Pen, a0: number, a1: number, z: number, outer: boolean, fill: number) {
  const lo = outer ? -Math.PI / 4 : (Math.PI * 3) / 4, r = outer ? R : RI;
  for (const k of [-2, -1, 0, 1]) {
    const s = Math.max(a0, lo + k * TAU), e = Math.min(a1, lo + Math.PI + k * TAU);
    if (e > s + 0.01) p.face([...arc(s, e, z, r), ...arc(e, s, z + H, r)], fill, outer ? SH.edge : 0, 0.55);
  }
}

export const helpdesk: Illustration = {
  k: "helpdesk", name: "Help desk", title: "No open tickets", body: "Nobody is waiting on you right now. New requests for help will land here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const spin = u * (Math.PI / 2), z = 3.4 + Math.sin(u * TAU) * 1.3; // a quarter turn brings the bands back to where they began
    p.translate(0, 0, -6);
    p.scale(1.08);
    p.shadow(0, 0, 34 - z, 17 - z / 2, 0.11);
    const dark = p.ink ? 0.34 : 0.045;
    const bands = [0, 1, 2, 3].map((j) => spin + j * (Math.PI / 2));
    // the far wall of the hole, the near wall of the ring, each with its bands
    wall(p, 0, TAU, z, false, 0.065);
    for (const a of bands) wall(p, a, a + BAND, z, false, dark);
    wall(p, 0, TAU, z, true, 0.13);
    for (const a of bands) wall(p, a, a + BAND, z, true, dark);
    // the top: a ring with its hole, then the bands across it
    const zt = z + H, o = arc(0, TAU, zt, R), i = arc(0, TAU, zt, RI);
    p.face([...o, ...i.reverse()], 0.21, 0);
    p.line(o, SH.edge, 0.6); p.line(arc(0, TAU, zt, RI), SH.edge, 0.6);
    for (const a of bands) p.face([...arc(a, a + BAND, zt + 0.02, R), ...arc(a + BAND, a, zt + 0.02, RI)], dark, SH.edge, 0.55);
    // a rope line round the outside (line style only)
    p.guide(arc(0, TAU, z + H / 2, R + 1.6));
  },
};
