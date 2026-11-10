// No transfers yet: a ledger standing on end. Arrows fly in on the left, pass through it and leave on the right.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const BW = 10, BT = 3.4, BH = 27; // half width (x), half thickness (y), height
const AZ = 11; // the height the arrows fly at
const PERIOD = 3.6, N = 3, Y0 = 30; // arrows travel from y = Y0 to y = -Y0

/** keep the part of a convex polygon with lo <= y <= hi */
function clipY(pts: V3[], lo: number, hi: number): V3[] {
  const cut = (poly: V3[], keep: (v: V3) => boolean, at: number) => {
    const out: V3[] = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ka = keep(a), kb = keep(b);
      if (ka) out.push(a);
      if (ka !== kb) { const k = (at - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * k, at, a[2] + (b[2] - a[2]) * k]); }
    }
    return out;
  };
  return cut(cut(pts, (v) => v[1] >= lo, lo), (v) => v[1] <= hi, hi);
}

/** one flat arrow pointing at -y with its tip at y = c, only the slice between lo and hi */
function arrow(p: Pen, c: number, lo: number, hi: number, k: number) {
  const z = AZ, T = 1.1; // thickness
  const shaft = (zz: number): V3[] => [[-1.4, c + 5, zz], [1.4, c + 5, zz], [1.4, c + 13, zz], [-1.4, c + 13, zz]];
  const head = (zz: number): V3[] => [[0, c, zz], [3.6, c + 5.2, zz], [-3.6, c + 5.2, zz]];
  for (const [part, side] of [[shaft, 0.065], [head, 0.065]] as const) {
    // the underside peeks out as a thin sparse edge, then the lit top
    const lo3 = clipY(part(z - T), lo, hi), hi3 = clipY(part(z), lo, hi);
    if (lo3.length > 2) p.face(lo3.map(([x, y, zz]) => [x + 0.5, y, zz] as V3), side * k, 0);
    if (hi3.length > 2) { p.face(hi3, 0.3 * k, 0); p.line([...hi3, hi3[0]], SH.edge, 0.6); }
  }
}

export const transfer: Illustration = {
  k: "transfer", name: "Ledger", title: "No transfers yet", body: "Money you send or receive will be listed here, newest first.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 24, 11, 0.12);
    // where each arrow's tip is, and how bright it is (it fades in and out at the ends of its path)
    const fly = Array.from({ length: N }, (_, i) => {
      const u = (t / PERIOD + i / N) % 1;
      const c = Y0 - u * Y0 * 2 - 6;
      const k = Math.min(1, u * 6, (1 - u) * 6);
      return { c, k };
    });
    // the slices that are behind the book
    for (const a of fly) arrow(p, a.c, -99, -BT, a.k);

    // the book: a back board, the page block set in from the top and the fore edge, then the front board
    const B = 1; // board thickness
    p.box(-BW, -BT, 0, BW * 2, B, BH, { top: 0.14, left: 0.12, right: 0.065 });
    p.box(-BW + 0.4, -BT + B, 0.6, BW * 2 - 1.6, BT * 2 - B * 2, BH - 1.8, { top: 0.26, left: 0.12, right: 0.2 });
    for (const y of [-1, 0.3, 1.5]) p.line([[-BW + 1.6, y, BH - 1.18], [BW - 1.9, y, BH - 1.18]], SH.edge, 0.5);
    for (const y of [-1.3, 0, 1.3]) p.line([[BW - 1.18, y, 2.2], [BW - 1.18, y, BH - 2.6]], SH.edge, 0.5);
    p.box(-BW, BT - B, 0, BW * 2, B, BH, { top: 0.14, left: 0.12, right: 0.065 });
    // the cover: a label with ruled ledger lines, corner guards and a band near the spine
    const fy = BT + 0.03;
    const lab: V3[] = [[-5, fy, BH - 6.5], [7, fy, BH - 6.5], [7, fy, BH - 13.5], [-5, fy, BH - 13.5]];
    p.face(lab, 0.3, 0);
    p.line([...lab, lab[0]], SH.edge, 0.6);
    p.line([[-3.4, fy + 0.02, BH - 9], [5.4, fy + 0.02, BH - 9]], SH.edge, 0.7);
    p.line([[-3.4, fy + 0.02, BH - 11.2], [2, fy + 0.02, BH - 11.2]], SH.edge, 0.7);
    p.line([[-BW + 2.6, fy, 0.4], [-BW + 2.6, fy, BH - 0.4]], SH.edge, 0.6);
    p.line([[BW - 3.6, fy, BH], [BW, fy, BH - 3.6]], SH.edge, 0.6);
    // the slot the arrows pass through
    p.clear([[-4.3, fy + 0.02, AZ - 1.7], [4.3, fy + 0.02, AZ - 1.7], [4.3, fy + 0.02, AZ + 1.2], [-4.3, fy + 0.02, AZ + 1.2]]);

    // the slices in front of the book
    for (const a of fly) arrow(p, a.c, BT, 99, a.k);
  },
};
