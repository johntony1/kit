// Your nest egg starts here: a big bright egg with a coin mark sitting in a deep round twig nest, seen from the front. The egg rocks gently in the nest and a glint runs over it, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const ER = 9.4, EB = 6; // the egg: half width, height of its bottom
const NZ = 13, NR = 14.5; // the nest: rim height, half width

/** the egg's outline in its own plane, [x, z] up from its bottom: fuller below, narrower on top */
const EGG: [number, number][] = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2, s = Math.sin(a);
  return [Math.cos(a) * ER * (1 - 0.1 * s), ER * 1.05 + s * ER * (s > 0 ? 1.45 : 1.05)];
});

export const nestegg: Illustration = {
  k: "nestegg", name: "Nest egg", title: "Your nest egg starts here", body: "Start saving for the long term and watch your nest egg grow here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 18, 7, 0.12);
    p.rotate("z", -0.62); // turned to face us
    const arc = (r: number, z0: number, dz: number, y: number): V3[] => Array.from({ length: 25 }, (_, i) => {
      const a = (i / 24) * Math.PI;
      return [-Math.cos(a) * r, y, z0 + Math.sin(a) * dz];
    });
    // the back of the nest: the far rim as a lit band, the dark hollow inside it
    p.face(arc(NR, NZ, 4, -0.6), 0.2, 0);
    p.face(arc(NR - 2.6, NZ, 2.4, -0.5), 0.03, 0);
    // the egg, rocking on its bottom
    const rock = Math.sin(u * Math.PI * 2) * 0.1;
    const c = Math.cos(rock), sn = Math.sin(rock);
    const at = ([x, z]: [number, number], y: number): V3 => [x * c + z * sn, y, EB - x * sn + z * c];
    p.face(EGG.map(([x, z]) => at([x * 1.07, z * 1.05 - 0.4], -0.1)), 0.03, 0); // a dark rim round it
    p.face(EGG.map((q) => at(q, 0)), 0.45, 0);
    // the coin mark struck on it: a ring with a bar through it
    const m = at([-0.6, 13.6], 0.08);
    p.line(Array.from({ length: 29 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [m[0] + Math.cos(a) * 4.2, 0.08, m[2] + Math.sin(a) * 4.2] as V3; }), SH.edge, 1);
    p.line([[m[0], 0.08, m[2] - 2.4], [m[0], 0.08, m[2] + 2.4]], SH.edge, 1.1);
    // a glint runs over the top of the egg
    const g = (u * 1.5) % 1.5;
    if (g < 1) p.dot(at([-5 + g * 7, 21 + Math.sin(g * Math.PI) * 2], 0.1), 1.2 * Math.sin(g * Math.PI), 1);
    // the front of the nest: a deep lit bowl, its twigs woven in as crossing cuts
    const F = 0.6;
    const front: V3[] = [...Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI; return [-Math.cos(a) * NR, F, NZ - Math.pow(Math.sin(a), 0.45) * (NZ - 1)] as V3; }), [NR, F, NZ], [-NR, F, NZ]];
    p.face(front, 0.22, 0);
    const q = front.map((v) => p.pt(v));
    p.screen((gc) => {
      gc.beginPath(); q.forEach(([x, y], i) => (i ? gc.lineTo(x, y) : gc.moveTo(x, y))); gc.closePath(); gc.clip();
      gc.strokeStyle = "#000"; gc.lineWidth = 0.7; gc.lineCap = "round";
      const [ox, oy] = p.pt([0, F, NZ * 0.5]);
      for (let i = -4; i <= 4; i++) {
        gc.beginPath(); gc.moveTo(ox + i * 8 - 12, oy - 10); gc.lineTo(ox + i * 8 + 12, oy + 10); gc.stroke();
        gc.beginPath(); gc.moveTo(ox + i * 8 + 4 + 12, oy - 10); gc.lineTo(ox + i * 8 + 4 - 12, oy + 10); gc.stroke();
      }
    });
    // the rim: a thick lit lip over the front
    p.face([...arc(NR, NZ - 1.4, -1.2, F + 0.05), ...arc(NR, NZ + 1.2, 0.6, F + 0.05).reverse()], 0.3, 0);
    p.line(arc(NR - 0.2, NZ - 2.5, -1.2, F + 0.06), SH.edge, 0.7);
  },
};
