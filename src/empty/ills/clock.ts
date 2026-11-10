// No history: a round clock on a wall. The hands run forward for a while, then spin back to where they started.
import { easeInOut, SH, type Illustration } from "../dots";

const P = 5; // seconds per loop
const R = 13, ZC = 22, D = 3.2; // clock radius, height of its centre, depth of the case
const YF = 0; // the front of the dial

export const clock: Illustration = {
  k: "clock", name: "Wall clock", title: "No history", body: "Your past activity will be listed here as soon as there is some.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // forward for most of the loop, then a quick rewind back to the start
    const run = u < 0.72 ? u / 0.72 : 1 - easeInOut((u - 0.72) / 0.28);
    const mAng = run * Math.PI * 2; // the minute hand goes once round
    const hAng = (-2 / 12) * Math.PI * 2 + run * (Math.PI * 2) / 12; // the hour hand, from ten to eleven
    p.translate(0, 0, -21);
    p.shadow(0, -2, 24, 8, 0.08);
    // the wall: a dark panel, so the lit dial stands out
    p.box(-17, -D - 3, 0, 34, 3, 42, { top: 0.2, left: 0.035, right: 0.065 });
    // the nail and its little shadow
    p.dot([0, -D, ZC + R + 1.6], 0.8, 1);
    // the case: rings stepped from the back to the front give it depth
    for (let y = -D; y < YF; y += 0.25) p.ringV("y", [0, y, ZC], R, SH.right, 0);
    // the bezel and the dial
    p.ringV("y", [0, YF, ZC], R, SH.top, 0);
    p.ringV("y", [0, YF + 0.01, ZC], R - 1.6, 0, SH.edge, 0.7);
    // hour marks: long at 12, 3, 6, 9
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
      const r0 = i % 3 === 0 ? R - 5.2 : R - 4, r1 = R - 2.8;
      p.line([[s * r0, YF + 0.02, ZC + c * r0], [s * r1, YF + 0.02, ZC + c * r1]], SH.edge, i % 3 === 0 ? 1.1 : 0.7);
    }
    // hands
    const hand = (a: number, len: number, lw: number) => p.line([[-Math.sin(a) * 1.6, YF + 0.03, ZC - Math.cos(a) * 1.6], [Math.sin(a) * len, YF + 0.03, ZC + Math.cos(a) * len]], SH.edge, lw);
    hand(hAng, 5.6, 1.5);
    hand(mAng, 8.6, 1);
    p.dot([0, YF + 0.04, ZC], 1.1, 0);
  },
};
