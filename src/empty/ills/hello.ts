// Say hello: a big speech bubble with a waving hand cut into it and two swish marks. Hover and the bubble hops and the hand waves back and forth.
import { SH, type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const rrect = (a0: number, v0: number, a1: number, v1: number, r: number): Q => {
  const out: Q = [];
  const cs: [number, number, number][] = [[a1 - r, v1 - r, 0], [a0 + r, v1 - r, 1], [a0 + r, v0 + r, 2], [a1 - r, v0 + r, 3]];
  for (const [x, y, q] of cs) for (let i = 0; i <= 6; i++) { const s = ((q + i / 6) * Math.PI) / 2; out.push([x + Math.cos(s) * r, y + Math.sin(s) * r]); }
  return out;
};
// a capsule from (a0, v0) to (a1, v1), r wide
const cap = (a0: number, v0: number, a1: number, v1: number, r: number): Q => {
  const d = Math.atan2(v1 - v0, a1 - a0), out: Q = [];
  for (let i = 0; i <= 8; i++) { const s = d - Math.PI / 2 + (i / 8) * Math.PI; out.push([a1 + Math.cos(s) * r, v1 + Math.sin(s) * r]); }
  for (let i = 0; i <= 8; i++) { const s = d + Math.PI / 2 + (i / 8) * Math.PI; out.push([a0 + Math.cos(s) * r, v0 + Math.sin(s) * r]); }
  return out;
};
const BUB = rrect(-17, 4, 17, 31, 6);
const TAIL: Q = [[-11, 5], [-3, 5], [-14, -2.5]];
const PV: [number, number] = [0, 6.5]; // the wrist, where the hand turns
const finger = (a: number, ang: number, l: number): Q => cap(a, 15, a + Math.sin(ang) * l, 15 + Math.cos(ang) * l, 1.3);
const HAND: Q[] = [
  rrect(-5.8, 6.5, 5.8, 18, 3.4),
  finger(-4.4, -0.3, 10.5), finger(-1.5, -0.1, 12.5), finger(1.5, 0.1, 12), finger(4.4, 0.3, 9.5),
  cap(-4.4, 10, -9.6, 15.8, 1.5),
];

export const hello: Illustration = {
  k: "hello", name: "Hello", title: "Say hello", body: "Send a first message to start a conversation.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    const hop = h < 0.3 ? Math.sin((h / 0.3) * Math.PI) * 2.2 : 0;
    p.shadow(0, 0, 26, 10, 0.12);
    p.rotate("z", -0.6);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v + hop] as V3);
    // the bubble: a little depth, then the lit face
    for (let y = -2.5; y < 0; y += 0.5) { p.face(put(BUB, y), 0.065, 0); p.face(put(TAIL, y), 0.065, 0); }
    p.face(put(BUB, 0), 0.26, 0);
    p.face(put(TAIL, 0), 0.26, 0);
    // the hand, cut into it, tilted and waving about the wrist while hovered
    const a = 0.22 + h * Math.sin(t * 7) * 0.32 * Math.min(1, h * 3);
    const turn = (q: Q): Q => q.map(([u, v]) => [PV[0] + (u - PV[0]) * Math.cos(a) - (v - PV[1]) * Math.sin(a), PV[1] + (u - PV[0]) * Math.sin(a) + (v - PV[1]) * Math.cos(a)]);
    for (const q of HAND) p.clear(put(turn(q), 0.05));
    // swish marks either side of the fingers
    const sw = 0.9 + 0.1 * Math.sin(t * 7) * h;
    for (const [c, r0, s] of [[[0, 11], 18.5 * sw, 1], [[0, 11], 15.8 * sw, 1], [[0, 11], 18.5 * sw, -1], [[0, 11], 15.8 * sw, -1]] as [[number, number], number, number][]) {
      const arc = Array.from({ length: 7 }, (_, i) => { const b = Math.PI / 2 + s * (0.66 + (i / 6) * 0.32); return [c[0] + Math.cos(b) * r0, c[1] + Math.sin(b) * r0] as [number, number]; });
      p.line(put(turn(arc), 0.06), SH.edge, 1.1);
    }
  },
};
