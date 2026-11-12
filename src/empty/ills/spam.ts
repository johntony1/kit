// No spam: a sealed envelope with a stop sign standing in front of it. Hover and the envelope is pushed back while the sign swells.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const X = 14, Y = 1.2, Z = 19;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const oct = (cx: number, y: number, cz: number, r: number): V3[] =>
  Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });

export const spam: Illustration = {
  k: "spam", name: "Spam", title: "No spam", body: "Nothing suspicious has come in. Junk messages we catch will be held here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(cl(h / 0.6));
    p.translate(0, 0, -11);
    p.shadow(0, 2, 27, 11, 0.12);
    p.rotate("z", -0.42);
    // the envelope: pushed back and tipped over on hover
    p.push();
    p.translate(-2, -2 - k * 4, 0);
    p.rotate("x", 0.06 + k * 0.42);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.2, left: 0.2, right: 0.065 });
    const fy = Y + 0.03;
    p.line([[-X, fy, Z], [0, fy, Z * 0.45], [X, fy, Z]], SH.edge, 0.75);
    p.line([[-X, fy, 0], [-4.4, fy, Z * 0.56]], SH.edge, 0.5);
    p.line([[X, fy, 0], [4.4, fy, Z * 0.56]], SH.edge, 0.5);
    p.pop();
    // the stop sign: an octagon with an exclamation mark
    const b = cl((h - 0.25) / 0.6);
    const s = 1 + (b < 0.6 ? easeInOut(b / 0.6) * 0.3 : 0.3 - 0.1 * easeInOut((b - 0.6) / 0.4));
    const r = 7.4 * s, cx = 8, cz = r + 0.2, y = 5.5, wob = h * Math.sin(t * 5) * 0.25;
    p.face(oct(cx, y - 1.4, cz, r), SH.right, SH.edge, 0.5);
    p.face(oct(cx, y, cz, r), 0.34, SH.edge, 0.7);
    p.line(oct(cx, y + 0.02, cz, r * 0.8).concat([oct(cx, y + 0.02, cz, r * 0.8)[0]]), SH.edge, 0.45);
    p.line([[cx + wob, y + 0.04, cz + r * 0.5], [cx, y + 0.04, cz - r * 0.1]], 0, 1.5);
    p.dot([cx, y + 0.04, cz - r * 0.42], 0.95 * s, 0);
  },
};
