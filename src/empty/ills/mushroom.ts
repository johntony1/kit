// Nothing sprouted yet: a big spotted toadstool on a thick stem. Hover and its cap bounces while a baby mushroom pops up beside it.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const D = 2.6; // thickness
const R = 17, HC = 13, ZC = 14; // cap half width, cap height, height of the cap's rim
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const overshoot = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));
const circle = (cx: number, cz: number, r: number, n = 20): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });

/** a mushroom of scale k with its foot at x0: stem, gills, then the cap; sq squashes the cap */
function shroom(p: Pen, x0: number, k: number, sq: number, spots: boolean) {
  const X = (x: number) => x0 + x * k, Z = (z: number) => z * k;
  const stem: P2[] = [[X(-4.6), Z(0)], [X(4.6), Z(0)], [X(3.6), Z(ZC + 1)], [X(-3.6), Z(ZC + 1)]];
  const capH = HC * (1 - 0.14 * sq), capR = R * (1 + 0.08 * sq);
  const cap: P2[] = [
    ...Array.from({ length: 31 }, (_, i) => { const a = (i / 30) * Math.PI; return [X(Math.cos(a) * capR), Z(ZC + Math.sin(a) * capH)] as P2; }),
    ...Array.from({ length: 11 }, (_, i) => { const s = i / 10; return [X(-capR + 2 * capR * s), Z(ZC - 2.4 * Math.sin(Math.PI * s))] as P2; }),
  ];
  // the backs, shaded
  for (let y = -D * k; y < 0; y += 0.45) { p.face(at(stem, y), 0.06, 0); p.face(at(cap, y), 0.08, 0); }
  // the stem: lit on the left, shaded on the right
  p.face(at(stem), 0.24, 0);
  p.face(at([[X(1.8), Z(0)], [X(4.6), Z(0)], [X(3.6), Z(ZC + 1)], [X(1.4), Z(ZC + 1)]], 0.02), 0.09, 0);
  // the dark underside of the cap, then the cap
  p.face(at(Array.from({ length: 21 }, (_, i) => { const s = i / 20; return [X(-capR * 0.9 + 1.8 * capR * 0.9 * s), Z(ZC - 2.4 * Math.sin(Math.PI * s) - 0.6)] as P2; }).concat([[X(capR * 0.9), Z(ZC + 1)], [X(-capR * 0.9), Z(ZC + 1)]]), 0.03), 0.04, 0);
  p.face(at(cap, 0.05), 0.28, 0);
  // the cap's shaded right side
  const sh: P2[] = [];
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * 1.1; sh.push([X(Math.cos(a) * capR), Z(ZC + Math.sin(a) * capH)]); }
  for (let i = 14; i >= 0; i--) { const a = (i / 14) * 1.1; sh.push([X(Math.cos(a) * capR * 0.72), Z(ZC + Math.sin(a) * capH * 0.72)]); }
  p.face(at(sh, 0.07), 0.1, 0);
  // the spots: dark rounds on the cap
  if (spots) for (const [x, z, r] of [[-8.5, 4.5, 2.6], [-1, 9, 2.4], [4.5, 3.6, 2], [-6, 10.5, 1.4], [9, 7.4, 1.5]]) p.face(at(circle(X(x), Z(ZC + z * (1 - 0.14 * sq)), r * k), 0.1), 0.03, 0);
}

export const mushroom: Illustration = {
  k: "mushroom", name: "Mushroom", title: "Nothing sprouted yet", body: "Nothing has come up so far. New things will pop up here as they grow.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 18, 7.5, 0.1);
    p.rotate("z", -0.6); // turned to face us
    const b = clamp(h / 0.5);
    const sq = Math.sin(Math.PI * b) * (1 - b) * 2.2 + h * Math.sin(t * 3) * 0.05;
    shroom(p, -3, 1, sq, true);
    // the baby pops up beside it, in front
    const k = overshoot(clamp((h - 0.35) / 0.45));
    if (k > 0.02) { p.push(); p.translate(0, 3, 0); shroom(p, 12, 0.42 * k, 0, false); p.pop(); }
  },
};
