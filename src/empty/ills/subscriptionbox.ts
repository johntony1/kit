// No boxes scheduled: a lidded delivery box standing inside a repeat sign drawn on the floor. The two arrows circle the box and the box gives a small hop each time round.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const clamp = (x: number) => Math.min(1, Math.max(0, x));
/** a band of the floor ring between two angles */
const arc = (r0: number, r1: number, a0: number, a1: number): V3[] => {
  const o: V3[] = [], i: V3[] = [];
  for (let k = 0; k <= 16; k++) { const a = a0 + ((a1 - a0) * k) / 16; o.push([Math.cos(a) * r1, Math.sin(a) * r1, 0.05]); i.push([Math.cos(a) * r0, Math.sin(a) * r0, 0.05]); }
  return [...o, ...i.reverse()];
};

export const subscriptionbox: Illustration = {
  k: "subscriptionbox", name: "Subscription box", title: "No boxes scheduled", body: "Set up a delivery and your next box will be lined up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const rot = -u * Math.PI; // two arrows, so half a turn brings it back to the start
    const hop = Math.sin(Math.PI * clamp((u - 0.08) / 0.3));
    p.translate(0, 0, -6);
    p.shadow(0, 0, 40, 20, 0.06);
    // the repeat sign on the floor: two arrows chasing each other round the box
    for (const k of [0, 1]) {
      const a0 = rot + k * Math.PI, a1 = a0 - 2.15;
      p.face(arc(14.6, 17.6, a0, a1), 0.3, 0);
      const at = (a: number, r: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, 0.05];
      p.face([at(a1, 12.4), at(a1, 19.8), at(a1 - 0.42, 16.1)], 0.42, 0);
    }
    p.shadow(0, 0, 15, 7.5, 0.12 - 0.04 * hop);
    // the box: taped body, a deeper lid, a label on the front
    p.push();
    p.translate(0, 0, 2.6 * hop);
    p.box(-7, -7, 0, 14, 14, 10.5, { top: 0.2, left: 0.12, right: 0.06, lw: 0.6 });
    p.face([[-5, 7.03, 2.2], [0, 7.03, 2.2], [0, 7.03, 6.2], [-5, 7.03, 6.2]], 0.36, 0);
    p.line([[-4, 7.06, 4.9], [-1, 7.06, 4.9]], 0.02, 0.7);
    p.line([[-4, 7.06, 3.5], [-2.2, 7.06, 3.5]], 0.02, 0.7);
    const lid = 10.5 + 1.2 * hop;
    p.box(-7.9, -7.9, lid, 15.8, 15.8, 3.2, { top: 0.24, left: 0.16, right: 0.085, lw: 0.6 });
    p.line([[0, -7.9, lid + 3.22], [0, 7.9, lid + 3.22]], SH.edge, 0.8);
    p.line([[0, 7.93, lid + 3.2], [0, 7.93, lid]], SH.edge, 0.8);
    p.pop();
  },
};
