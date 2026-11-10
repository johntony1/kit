// Nothing to do: a checklist card lying flat. Hover and its boxes tick one by one, each popping up as it is checked.
import { SH, type Illustration, type V3 } from "../dots";

const X = 13, Y = 17, T = 2.4; // half width, half depth, thickness of the card
const ROWS = [-7, -1, 5]; // the rows, down the card
const LEN = [13, 9, 11];
const B = 1.8; // half size of a checkbox

// a point on the card's top from a screen offset (sx right, sy down) around (cx, cy)
const at = (cx: number, cy: number, z: number, sx: number, sy: number): V3 => [cx + sx / 1.732 + sy, cy + sy - sx / 1.732, z];

export const checklist: Illustration = {
  k: "checklist", name: "Checklist", title: "Nothing to do", body: "Create a checklist and tick things off as you go.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // seconds since the hover began, read back from the eased hover value
    const since = -Math.log(Math.max(1e-4, 1 - h)) / 7;
    p.translate(0, 0, -3);
    p.shadow(0, 0, 42, 21, 0.11);
    // a second card under it, a little askew
    p.push(); p.rotate("z", 0.07);
    p.box(-X + 1, -Y + 1, 0, X * 2, Y * 2, T, { top: 0.12, left: 0.1, right: SH.right });
    p.pop();
    p.box(-X, -Y, T, X * 2, Y * 2, T, { top: 0.21, left: 0.13, right: SH.right });
    const z = T * 2 + 0.02;
    // the heading and a short note under it
    p.line([[-10, -13, z], [1, -13, z]], SH.edge, 1.3);
    p.line([[-10, -10.4, z], [-4, -10.4, z]], SH.edge, 0.6);
    ROWS.forEach((y, i) => {
      const cx = -8, k = Math.max(0, Math.min(1, (since - 0.08 - i * 0.3) / 0.32));
      const sq = (zz: number): V3[] => [[cx - B, y - B, zz], [cx + B, y - B, zz], [cx + B, y + B, zz], [cx - B, y + B, zz]];
      if (k <= 0) p.face(sq(z), 0.03, SH.edge, 0.6);
      else {
        // checked: the box pops up, lit, with a tick cut into it
        const lift = 1.1 + Math.sin(Math.min(1, k * 1.4) * Math.PI) * 1.6;
        p.box(cx - B, y - B, z, B * 2, B * 2, lift, { top: 0.32, left: 0.16, right: 0.1 });
        const zt = z + lift + 0.02;
        const A = at(cx, y, zt, -1.7, -0.1), M = at(cx, y, zt, -0.5, 0.9), C = at(cx, y, zt, 1.9, -1);
        const s = Math.min(1, k * 1.6), l1 = 0.4;
        const lerp = (a: V3, b: V3, f: number): V3 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
        p.line(s <= l1 ? [A, lerp(A, M, s / l1)] : [A, M, lerp(M, C, (s - l1) / (1 - l1))], SH.edge, 0.9);
      }
      const len = LEN[i] * (1 - 0.35 * k);
      p.line([[-4.4, y, z], [-4.4 + len, y, z]], SH.edge, 1);
    });
    // an empty row, still to be written
    const y = 11;
    p.guide([[-8 - B, y - B, z], [-8 + B, y - B, z], [-8 + B, y + B, z], [-8 - B, y + B, z], [-8 - B, y - B, z]], true);
    p.guide([[-4.4, y, z], [6, y, z]]);
  },
};
