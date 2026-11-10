// No responses yet: a survey form lying on a second sheet, three options with round radio holes. Hover and a bead drops into the middle option and the submit button lights up.
import { SH, type Illustration, type V3 } from "../dots";

const X = 11, Y = 14.5, T = 1.3; // half width (x, the text direction), half length (y), thickness

export const survey: Illustration = {
  k: "survey", name: "Survey", title: "No responses yet", body: "Share your survey and the answers will start showing up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -4);
    p.scale(1.12, [0, 0, 2]);
    p.shadow(0, -5.5, 22, 11, 0.1); p.shadow(0, 5.5, 22, 11, 0.1);
    // the sheet underneath, a little turned and offset
    p.push(); p.rotate("z", 0.09, [0, 0, 0]); p.translate(1.6, -1.2, 0);
    p.box(-X, -Y, 0, X * 2, Y * 2, T, { top: 0.13, left: 0.12, right: 0.065, lw: 0.6 });
    p.pop();
    // the form
    const z = T * 2;
    p.box(-X, -Y, T, X * 2, Y * 2, T, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    const zt = z + 0.02;
    // title and a line of help text
    p.line([[-8, -11, zt], [4, -11, zt]], SH.edge, 1.3);
    p.line([[-8, -8.4, zt], [1, -8.4, zt]], SH.edge, 0.6);
    // three options: a radio hole and a line of text each
    const ring = (cx: number, cy: number, r: number, zz: number): V3[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, zz] as V3; });
    const rows = [-3.4, 1.6, 6.6];
    rows.forEach((y, i) => {
      p.face(ring(-6.6, y, 1.7, zt), 0.03, SH.edge, 0.6);
      p.line([[-3.4, y, zt], [i === 1 ? 7.5 : 5.5 - i, y, zt]], SH.edge, 0.75);
    });
    // the submit button: a raised pad that lights up once an answer is in
    const lit = Math.max(0, Math.min(1, (h - 0.7) / 0.3));
    const press = lit > 0 ? Math.sin(lit * Math.PI) * 0.5 : 0;
    p.box(-8, 10, z, 7, 2.8, 1.1 - press, { top: lit > 0.5 ? 0.34 : 0.13, left: 0.12, right: 0.065, lw: 0.6 });
    p.line([[-6.6, 11.4, z + 1.12 - press], [-2.4, 11.4, z + 1.12 - press]], SH.edge, 0.6);
    // the bead: floats over the middle option, then drops in with a little bounce
    const d = Math.min(1, h / 0.6);
    const bounce = d >= 1 && h < 0.85 ? Math.sin(((h - 0.6) / 0.25) * Math.PI) * 1.2 : 0;
    const zb = z - 0.2 + 9 * (1 - d * d) + bounce + (1 - h) * Math.sin(t * 2.5) * 0.4;
    const by = rows[1];
    if (zb > z + 1.2) {
      p.guide([[-6.6 + 1.2 * Math.SQRT1_2, by - 1.2 * Math.SQRT1_2, zb], [-6.6 + 1.2 * Math.SQRT1_2, by - 1.2 * Math.SQRT1_2, zt]], true);
      p.guide([[-6.6 - 1.2 * Math.SQRT1_2, by + 1.2 * Math.SQRT1_2, zb], [-6.6 - 1.2 * Math.SQRT1_2, by + 1.2 * Math.SQRT1_2, zt]], true);
    }
    p.cylinder(-6.6, by, zb, 1.2, 1.1, { side: 0.13, top: 0.34, lw: 0.55 });
  },
};
