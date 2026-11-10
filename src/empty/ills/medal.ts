// No awards yet: a medal on a crossed ribbon, hanging from a little stand. It swings gently from side to side, a glint crossing its face.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2;
const TOP = 27; // height of the crossbar
const MZ = 9.5, MR = 6.2; // medal centre height and radius

const disc = (cx: number, y: number, cz: number, r: number, n = 40): V3[] =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
const star = (cx: number, cz: number, y: number, R: number, r: number): V3[] =>
  Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });

export const medal: Illustration = {
  k: "medal", name: "Medal", title: "No awards yet", body: "Hit your goals and the medals you earn will hang here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -15);
    p.scale(1.05, [0, 0, 14]);
    p.shadow(-7, 0, 14, 8, 0.1); p.shadow(7, 0, 14, 8, 0.1);
    // the stand: a base, a post each side and a bar across
    p.box(-13.5, -3.5, 0, 27, 7, 2, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    p.box(-12.6, -0.8, 2, 1.6, 1.6, TOP - 2, { top: 0.22, left: 0.13, right: 0.07, lw: 0.55 });
    p.box(-12.6, -0.8, TOP, 25.2, 1.6, 1.6, { top: 0.22, left: 0.13, right: 0.07, lw: 0.55 });
    // the medal and its ribbon swing about the bar
    const a = 0.2 * Math.sin(u * Math.PI * 2);
    p.push();
    p.rotate("y", a, [0, 0, TOP]);
    const y = 1;
    // the ribbon: two straps crossing into a V, the back one darker
    p.face([[2.2, y - 0.2, TOP], [5.6, y - 0.2, TOP], [1.3, y - 0.2, MZ + MR - 1], [-1.6, y - 0.2, MZ + MR - 0.4]], 0.13, SH.edge, 0.6);
    p.face([[-5.6, y, TOP], [-2.2, y, TOP], [1.6, y, MZ + MR - 0.4], [-1.3, y, MZ + MR - 1]], 0.24, SH.edge, 0.6);
    // stripes down the front strap
    p.line([[-3.9, y + 0.03, TOP - 0.2], [0.15, y + 0.03, MZ + MR - 0.6]], SH.edge, 0.6);
    // the medal: a darker rim behind, the lit face, an inner ring and a star
    p.face(disc(0, y - 1.3, MZ, MR), SH.right, 0);
    p.face(disc(0, y + 0.2, MZ, MR), 0.22, SH.edge, 0.6);
    p.face(disc(0, y + 0.23, MZ, MR - 1.5), 0.04, SH.edge, 0.6);
    p.face(star(0, MZ, y + 0.25, 3.6, 1.5), 0.34, SH.edge, 0.6);
    p.pop();
    // the post in front, drawn over the swinging medal
    p.box(11, -0.8, 2, 1.6, 1.6, TOP - 2, { top: 0.22, left: 0.13, right: 0.07, lw: 0.55 });
    // a glint at the far end of each swing
    const gl = Math.pow(Math.abs(Math.sin(u * Math.PI * 2)), 8);
    if (gl > 0.3) {
      const sgn = Math.sin(u * Math.PI * 2) > 0 ? 1 : -1;
      p.dot([sgn * 7.5, 2, MZ + 7.5], 0.4 + 0.4 * gl, 1);
    }
  },
};
