// No documents yet: a closed passport with a globe on its cover. Hover and the cover lifts on a photo page; an ID card slides out from inside.
import { SH, type Illustration, type Pen, type V3 } from "../dots";


/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
type Fills = { top: number; bottom: number; px: number; nx: number; py: number; ny: number };
/** a box under any rotation: draws only the faces that look at us. Returns which of top and bottom showed */
const solid = (p: Pen, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, f: Fills) => {
  const faces: [keyof Fills, V3[]][] = [
    ["top", [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    ["bottom", [[x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]]],
    ["px", [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
    ["nx", [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]]],
    ["py", [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
    ["ny", [[x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y0, z0]]],
  ];
  const seen = new Set<string>();
  for (const [k, pts] of faces) if (facing(p, pts) > 0.01) { p.face(pts, f[k], SH.edge, 0.5); seen.add(k); }
  return seen;
};
const loop = (c: V3, r: number, n = 28): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]] as V3; });

const W = 7.5, Q = 10.5, T = 1.7; // half width (x), half height (y), thickness of one half

export const passport: Illustration = {
  k: "passport", name: "Passport", title: "No documents yet", body: "Upload an ID or a document and it will be kept safe here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 0, -3);
    p.scale(1.55);
    p.shadow(0, 0, 21, 10, 0.12);
    // the back half and its pages, lying flat
    p.box(-W, -Q, 0, W * 2, Q * 2, T, { top: 0.22, left: 0.13, right: 0.065 });
    for (const z of [0.6, 1.15]) {
      p.line([[-W + 0.4, Q + 0.03, z], [W, Q + 0.03, z], [W + 0.03, -Q + 0.4, z]], SH.edge, 0.4); // page edges
    }
    // the photo page inside: a portrait in a frame and lines of details
    const z = T + 0.02;
    p.line([[-W + 1.6, -Q + 2, z], [-W + 1.6, -1, z], [-0.6, -1, z], [-0.6, -Q + 2, z], [-W + 1.6, -Q + 2, z]], SH.edge, 0.6);
    p.line(loop([-W / 2 + 0.5, -Q + 5, z], 1.4), SH.edge, 0.6);
    for (const y of [1.6, 3.8, 6, 8.2]) p.line([[-W + 1.6, y, z], [y > 7 ? 1 : W - 1.6, y, z]], SH.edge, 0.6);
    // the ID card, tucked between the halves, sliding out to the right
    p.push();
    p.translate(-1 + h * 8, -Q + 4 + h * 1, T);
    p.box(0, 0, 0, 10, 7, 0.5, { top: 0.26, left: 0.13, right: 0.07, edge: 0 });
    p.line([[1, 1.2, 0.53], [3.8, 1.2, 0.53], [3.8, 5.6, 0.53], [1, 5.6, 0.53], [1, 1.2, 0.53]], SH.edge, 0.55);
    for (const y of [2, 3.6, 5.2]) p.line([[5, y, 0.53], [y > 5 ? 7 : 9, y, 0.53]], SH.edge, 0.55);
    p.pop();
    // the cover, hinged along the far edge, lifting a little on hover
    const a = h * 0.32;
    p.push();
    p.rotate("x", a, [0, -Q, T + 0.5]);
    const seen = solid(p, -W, -Q, T + 0.5, W, Q, T * 2 + 0.5, { top: 0.22, bottom: 0.1, px: 0.065, nx: 0.065, py: 0.14, ny: 0.065 });
    if (seen.has("py")) for (const zz of [T + 1.1, T + 1.6]) p.line([[-W + 0.4, Q + 0.03, zz], [W - 0.2, Q + 0.03, zz]], SH.edge, 0.4);
    if (seen.has("top")) {
      // the cover: a globe emblem and the title above and below it
      const zt = T * 2 + 0.52;
      p.line(loop([0, 0.5, zt], 3.8), SH.edge, 0.8);
      p.line(Array.from({ length: 29 }, (_, i) => { const b = (i / 28) * Math.PI * 2; return [Math.cos(b) * 1.7, 0.5 + Math.sin(b) * 3.8, zt] as V3; }), SH.edge, 0.6);
      p.line([[-3.8, 0.5, zt], [3.8, 0.5, zt]], SH.edge, 0.6);
      p.line([[-W + 2.5, -Q + 3, zt], [W - 2.5, -Q + 3, zt]], SH.edge, 1.1);
      p.line([[-W + 3.5, Q - 3.2, zt], [W - 3.5, Q - 3.2, zt]], SH.edge, 0.8);
      p.line([[-1.8, Q - 1.8, zt], [1.8, Q - 1.8, zt]], SH.edge, 0.8);
    }
    p.pop();
  },
};
