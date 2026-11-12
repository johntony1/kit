// Fork and knife: a plate seen from above, a fork on its left and a knife on its right. Hover and they hop, one after the other.
import { type Illustration, type Pen, type V3 } from "../dots";

// a flat piece of metal lying on the table: a shaded underside and a lit top
function flat(p: Pen, pts: [number, number][], fill: number) {
  p.face(pts.map(([x, y]) => [x, y, 0] as V3), 0.05, 0);
  p.face(pts.map(([x, y]) => [x, y, 0.9] as V3), fill, 0);
}

export const cutlery: Illustration = {
  k: "cutlery", name: "Fork and knife", title: "No tables booked", body: "Book a table and the reservation will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const hop = (k: number) => Math.sin(Math.PI * Math.max(0, Math.min(1, k))) * 3.2;
    p.translate(0, 0, -2);
    p.shadow(0, 0, 30, 14, 0.08);
    // the table tipped toward us, so we look down on it
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.25);
    p.scale(1.1);
    // the plate: a lit rim round a shallow well
    p.disc(0, 0, 0, 12.5, 0.065);
    p.disc(0, 0, 1.2, 12.5, 0.2);
    p.disc(0, 0, 1.25, 8.8, 0.1);
    p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * 8.8, Math.sin(a) * 8.8, 1.27] as V3; }), 1, 0.8);
    // the fork on the left: three tines, a head, a neck and a handle
    p.push();
    p.translate(-18.5, 0, hop(h * 1.8));
    for (const x of [-2.5, 0, 2.5]) flat(p, [[x - 0.7, -14], [x + 0.7, -14], [x + 0.7, -6.5], [x - 0.7, -6.5]], 0.22);
    flat(p, [[-3.2, -7], [3.2, -7], [3.2, -4.5], [1.1, -0.5], [1.4, 14], [-1.4, 14], [-1.1, -0.5], [-3.2, -4.5]], 0.22);
    p.pop();
    // the knife on the right: a blade with a curved edge and a darker handle
    p.push();
    p.translate(18.5, 0, hop(h * 1.8 - 0.75));
    flat(p, [[1.7, -14], [0.1, -13.2], [-1.5, -10.5], [-2, -7], [-2, 1.5], [1.7, 1.5]], 0.22);
    flat(p, [[-1.4, 1.5], [1.7, 1.5], [1.7, 14], [-1.4, 14]], 0.11);
    p.pop();
  },
};
