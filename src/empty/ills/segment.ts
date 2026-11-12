// No segments yet: a thick pie chart with one slice marked for a group of people. The slice slides out of the pie and lifts, holds, then slides back in.
import { pulse, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.4;
const R = 14.5, H = 5.6;
const A0 = 0.14, A1 = 1.43; // the slice, facing us
const TAU = Math.PI * 2;
const arc = (a0: number, a1: number, z: number, r = R): V3[] => Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

/** the part of the outer wall between a0 and a1 that faces us */
function wall(p: Pen, a0: number, a1: number, fill: number) {
  for (const k of [-1, 0, 1]) {
    const s = Math.max(a0, -Math.PI / 4 + k * TAU), e = Math.min(a1, (Math.PI * 3) / 4 + k * TAU);
    if (e > s + 0.01) p.face([...arc(s, e, 0), ...arc(e, s, H)], fill, SH.edge, 0.55);
  }
}

export const segment: Illustration = {
  k: "segment", name: "Audience segments", title: "No segments yet", body: "Group people by what they have in common, then reach each group on its own.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const k = pulse(t, P, 0.3);
    p.translate(-2, -2, -5);
    p.shadow(2, 2, 36, 18, 0.11);
    // the rest of the pie: the two cut faces inside the gap, the wall, the top with its other divisions
    p.face([[0, 0, 0], [Math.cos(A1) * R, Math.sin(A1) * R, 0], [Math.cos(A1) * R, Math.sin(A1) * R, H], [0, 0, H]], 0.03, SH.edge, 0.5);
    p.face([[0, 0, 0], [Math.cos(A0) * R, Math.sin(A0) * R, 0], [Math.cos(A0) * R, Math.sin(A0) * R, H], [0, 0, H]], 0.045, SH.edge, 0.5);
    wall(p, A1, A0 + TAU, 0.12);
    p.face([[0, 0, H], ...arc(A1, A0 + TAU, H)], 0.21, SH.edge, 0.6);
    for (const a of [3.05, 4.75]) p.line([[0, 0, H + 0.02], [Math.cos(a) * R, Math.sin(a) * R, H + 0.02]], SH.edge, 0.8);
    // the slice: out along its middle, and up a little
    const am = (A0 + A1) / 2, d = 1.6 + 7 * k;
    p.guide([[0, 0, 0], [Math.cos(am) * (d + R), Math.sin(am) * (d + R), 0]], true);
    p.push();
    p.translate(Math.cos(am) * d, Math.sin(am) * d, 2.6 * k);
    wall(p, A0, A1, 0.3);
    p.face([[0, 0, H], ...arc(A0, A1, H)], 0.34, SH.edge, 0.6);
    // a person on it: a head and shoulders
    const hx = Math.cos(am) * 7.4, hy = Math.sin(am) * 7.4, z = H + 0.03;
    p.dot([hx - 1.1, hy - 1.1, z], 1.25, 0);
    p.line(Array.from({ length: 9 }, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return [hx + 1.5 + Math.cos(a) * 1.5 + Math.sin(a) * 1.3, hy + 1.5 - Math.cos(a) * 1.5 + Math.sin(a) * 1.3, z] as V3; }), 0, 1);
    p.pop();
  },
};
