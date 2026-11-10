// No tables yet: two linked tables on the floor, a third hovering over its dashed spot. Hover and it lands and the link reaches it.
import { SH, type Illustration, type Pen } from "../dots";

const TW = 12, TD = 9, TH = 2.4; // a table: width (x), depth (y), thickness
const A: [number, number] = [-22, -3.5]; // back corners of each table
const B: [number, number] = [3, -15];
const C: [number, number] = [3, 4];
const LIFT = 9;

/** a table: a lit slab, a dense header band, rows and a column split cut in */
function table(p: Pen, x: number, y: number, z: number, rows = 3) {
  p.box(x, y, z, TW, TD, TH, { top: SH.top });
  const t = z + TH + 0.02;
  p.face([[x + 0.6, y + 0.6, t], [x + TW - 0.6, y + 0.6, t], [x + TW - 0.6, y + 2.6, t], [x + 0.6, y + 2.6, t]], SH.left, 0);
  for (let r = 0; r < rows; r++) {
    const ry = y + 4 + r * 1.75;
    p.line([[x + 1.3, ry, t], [x + 3.4, ry, t]], SH.edge, 0.6);
    p.line([[x + 5, ry, t], [x + TW - 1.6 - (r % 2) * 2, ry, t]], SH.edge, 0.6);
  }
}

/** a link: a low lit rail along the floor, through the given corners */
function link(p: Pen, pts: [number, number][]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const xa = Math.min(x0, x1) - 0.6, ya = Math.min(y0, y1) - 0.6;
    p.box(xa, ya, 0, Math.abs(x1 - x0) + 1.2, Math.abs(y1 - y0) + 1.2, 0.9, { top: SH.top });
  }
}

export const schema: Illustration = {
  k: "schema", name: "Linked tables", title: "No tables yet", body: "Create a table to start shaping your data. Relations between them show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const land = Math.min(1, h * 1.4), k = land * land * (3 - 2 * land);
    const reach = Math.max(0, Math.min(1, (h - 0.65) / 0.35)); // the link grows once it is down
    const zc = LIFT * (1 - k) + Math.sin(t * 2.2) * 0.5 * (1 - k);
    p.translate(4.5, 4, -5);
    p.shadow(A[0] + TW / 2, A[1] + TD / 2, TW + 4, 6, 0.12);
    p.shadow(B[0] + TW / 2, B[1] + TD / 2, TW + 4, 6, 0.12);
    p.shadow(C[0] + TW / 2, C[1] + TD / 2, TW + 4, 6, 0.1);
    // B sits furthest back, then the A to B link, then A
    table(p, B[0], B[1], 0);
    link(p, [[A[0] + TW, A[1] + 3], [-3, A[1] + 3], [-3, B[1] + 5], [B[0], B[1] + 5]]);
    table(p, A[0], A[1], 0, 2);
    // the B to C link: drawn as far as it has reached
    const y0 = B[1] + TD, y1 = C[1];
    p.guide([[B[0] + 6, y0, 0.9], [B[0] + 6, y1, 0.9]]);
    if (reach > 0.02) link(p, [[B[0] + 6, y0], [B[0] + 6, y0 + (y1 - y0) * reach]]);
    // the link's head: an accent stud that rides out to C
    p.cylinder(B[0] + 6, y0 + 0.6 + (y1 - y0 - 1.2) * reach, 0.9, 1.3, 0.9, { top: 0.32, side: SH.left });
    // C's dashed spot on the floor, and its drop lines
    p.guide([[C[0], C[1], 0], [C[0] + TW, C[1], 0], [C[0] + TW, C[1] + TD, 0], [C[0], C[1] + TD, 0], [C[0], C[1], 0]], true);
    if (k < 0.98) for (const [x, y] of [[C[0] + TW, C[1]], [C[0] + TW, C[1] + TD], [C[0], C[1] + TD]]) p.guide([[x, y, zc], [x, y, 0]]);
    table(p, C[0], C[1], zc);
  },
};
