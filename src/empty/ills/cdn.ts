// No edge locations: an origin tower in the middle of a round map, edge points standing round it. Ripples spread from the origin and each edge point lights as one reaches it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop: two ripples
const RD = 19, RN = 14.5, ZT = 1.6; // disc radius, where the edge points stand, top of the disc
const NODES = Array.from({ length: 5 }, (_, i) => { const a = 0.35 + (i * Math.PI * 2) / 5; return [Math.cos(a) * RN, Math.sin(a) * RN] as [number, number]; });
const circle = (r: number, z: number): V3[] => Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

function edge(p: Pen, [x, y]: [number, number], lit: number) {
  p.disc(x, y, ZT + 0.03, 2.2, 0.03, SH.edge);
  p.line([[x, y, ZT], [x, y, ZT + 6]], SH.edge, 0.7);
  p.dot([x, y, ZT + 6.6], 1.2 + 1.1 * lit, 0.6 + 0.4 * lit);
}

export const cdn: Illustration = {
  k: "cdn", name: "Edge network", title: "No edge locations", body: "Turn on the edge network and your content will be served from the location nearest each visitor.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -6);
    p.scale(1.08);
    p.shadow(0, 0, 30, 15, 0.12);
    p.cylinder(0, 0, 0, RD, ZT, { side: 0.12, top: 0.07, lw: 0.6 });
    p.line(circle(RN, ZT + 0.02), 0.35, 0.45);
    // the ripples, fading as they spread
    let lit = 0;
    for (const s of [0, 0.5]) {
      const v = (u * 2 + s) % 1, r = 3.6 + (RD - 4.6) * v;
      p.line(circle(r, ZT + 0.03), 1 - 0.75 * v, 1 - 0.4 * v);
      lit = Math.max(lit, 1 - Math.abs(r - RN) / 3);
    }
    lit = Math.max(0, lit);
    const far = NODES.filter(([x, y]) => x + y < 0), near = NODES.filter(([x, y]) => x + y >= 0);
    for (const n of far) edge(p, n, lit);
    // the origin: a short tower with a lit cap
    p.cylinder(0, 0, ZT, 3.6, 9, { side: 0.14, top: 0.34, lw: 0.6 });
    p.line([[3.6 * 0.707, 3.6 * 0.707, ZT + 3], [3.6 * 0.707, 3.6 * 0.707, ZT + 6.5]], SH.edge, 0.6);
    p.dot([0, 0, ZT + 9.05], 1.3, 1);
    for (const n of near) edge(p, n, lit);
  },
};
