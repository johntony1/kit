// Paintbrush: a flat paintbrush resting at the end of a short stroke of paint. Hover and it drags back, laying down a long curving stroke.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X1 = 17; // where the stroke begins
const yc = (x: number) => 2.4 * Math.sin((x - 2) * 0.2); // the stroke's curve

export const paintbrush: Illustration = {
  k: "paintbrush", name: "Paintbrush", title: "No artwork yet", body: "Start a new piece and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const xt = 7 - 12 * ease(h) + h * Math.sin(t * 2) * 0.4; // the tip of the brush
    p.translate(3, 0, -9);
    p.shadow(-2, 0, 30, 13, 0.1);
    // the stroke: a lit band from where it began to the brush, ragged where it started
    const up: V3[] = [], dn: V3[] = [];
    for (let i = 0; i <= 24; i++) { const x = xt - 0.5 + ((X1 - xt + 0.5) * i) / 24; up.push([x, yc(x) - 4.4, 0.05]); dn.push([x, yc(x) + 4.4, 0.05]); }
    const y1 = yc(X1);
    p.face([...up, [X1 + 2, y1 - 3, 0.05], [X1 + 0.4, y1 - 1.6, 0.05], [X1 + 2.8, y1, 0.05], [X1 + 0.6, y1 + 1.8, 0.05], [X1 + 2.2, y1 + 3.2, 0.05], ...dn.reverse()], 0.2, 0);
    // the brush: its tip on the paint, its handle up and away
    p.translate(xt, yc(xt), 1.2);
    p.rotate("y", 0.72);
    // the handle, tapering, with a hole to hang it by
    p.face([[-12, 3, -1.2], [-12, 3, 1.2], [-29, 1.9, 1.2], [-29, 1.9, -1.2]], 0.12, 0);
    p.face([[-12, -3, 1.2], [-12, 3, 1.2], [-29, 1.9, 1.2], [-29, -1.9, 1.2]], 0.2, SH.edge, 0.5);
    p.dot([-26.4, 0, 1.25], 1, 0);
    // the metal ferrule and the bristles
    p.box(-12.5, -4.8, -1.5, 4.5, 9.6, 3, { top: 0.36, left: 0.3, right: 0.2, lw: 0.6 });
    p.line([[-10.6, -4.8, 1.52], [-10.6, 4.8, 1.52]], SH.edge, 0.5);
    p.box(-8, -4.5, -1.2, 8, 9, 2.4, { top: 0.075, left: 0.06, right: 0.04, edge: 0 });
    for (const y of [-2.2, 0, 2.2]) p.line([[-7.4, y, 1.22], [-0.6, y, 1.22]], SH.edge, 0.35);
  },
};
