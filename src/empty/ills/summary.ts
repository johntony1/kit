// Nothing to summarise: a tall page standing up, full of lines, a sparkle on its corner. Hover and the page squeezes down into a short card of three bold lines while the sparkle swells.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

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
// a four point sparkle in the (x, z) plane
const star = (cx: number, cz: number, r: number, y: number): V3[] => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, q = i % 2 ? r * 0.3 : r; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });

const ends = [9, 11, 4, 10, 12, 6, 9, 1], bold = [10, 5, -1];

export const summary: Illustration = {
  k: "summary", name: "Summary", title: "Nothing to summarise", body: "Open a document, a call or a thread and a short summary will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.25));
    const H = 37 - 20 * k;
    p.translate(-2, 0, -17);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", -0.6);
    slab(p, rr(-14, 0, 14, H, 2.2), 0, 2.2, 0.3);
    // eight thin lines draw together into three bold ones
    for (let i = 0; i < 8; i++) {
      const j = Math.floor((i * 3) / 8);
      const z0 = 37 - 5 - i * 4, z1 = 17 - 5 - j * 4.4;
      const z = z0 + (z1 - z0) * k, hh = 0.6 + 0.65 * k, x1 = ends[i] + (bold[j] - ends[i]) * k;
      bar(p, -10.5, x1, z, hh, 0.05);
    }
    // the sparkle on the corner, swelling and twinkling while hovered
    const r = 5 + 2.6 * k + h * Math.sin(t * 5) * 0.4;
    p.clear(star(13, H + 1, r + 1.4, 1.5));
    p.face(star(13, H + 1, r, 1.5), 0.45, 0);
    p.face(star(6.8, H + 5.6, 1.8 + 0.8 * k, 1.5), 0.45, 0);
  },
};
