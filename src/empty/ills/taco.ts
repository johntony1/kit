// Taco: a hard shell taco seen side on, standing on its fold. A big half moon shell with a frill of lettuce and rounds of tomato poking out along its curved top. It rocks gently.
import { type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
const P = 3.2, R = 20, V0 = -12; // seconds per loop, the shell's radius, the height of its fold

export const taco: Illustration = {
  k: "taco", name: "Taco", title: "No street food yet", body: "Order from a stall or a truck near you and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = -0.12 + 0.07 * Math.sin(((t / P) % 1) * Math.PI * 2), c = Math.cos(a), s = Math.sin(a);
    p.push(); p.translate(0, 0, -17); p.shadow(0, 0, 26, 10, 0.11); p.pop();
    // the plane that faces us, tilted about the middle of the fold
    const B = ([u, v]: P2): V3 => { const x = u * c - (v - V0) * s, y = V0 + u * s + (v - V0) * c; return [x * K, -x * K, y]; };
    // a half moon: the curved open edge on top, the fold a soft belly underneath
    const moon = (r: number, du: number, dv: number): V3[] => [
      ...Array.from({ length: 41 }, (_, i) => { const q = (i / 40) * Math.PI; return B([du + r * Math.cos(q), dv + V0 + r * Math.sin(q)]); }),
      ...Array.from({ length: 15 }, (_, i) => { const q = Math.PI + (i / 14) * Math.PI; return B([du + r * Math.cos(q), dv + V0 + 2.6 * Math.sin(q)]); }),
    ];
    // the far side of the shell, in shade, standing a little higher
    p.face(moon(R, 2.2, 4.6), 0.065, 0);
    // rounds of tomato between the two sides
    for (const [q, r] of [[2.25, 4.6], [1.42, 5], [0.62, 4.6]]) {
      const o: P2 = [1 + (R + 2.6) * Math.cos(q), V0 + 2 + (R + 2.6) * Math.sin(q)];
      p.face(Array.from({ length: 24 }, (_, i) => { const g = (i / 24) * Math.PI * 2; return B([o[0] + Math.cos(g) * r, o[1] + Math.sin(g) * r]); }), 0.13, 0);
    }
    // the lettuce: a bright frill of big scallops along the curve
    const frill: V3[] = Array.from({ length: 81 }, (_, i) => { const q = (i / 80) * Math.PI, r = R + 1 + 3.4 * Math.abs(Math.sin(q * 6)); return B([0.6 + r * Math.cos(q), V0 + 0.8 + r * Math.sin(q)]); });
    p.face(frill, 0.3, 0);
    // the near side of the shell: one bold half moon, a dark cut where the filling meets it
    const fr = moon(R, 0, 0);
    p.face(fr, 0.13, 0);
    p.line(fr.slice(0, 41), 1, 1.1);
    // a few toasted specks
    for (const [u, v] of [[-8, 4.5], [-1, 10], [7, 5.5], [1, 1.5]]) p.dot(B([u, V0 + v]), 1, 0);
  },
};
