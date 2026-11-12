// No meals logged: an empty plate with a fork and a knife beside it. Hover and the cutlery closes in while a fried egg drops onto the plate.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// floor point from screen axes: u runs right, v runs towards us
const W = (u: number, v: number, z = 0.3): V3 => [(v + u) * 0.7071, (v - u) * 0.7071, z];
const bar = (u0: number, u1: number, v0: number, v1: number): V3[] => [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
// height above the plate: a drop, a bounce, rest
function drop(k: number) {
  if (k <= 0) return 30;
  if (k < 0.55) return 30 * (1 - Math.pow(k / 0.55, 2));
  if (k < 0.85) { const v = (k - 0.55) / 0.3; return 3 * 4 * v * (1 - v); }
  return 0;
}

export const nutrition: Illustration = {
  k: "nutrition", name: "Plate", title: "No meals logged", body: "Log what you eat and your meals for the day will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -3);
    p.scale(1.1);
    p.shadow(0, 0, 31, 14, 0.1);
    const s = 2.4 * ease(Math.min(1, h * 2));
    // the fork on the left: a handle, a neck and three tines
    const uf = -22 + s;
    p.face(bar(uf - 0.8, uf + 0.8, 0, 12.5), 0.24, SH.edge, 0.5);
    p.face(bar(uf - 2.1, uf + 2.1, -3.6, 0), 0.24, SH.edge, 0.5);
    for (const du of [-1.6, 0, 1.6]) p.face(bar(uf + du - 0.5, uf + du + 0.5, -10.5, -3.6), 0.24, SH.edge, 0.4);
    // the knife on the right: a handle and a blade
    const uk = 22 - s;
    p.face([W(uk - 1, 0.5), W(uk + 1.6, 0.5), W(uk + 1.8, -6.5), W(uk + 0.7, -10.5), W(uk - 1, -10.5)], 0.24, SH.edge, 0.5);
    p.face(bar(uk - 0.8, uk + 0.8, 0.5, 12.5), 0.12, SH.edge, 0.5);
    // the plate: a bright rim round a shallow, darker well
    p.cylinder(0, 0, 0, 15.5, 1.5, { side: 0.1, top: 0.22, lw: 0.6 });
    p.disc(0, 0, 1.53, 10.6, 0.04, SH.edge);
    // the egg: drops in, bounces and settles
    const k = Math.max(0, (h - 0.12) / 0.88);
    if (k > 0.01) {
      p.push();
      p.translate(0, 0, 1.6 + drop(k));
      const white = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2, r = 6.6 + 1.2 * Math.sin(a * 3 + 1) + 0.6 * Math.sin(a * 5); return [Math.cos(a) * r, Math.sin(a) * r, 0] as V3; });
      p.face(white, 0.34, SH.edge, 0.6);
      p.cylinder(-0.8, 0.6, 0, 2.7, 0.9, { side: 0.1, top: 0.12, lw: 0.7 });
      p.pop();
    }
  },
};
