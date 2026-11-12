// Cheese wedge: a wedge of holey cheese with one slice cut at its wide end. Hover and the slice slides away, and a few crumbs pop out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const H = 10.5, X0 = -15, X1 = 8, YF = 8, YB = -9; // height, the tip, the wide end, front and back
// the holes on the cut end, shared by the wedge and the slice: y, z, radius
const END: [number, number, number][] = [[-3, 6, 2], [3.6, 3.4, 1.3]];
const endHoles = (p: Pen, x: number) => { for (const [y, z, r] of END) p.ringV("x", [x + 0.03, y, z], r, 0.03, 0); };

export const cheese: Illustration = {
  k: "cheese", name: "Cheese wedge", title: "No dairy yet", body: "Milk, cheese and yoghurt you add will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(seg(h, 0, 0.7));
    p.translate(-2 - 2 * k, 0, -7);
    p.scale(1.15);
    p.shadow(1 + 2 * k, 0, 25 + 3 * k, 12.5, 0.11);
    // the wedge: a lit triangle on top, a long holed front, the cut end
    p.face([[X0, YF, 0], [X1, YF, 0], [X1, YF, H], [X0, YF, H]], 0.2, SH.edge, 0.6);
    p.face([[X1, YB, 0], [X1, YF, 0], [X1, YF, H], [X1, YB, H]], 0.1, SH.edge, 0.6);
    p.face([[X0, YF, H], [X1, YF, H], [X1, YB, H]], 0.32, SH.edge, 0.6);
    for (const [x, z, r] of [[-3.6, 5.6, 2.4], [3.6, 3.2, 1.6], [4.6, 8, 1.1], [-9.6, 3.4, 1.3]]) p.ringV("y", [x, YF + 0.03, z], r, 0.03, 0);
    for (const [x, y, r] of [[3.4, 0.6, 2.2], [-3, 5, 1.3], [5.6, -4.6, 1.1]]) p.disc(x, y, H + 0.02, r, 0.03, 0);
    endHoles(p, X1);
    // the slice: a slab off the wide end, sliding away along the floor
    const g = 1 + 6.5 * k;
    p.box(X1 + g, YB, 0, 2.8, YF - YB, H, { top: 0.32, left: 0.2, right: 0.1, lw: 0.6 });
    endHoles(p, X1 + g + 2.8);
    // crumbs hop out of the gap
    const c = seg(h, 0.45, 1);
    if (c > 0) ([[X1 + 3, YF + 4, 0], [X1 + 5.4, YF + 1.6, 0], [X1 + 1.6, YF + 7, 0]] as V3[]).forEach(([x, y], i) => {
      const hop = Math.abs(Math.sin(t * 4 + i * 1.3)) * 1.6 * h;
      p.box(x, y, hop, 1.5 * c, 1.5 * c, 1.5 * c, { top: 0.4, left: 0.3, right: 0.16, edge: 0 });
    });
  },
};
