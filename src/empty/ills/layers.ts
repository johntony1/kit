// No layers: three sheets floating in a stack. They spread apart, showing each layer, then settle back together.
import { easeInOut, pulse, SH, type Illustration, type Pen } from "../dots";

const P = 4.4;
const W = 10.5, D = 8.5, T = 0.8;

function sheet(p: Pen, z: number, top: number) {
  p.box(-W, -D, z, W * 2, D * 2, T, { top, left: 0.12, right: 0.065 });
  if (!p.ink) p.line([[-W, D, z + T], [W, D, z + T], [W, -D, z + T]], SH.edge, 0.5);
}
function rect(p: Pen, x0: number, y0: number, x1: number, y1: number, z: number, fill: number) {
  p.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], fill, SH.edge, 0.55);
  if (!p.ink) p.line([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], SH.edge, 0.6);
}

export const layers: Illustration = {
  k: "layers", name: "Layers", title: "No layers yet", body: "Add a layer to start building up your design, one sheet at a time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const g = 1.6 + easeInOut(pulse(t, P, 0.4)) * 6.5; // the gap between sheets
    p.translate(0, 0, -11);
    p.shadow(0, 0, 28, 13, 0.12);
    const z0 = 0, z1 = g, z2 = g * 2;
    // dashed verticals tying the three sheets together
    const corner = (x: number, y: number) => p.guide([[x, y, z0 + T], [x, y, z2]]);
    corner(-W, -D);
    // the bottom sheet: a grid
    sheet(p, z0, 0.16);
    let Z = z0 + T + 0.02;
    for (let i = 1; i < 4; i++) p.line([[-W + (i * W) / 2, -D, Z], [-W + (i * W) / 2, D, Z]], SH.edge, 0.5);
    for (let i = 1; i < 3; i++) p.line([[-W, -D + (i * D * 2) / 3, Z], [W, -D + (i * D * 2) / 3, Z]], SH.edge, 0.5);
    corner(-W, D); corner(W, D); corner(W, -D);
    // the middle sheet: a text layer
    sheet(p, z1, 0.18);
    Z = z1 + T + 0.02;
    p.line([[-8, -5.6, Z], [1, -5.6, Z]], SH.edge, 1.1);
    for (let i = 0; i < 4; i++) p.line([[-8, -2.4 + i * 2, Z], [6 - (i % 2) * 4, -2.4 + i * 2, Z]], SH.edge, 0.6);
    // the top sheet: a picture with a sun and hills, and a picked frame
    sheet(p, z2, 0.22);
    Z = z2 + T + 0.02;
    rect(p, -8, -6.5, 3, 2.5, Z, 0.2);
    p.line([[-8, 0.5, Z], [-5, -2.4, Z], [-2.6, -0.6, Z], [-1, -2, Z], [3, 1.6, Z]], SH.edge, 0.7);
    p.line(Array.from({ length: 21 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [-4.6 + Math.cos(a) * 1.1, -4.4 + Math.sin(a) * 1.1, Z] as [number, number, number]; }), SH.edge, 0.6);
    rect(p, 4.8, 3.8, 8.2, 6.6, Z, 0.34);
    p.line([[-8, 5, Z], [2, 5, Z]], SH.edge, 0.6);
  },
};
