// No polls yet: a poll card with three sunken tracks. Lit bars grow out along them in turn, the winning one longest, then slide back.
import { SH, pulse, type Illustration } from "../dots";

const X = 14, Y = 10.5, T = 2.6; // half length (x, the bar direction), half depth, thickness
const P = 4.4;
const VAL = [0.55, 0.92, 0.32];
const X0 = -7.5, LEN = 19.5; // where the tracks start, and their length

export const poll: Illustration = {
  k: "poll", name: "Poll", title: "No polls yet", body: "Ask your first question and the votes will be counted here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -5);
    p.scale(1.2, [0, 0, 2]);
    p.shadow(-7, -5, 14, 7, 0.1); p.shadow(7, -5, 14, 7, 0.1); p.shadow(-7, 5, 14, 7, 0.1); p.shadow(7, 5, 14, 7, 0.1);
    p.box(-X, -Y, 0, X * 2, Y * 2, T, { top: 0.15, left: 0.12, right: 0.065, lw: 0.6 });
    const z = T + 0.02;
    // the question, cut along the back edge
    p.line([[-11.5, -8.3, z], [2, -8.3, z]], SH.edge, 1.2);
    const rows = [-3.6, 1.6, 6.8];
    rows.forEach((y, i) => {
      // a label mark, then a sunken track
      p.line([[-11.5, y, z], [-9.5, y, z]], SH.edge, 1.1);
      p.clear([[X0, y - 1.7, z], [X0 + LEN, y - 1.7, z], [X0 + LEN, y + 1.7, z], [X0, y + 1.7, z]]);
      // the bar's target, dashed (line style only)
      const tx = X0 + LEN * VAL[i];
      p.guide([[tx, y - 1.7, z + 0.02], [tx, y + 1.7, z + 0.02]], i === 1);
      // the bar: grows out along the track in turn, holds, slides back
      const g = pulse(t + P - i * 0.18, P, 0.4);
      const L = LEN * (0.07 + (VAL[i] - 0.07) * g);
      p.box(X0, y - 1.35, T, L, 2.7, 1.5, { top: i === 1 ? 0.34 : 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    });
  },
};
