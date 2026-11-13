// Nothing turning yet: a windmill, a round tapered tower with a door and a pointed cap, four big lattice sails turning on the front.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4; // seconds per loop: a quarter turn
type P2 = [number, number];
const K = 0.57735;
const arc = (r: number, z: number, a0: number, a1: number, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
const F0 = -Math.PI / 4, F1 = (3 * Math.PI) / 4;

export const windmill: Illustration = {
  k: "windmill", name: "Windmill", title: "Nothing turning yet", body: "Start your first run and you will see it turning here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, th = u * (Math.PI / 2) + 0.2;
    p.translate(0, 0, -25);
    p.shadow(0, 0, 18, 8, 0.12);
    // the tower: lit wall, a shaded flank, a door and a window
    const R0 = 9, R1 = 5.8, H = 27;
    p.face([...arc(R0, 0, F0, F1), ...arc(R1, H, F0, F1).reverse()], 0.2, 0);
    p.face([...arc(R0 + 0.03, 0, F0, F0 + 0.75, 8), ...arc(R1 + 0.03, H, F0, F0 + 0.75, 8).reverse()], 0.065, 0);
    const on = (a: number, z: number, d = 0): V3 => { const r = R0 + (R1 - R0) * (z / H) + 0.05; return [Math.cos(a) * r + d * 0.707, Math.sin(a) * r - d * 0.707, z]; };
    const c = Math.PI / 4 + 0.35;
    p.clear([on(c - 0.22, 0.2), on(c + 0.22, 0.2), on(c + 0.22, 5.5), on(c, 7), on(c - 0.22, 5.5)]);
    // the cap: a cone over a lit rim
    p.cylinder(0, 0, H, R1 + 1, 1.4, { side: 0.26, top: 0.2, edge: 0 });
    p.face([...arc(R1 + 1, H + 1.4, F0, F1), [0, 0, H + 9]], 0.14, 0);
    p.face([...arc(R1 + 1.03, H + 1.4, F0, F0 + 0.9, 8), [0, 0, H + 9]], 0.065, 0);
    p.line([...arc(R1 + 1.05, H + 1.4, F0, F1)], SH.edge, 0.6);
    // the sails, on the front of the cap, turning
    const hub: P2 = [0, H - 1];
    const B = ([x, v]: P2): V3 => [x * K + 7.5, -x * K + 7.5, v];
    const rot = ([x, v]: P2, a: number): P2 => [hub[0] + x * Math.cos(a) - v * Math.sin(a), hub[1] + x * Math.sin(a) + v * Math.cos(a)];
    for (let k = 0; k < 4; k++) {
      const a = th + (k * Math.PI) / 2;
      const S = (q: P2[]) => q.map((q2) => B(rot(q2, a)));
      // the spar, then the lattice sail on one side of it
      p.face(S([[-1, 1.5], [1, 1.5], [1, 22.5], [-1, 22.5]]), 0.3, 0);
      p.face(S([[1.6, 5.5], [8, 5.5], [8, 22], [1.6, 22]]), 0.22, 0);
      p.line(S([[1.6, 5.5], [8, 5.5], [8, 22], [1.6, 22], [1.6, 5.5]]), SH.edge, 0.6);
      p.line(S([[1.6, 13.7], [8, 13.7]]), SH.edge, 0.6);
    }
    p.dot(B(hub), 1.6, 0.3);
  },
};
