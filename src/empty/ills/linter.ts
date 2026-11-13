// No warnings: a page of code standing up, a wavy underline under one line and a big warning triangle leaning on its corner. Hover and the triangle hops forward and the underline wriggles.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
const at = (o: P2[], y: number): V3[] => o.map(([x, z]) => [x, y, z]);
// a slab standing up and facing us: the outline (x, z) at depth y, pushed back by T; the rim that shows, then the front
function slab(p: Pen, o: P2[], y: number, T: number, front: number) {
  const F = at(o, y), B = at(o, y - T), s = area(p, F);
  for (let i = 0; i < o.length; i++) {
    const j = (i + 1) % o.length, q = [F[i], F[j], B[j], B[i]];
    if (area(p, q) * s < 0) p.face(q, Math.abs(o[j][0] - o[i][0]) > Math.abs(o[j][1] - o[i][1]) ? 0.12 : 0.05, 0);
  }
  p.face(F, front, 0);
}
// a rounded rectangle in the (x, z) plane
const rr = (x0: number, z0: number, x1: number, z1: number, r: number): P2[] => {
  const o: P2[] = [];
  const arc = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (i / 5) * Math.PI / 2; o.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  arc(x1 - r, z0 + r, -Math.PI / 2); arc(x1 - r, z1 - r, 0); arc(x0 + r, z1 - r, Math.PI / 2); arc(x0 + r, z0 + r, Math.PI);
  return o;
};
// a dark bar cut into a face standing at depth y: a line of text
const bar = (p: Pen, x0: number, x1: number, z: number, hh: number, y: number) => p.clear([[x0, y, z - hh], [x1, y, z - hh], [x1, y, z + hh], [x0, y, z + hh]]);

const tri = (g: number): P2[] => [[8 - g * 1.6, 15 - g], [32 + g * 1.6, 15 - g], [20, 36 + g * 1.8]];

export const linter: Illustration = {
  k: "linter", name: "Linter", title: "No warnings", body: "Your code is clean. Anything the linter flags will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-8, 0, -16);
    p.shadow(4, 2, 28, 12, 0.12);
    p.rotate("z", -0.6);
    // the page
    slab(p, rr(-14, 0, 14, 33, 2.4), 0, 2, 0.3);
    const f = 0.05;
    const lines: [number, number, number][] = [[-11, 0, 29], [-8, 2, 25.5], [-8, 1, 22], [-5, 9, 18.5], [-8, 6, 15], [-11, 4, 11.5], [-11, -3, 8], [-8, 5, 4.5]];
    for (const [a, b, z] of lines) bar(p, a, b, z, 0.7, f);
    // the wavy underline under the flagged line
    const w = h * Math.sin(t * 5) * 0.4;
    p.line(Array.from({ length: 15 }, (_, i) => [-5 + i, f, 16.8 + ((i % 2) * 2 - 1) * (0.7 + w)] as V3), 1, 0.9);
    // the warning triangle, in front of the page's lower right corner
    const b = Math.max(0, (h - 0.15) / 0.85), hop = b > 0 ? Math.sin(Math.min(1, b / 0.7) * Math.PI) * 4 : 0;
    p.push();
    p.translate(0, 2 + 3 * Math.min(1, b * 1.5), hop);
    p.clear(at(tri(1.7), 0));
    slab(p, tri(0), 0, 2.4, 0.3);
    p.clear([[18.8, 0.05, 22.6], [21.2, 0.05, 22.6], [20.9, 0.05, 30], [19.1, 0.05, 30]]);
    p.clear([[18.8, 0.05, 17.8], [21.2, 0.05, 17.8], [21.2, 0.05, 20.2], [18.8, 0.05, 20.2]]);
    p.pop();
  },
};
