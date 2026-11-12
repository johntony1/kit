// No evals yet: a scorecard leaning on its stand, three tests waiting. Hover and they are graded in turn, two passes and a fail, each score bar filling.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const HW = 12.5, HZ = 30, DY = 1.8;
const ROWS: [number, number, boolean][] = [[23.5, 0.92, true], [15, 0.7, true], [6.5, 0.3, false]]; // height, score, pass

export const evals: Illustration = {
  k: "evals", name: "Evaluations", title: "No evals yet", body: "Run an eval to score your prompts against test cases. Results will be compared here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 12, 0.12);
    p.rotate("z", -0.5);
    p.box(-10, -8, 0, 20, 11, 1.8);
    p.translate(0, 0, 1.8);
    p.rotate("x", 0.2, [0, 0, 0]);
    p.box(-HW, -DY, 0, 2 * HW, DY, HZ, { top: 0.22 });
    const f = 0.03;
    ROWS.forEach(([z, score, pass], i) => {
      const k = clamp((h - 0.08 - i * 0.27) / 0.3), done = k > 0.35;
      // the mark: an empty well, then a lit disc with a tick or a cross
      const c: V3 = [-7.8, f, z];
      if (done) p.ringV("y", c, 2.9 + 0.5 * Math.sin(Math.PI * clamp((k - 0.35) / 0.4)), 0.42, SH.edge, 0.5);
      else p.ringV("y", c, 2.9, p.ink ? 0.04 : 0.02, SH.edge, 0.5);
      if (done && pass) p.line([[-9.2, f + 0.02, z], [-8.2, f + 0.02, z - 1.2], [-6.4, f + 0.02, z + 1.2]], SH.edge, 0.85);
      if (done && !pass) { p.line([[-9, f + 0.02, z - 1.2], [-6.6, f + 0.02, z + 1.2]], SH.edge, 0.85); p.line([[-9, f + 0.02, z + 1.2], [-6.6, f + 0.02, z - 1.2]], SH.edge, 0.85); }
      // the score bar: a dark track that fills
      p.clear([[-3, f, z - 1.3], [10, f, z - 1.3], [10, f, z + 1.3], [-3, f, z + 1.3]]);
      const w = 13 * score * ease(k);
      if (w > 0.4) p.face([[-3, f + 0.01, z - 1.3], [-3 + w, f + 0.01, z - 1.3], [-3 + w, f + 0.01, z + 1.3], [-3, f + 0.01, z + 1.3]], 0.4, 0);
    });
  },
};
