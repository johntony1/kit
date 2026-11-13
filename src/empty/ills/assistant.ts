// Ask me anything: a thick speech bubble standing up with a big sparkle cut into it and a small one beside. Hover and the bubble lifts, the big sparkle swells and turns, and the small one twinkles.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const pop = (x: number) => { const k = clamp(x); return k < 0.6 ? ease(k / 0.6) * 1.2 : 1.2 - 0.2 * ease((k - 0.6) / 0.4); };
const T = 2; // half thickness

/** the bubble outline (u right, v up): a rounded box with a tail at the bottom left */
const OUT: [number, number][] = (() => {
  const W = 15, B = -10, Tp = 12, r = 6, o: [number, number][] = [];
  const arc = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 7; i++) { const a = a0 + (i / 7) * (Math.PI / 2); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(W - r, B + r, -Math.PI / 2);
  arc(W - r, Tp - r, 0);
  arc(-W + r, Tp - r, Math.PI / 2);
  arc(-W + r, B + r, Math.PI);
  o.push([-W + r - 1, B], [-11, -16.5], [-3.5, B]);
  return o;
})();
/** a four point sparkle's outline: sharp tips joined by inward curves */
const starUV = (cu: number, cv: number, R: number, rot: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let k = 0; k < 4; k++) {
    const a0 = rot + (k * Math.PI) / 2, a1 = a0 + Math.PI / 2, am = a0 + Math.PI / 4, m = R * 0.16;
    for (let i = 0; i < 12; i++) {
      const s = i / 12, w0 = (1 - s) * (1 - s), w1 = 2 * s * (1 - s), w2 = s * s;
      out.push([cu + w0 * Math.cos(a0) * R + w1 * Math.cos(am) * m + w2 * Math.cos(a1) * R, cv + w0 * Math.sin(a0) * R + w1 * Math.sin(am) * m + w2 * Math.sin(a1) * R]);
    }
  }
  return out;
};

export const assistant: Illustration = {
  k: "assistant", name: "Assistant", title: "Ask me anything", body: "Type a question below to get started. Answers and follow ups will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 10, 0.12);
    p.translate(0, 0, 19 + 2.5 * ease(h * 1.4) + h * Math.sin(t * 2.4) * 0.6);
    p.rotate("z", -Math.PI / 4); // its face looks straight at us
    const at = (y: number) => OUT.map(([u, v]) => [u * 0.82, y, v] as V3);
    for (let y = -T; y < T; y += 0.35) p.face(at(y), SH.right, 0);
    p.face(at(T), 0.28, SH.edge, 0.6);
    p.line([...at(T + 0.03), at(T + 0.03)[0]], SH.edge, 0.6);
    // the sparkles, cut dark into the face
    const big = 7.5 * (1 + 0.22 * pop(h * 1.3)) * (1 + h * Math.sin(t * 3.3) * 0.04);
    const rot = 0.25 * ease(h * 1.2);
    const star = (cu: number, cv: number, R: number, r0: number) => p.face(starUV(cu, cv, R, r0).map(([u, v]) => [u * 0.82, T + 0.05, v] as V3), 0.02, 0);
    star(-2, 0.5, big, rot);
    star(7.5, 6.5, 3.2 * (1 + 0.4 * pop((h - 0.4) * 2)) * (1 + h * Math.sin(t * 4.4) * 0.1), 0);
  },
};
