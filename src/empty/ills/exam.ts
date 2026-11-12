// No exams scheduled: an answer sheet with four rows of bubbles. A pencil goes down the sheet filling one bubble in each row, then the marks clear and it starts again.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.8; // seconds per loop
const S2 = Math.SQRT1_2, Z = 0.85;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const XS = [-3.6, 1, 5.6, 10.2], YS = [-4.6, -0.4, 3.8, 8], PICK = [1, 3, 0, 2];
const HOME: V3 = [15, -8, Z + 5];
const spot = (i: number): V3 => [XS[PICK[i]], YS[i], Z];
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export const exam: Illustration = {
  k: "exam", name: "Exam paper", title: "No exams scheduled", body: "When an exam is set, its date and paper will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(-3, 3, -7);
    p.scale(1.1);
    p.shadow(0, 0, 28, 13, 0.1);
    // the sheet: a heading, a name box, then the rows
    p.box(-14, -12, 0, 28, 24, 0.8);
    p.line([[-11, -9, Z], [1, -9, Z]], SH.edge, 1);
    p.face([[6, -10.4, Z], [11.6, -10.4, Z], [11.6, -7.6, Z], [6, -7.6, Z]], 0.05, SH.edge, 0.5);
    const clear = 1 - seg(u, 0.84, 0.94);
    YS.forEach((y, i) => {
      p.line([[-11.4, y, Z], [-8, y, Z]], SH.edge, 0.9);
      const k = ease(seg(u, i * 0.2 + 0.11, i * 0.2 + 0.2)) * clear;
      XS.forEach((x, j) => {
        p.disc(x, y, Z, 1.55, 0, SH.edge);
        if (j === PICK[i] && k > 0.05) p.disc(x, y, Z + 0.02, 1.55 * k, 0.03, 0);
      });
    });
    // where the pencil's point is: from bubble to bubble, hopping, then home
    let tip: V3;
    if (u >= 0.8) { const g = ease(seg(u, 0.82, 1)); tip = mix(spot(3), HOME, g); }
    else {
      const i = Math.min(3, Math.floor(u / 0.2)), f = (u - i * 0.2) / 0.2, g = ease(Math.min(1, f / 0.5));
      tip = mix(i ? spot(i - 1) : HOME, spot(i), g);
      tip[2] += Math.sin(g * Math.PI) * 3 + (f > 0.5 ? Math.abs(Math.sin((f - 0.5) * Math.PI * 6)) * 0.4 : 0);
    }
    // the pencil, leaning away to the right: a point, a body, a band and a rubber
    const at = (s: number, w: number): V3 => [tip[0] + (s * 0.42 + w * 0.9) * S2, tip[1] - (s * 0.42 + w * 0.9) * S2, tip[2] + s * 0.9 - w * 0.42];
    p.face([at(0, 0), at(3, -1.1), at(3, 1.1)], 0.2, SH.edge, 0.4);
    p.face([at(3, -1.1), at(15, -1.1), at(15, 1.1), at(3, 1.1)], 0.36, SH.edge, 0.5);
    p.face([at(15, -1.1), at(16.2, -1.1), at(16.2, 1.1), at(15, 1.1)], 0.1, SH.edge, 0.4);
    p.face([at(16.2, -1.1), at(18, -1.1), at(18, 1.1), at(16.2, 1.1)], 0.3, SH.edge, 0.4);
    p.dot(at(0, 0), 0.5, 0.02);
  },
};
