// Search with a question: a big magnifying glass standing up with a sparkle glowing in its lens. Hover and the glass leans in, the sparkle swells and turns, and a small one twinkles beside it.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const pop = (x: number) => { const k = clamp(x); return k < 0.6 ? ease(k / 0.6) * 1.2 : 1.2 - 0.2 * ease((k - 0.6) / 0.4); };
const RO = 12.5, RI = 9.2, T = 1.8; // outer and inner radius of the rim, half thickness
const ring = (r: number, n = 48): [number, number][] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; });
const starUV = (R: number, rot: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let k = 0; k < 4; k++) {
    const a0 = rot + (k * Math.PI) / 2, a1 = a0 + Math.PI / 2, am = a0 + Math.PI / 4, m = R * 0.16;
    for (let i = 0; i < 12; i++) {
      const s = i / 12, w0 = (1 - s) * (1 - s), w1 = 2 * s * (1 - s), w2 = s * s;
      out.push([w0 * Math.cos(a0) * R + w1 * Math.cos(am) * m + w2 * Math.cos(a1) * R, w0 * Math.sin(a0) * R + w1 * Math.sin(am) * m + w2 * Math.sin(a1) * R]);
    }
  }
  return out;
};

export const aisearch: Illustration = {
  k: "aisearch", name: "AI search", title: "Search with a question", body: "Ask in your own words and we will find the answer across everything you have.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -18);
    p.shadow(2, 2, 24, 10, 0.12);
    const lean = 0.18 * ease(h * 1.3) + h * Math.sin(t * 2.2) * 0.03;
    p.translate(-2, 0, 22);
    p.rotate("z", -Math.PI / 4); // its face looks straight at us
    p.rotate("y", lean, [6, 0, -14]);
    const S = 0.82; // keep circles round on screen
    const at = (pts: [number, number][], y: number, du = 0, dv = 0) => pts.map(([u, v]) => [(u + du) * S, y, v + dv] as V3);
    // the handle: a thick bar out of the rim's lower right, stacked for depth, with a darker grip
    const hand = (a: number, b: number, w: number): [number, number][] => {
      const c = Math.cos(-0.8), s = Math.sin(-0.8);
      return [[c * a - s * -w, s * a + c * -w], [c * b - s * -w, s * b + c * -w], [c * b - s * w, s * b + c * w], [c * a - s * w, s * a + c * w]];
    };
    for (let y = -T; y < T; y += 0.35) p.face(at(hand(RO - 1, RO + 14, 2.2), y), 0.05, 0);
    p.face(at(hand(RO - 1, RO + 4, 1.8), T), 0.3, SH.edge, 0.55);
    p.face(at(hand(RO + 4, RO + 14, 2.2), T), 0.16, SH.edge, 0.55);
    // the lens: dark glass with the sparkle glowing in it
    p.clear(at(ring(RI), 0));
    const big = 6.2 * (1 + 0.25 * pop(h * 1.3)) * (1 + h * Math.sin(t * 3.4) * 0.05);
    const rot = 0.3 * ease(h * 1.2);
    const pts = at(starUV(big, rot), 0.2, -0.5, 0.5);
    p.face(pts, 0.3, 0);
    for (let k = 0; k < 4; k++) p.face([[-0.5 * S, 0.2, 0.5], ...pts.slice(k * 12, k * 12 + 7)], 0.8, 0);
    const s2 = 2.4 * (1 + 0.5 * pop((h - 0.4) * 2)) * (1 + h * Math.sin(t * 4.6) * 0.1);
    p.face(at(starUV(s2, 0), 0.2, 4.6, 4.8), 0.6, 0);
    // the rim: a ring stacked for depth, its lit face last
    const rim = (y: number) => { const o = at(ring(RO), y), i = at(ring(RI), y); return [...o, o[0], i[0], ...i.reverse()]; };
    for (let y = -T; y < T; y += 0.35) p.face(rim(y), SH.right, 0);
    p.face(rim(T), 0.36, 0);
    p.line([...at(ring(RO), T + 0.03), at(ring(RO), T + 0.03)[0]], SH.edge, 0.6);
    p.line([...at(ring(RI), T + 0.03), at(ring(RI), T + 0.03)[0]], SH.edge, 0.6);
  },
};
