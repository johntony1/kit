// No suggestions yet: a rounded text field standing up, a short word typed and a caret after it, a suggestion pill tucked behind. Hover and the pill drops out below the field, lights up and settles with a bounce.
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

export const autocomplete: Illustration = {
  k: "autocomplete", name: "Autocomplete", title: "No suggestions yet", body: "Start typing and suggestions will show up here as you go.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = Math.min(1, h * 1.3);
    // the drop: down past its place, a little bounce back, rest
    const d = k < 0.6 ? easeInOut(k / 0.6) * 1.12 : 1.12 - 0.12 * easeInOut((k - 0.6) / 0.4);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 28, 12, 0.12);
    p.rotate("z", -0.6);
    // the suggestion pill, behind the field at rest
    p.push();
    p.translate(2.5, 0, 9 - 9 * d);
    const lit = k > 0.35;
    if (lit) p.clear(at(rr(-17.1, 0.9, 11.1, 12.1, 5.6), -2.5));
    slab(p, rr(-16, 2, 10, 11, 4.5), -2.5, 2, lit ? 0.3 : 0.12);
    bar(p, -12, 1, 6.5, 1.1, -2.45);
    p.clear([[4, -2.45, 4.5], [7, -2.45, 6.5], [4, -2.45, 8.5]]); // the accept arrow
    p.pop();
    // the field: a lit pill with a word and the caret
    p.clear(at(rr(-20.1, 14.9, 20.1, 29.1, 7.1), 0));
    slab(p, rr(-19, 16, 19, 28, 6), 0, 2.4, 0.3);
    bar(p, -14, -4, 22, 1.2, 0.05);
    if (h < 0.05 || Math.sin(t * 7) > -0.2) p.clear([[-2.4, 0.05, 18.8], [-1.2, 0.05, 18.8], [-1.2, 0.05, 25.2], [-2.4, 0.05, 25.2]]);
  },
};
