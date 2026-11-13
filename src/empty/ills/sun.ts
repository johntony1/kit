// Nothing scheduled today: a big round sun with eight rays. The rays turn slowly around it and breathe in and out.
import { type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const P = 4; // seconds per loop
const R = 11.5, D = 2.6; // disc radius, thickness
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const circle = (r: number, n = 44): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; });
/** a ray pointing along angle a: a wedge from r0 out to r1, tapering to a blunt point */
const ray = (a: number, r0: number, r1: number, w: number): P2[] => {
  const c = Math.cos(a), s = Math.sin(a), out: P2[] = [];
  const pt = (u: number, v: number): P2 => [c * u - s * v, s * u + c * v];
  out.push(pt(r0, -w), pt(r1, -w * 0.25), pt(r1, w * 0.25), pt(r0, w));
  return out;
};

export const sun: Illustration = {
  k: "sun", name: "Sun", title: "Nothing scheduled today", body: "Your day is free. Plans you add for today will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.push(); p.translate(0, 0, -22); p.shadow(0, 0, 15, 6.5, 0.1); p.pop();
    p.rotate("z", -0.6); // turned to face us
    const rays = Array.from({ length: 8 }, (_, i) => ray(u * (Math.PI / 4) + (i * Math.PI) / 4, R + 2.4, 21 + 1.8 * Math.sin(w + (i % 2) * Math.PI), 2.4));
    // the shaded backs first, then the lit fronts
    for (let y = -D; y < 0; y += 0.45) {
      for (const r of rays) p.face(at(r, y), 0.1, 0);
      p.face(at(circle(R), y), 0.1, 0);
    }
    for (const r of rays) p.face(at(r), 0.28, 0);
    p.face(at(circle(R + 0.9)), 0.02, 0); // a dark ring parts the disc from the rays
    p.face(at(circle(R)), 0.3, 0);
    // a shaded crescent on the lower right gives the disc its roundness
    const cres: P2[] = [];
    for (let i = 0; i <= 20; i++) { const a = -1.9 + (i / 20) * 2.3; cres.push([Math.cos(a) * R, Math.sin(a) * R]); }
    for (let i = 20; i >= 0; i--) { const a = -1.9 + (i / 20) * 2.3; cres.push([Math.cos(a) * R * 0.78 - 1.6, Math.sin(a) * R * 0.78 + 1.2]); }
    p.face(at(cres, 0.02), 0.12, 0);
    // a small shine on the upper left
    p.line(at(Array.from({ length: 7 }, (_, i) => { const a = 1.9 + (i / 6) * 0.9; return [Math.cos(a) * R * 0.68, Math.sin(a) * R * 0.68] as P2; }), 0.04), 1, 1.1);
  },
};
