// No documents yet: a passport lying a little open. Hover and it opens flat on a photo page; an ID card slides out beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 15, Q = 10.5, T = 2.4; // page width (x), half height (y), thickness of one half

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

export const passport: Illustration = {
  k: "passport", name: "Passport", title: "No documents yet", body: "Upload an ID or a document and it will be kept safe here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-5.5, -3, -3);
    p.scale(1.08, [5, 3, 3]);
    p.shadow(0, 2, 30, 13, 0.12);
    // the ID card, tucked under the passport, sliding out to the front right
    p.push();
    p.translate(2 + h * 11, -6 + h * 9, 0);
    p.rotate("z", -h * 0.35, [5, 7, 0]);
    p.box(0, 0, 0, 10, 14, 0.7, { top: 0.24, left: 0.13, right: 0.07 });
    p.line([[2, 2, 0.75], [8, 2, 0.75], [8, 6.5, 0.75], [2, 6.5, 0.75], [2, 2, 0.75]], SH.edge, 0.65); // photo
    p.line(loop([5, 4.1, 0.75], 1.1, 16), SH.edge, 0.6);
    for (const y of [8.6, 10.4, 12.2]) p.line([[2, y, 0.75], [y > 12 ? 5.5 : 8, y, 0.75]], SH.edge, 0.6);
    p.pop();
    // the right half: back cover and pages, lying flat
    p.box(0, -Q, 0, P, Q * 2, T, { top: 0.22, left: 0.13, right: 0.065 });
    // its page: a stamp and lines of text
    p.line(loop([P - 4.6, -Q + 5, T + 0.02], 2.8), SH.edge, 0.7);
    p.line(loop([P - 4.6, -Q + 5, T + 0.02], 1.2), SH.edge, 0.6);
    for (const y of [-Q + 3, -Q + 5.5, -Q + 8, 0.5, 3, 5.5, 8]) p.line([[2.5, y, T + 0.02], [y < -2 ? 7 : y > 7 ? 8 : P - 2.5, y, T + 0.02]], SH.edge, 0.65);
    // the left half: hinged on the spine, lifted a little at rest and opened flat on hover
    const a = (Math.PI - 0.15) * (1 - h);
    p.push();
    p.rotate("y", a, [0, 0, T]);
    const seen = solid(p, -P, -Q, 0, 0, Q, T, { top: 0.22, bottom: 0.24, px: 0.13, nx: 0.065, py: 0.13, ny: 0.065 });
    if (seen.has("top")) {
      // the photo page: a portrait on a dark square, and the holder's details beside it
      const z = T + 0.02;
      const px0 = -P + 2, px1 = -P + 8.5, py0 = -0.5, py1 = Q - 2, cx = (px0 + px1) / 2;
      p.line([[px0, py0, z], [px1, py0, z], [px1, py1, z], [px0, py1, z], [px0, py0, z]], SH.edge, 0.7);
      p.line(loop([cx, py0 + 3.8, z], 1.7), SH.edge, 0.7); // head
      p.line(Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [cx - Math.cos(a) * 2.6, py1 - 0.3 - Math.sin(a) * 2.6, z] as V3; }), SH.edge, 0.7); // shoulders
      for (const y of [0, 2.6, 5.2, 7.6]) p.line([[-P + 10.5, y, z], [y > 7 ? -5 : -2, y, z]], SH.edge, 0.65);
      for (const y of [-Q + 3, -Q + 5.6]) p.line([[-P + 2, y, z], [y > -6 ? -6 : -2, y, z]], SH.edge, 0.8);
    }
    if (seen.has("bottom")) {
      // the cover: an emblem and the title
      const z = -0.03;
      p.line(loop([-P / 2, 0.5, z], 3.6), SH.edge, 0.75);
      p.line([[-P / 2 - 3.6, 0.5, z], [-P / 2 + 3.6, 0.5, z]], SH.edge, 0.6);
      p.line([[-P / 2, -3.1, z], [-P / 2, 4.1, z]], SH.edge, 0.6);
      p.line([[-P + 3.5, -Q + 3, z], [-3.5, -Q + 3, z]], SH.edge, 0.8);
      p.line([[-P + 5, Q - 3, z], [-5, Q - 3, z]], SH.edge, 0.7);
    }
    p.pop();
  },
};
