// Nothing generated yet: three four point sparkles, one big and two small, floating over a soft shadow. Hover and they swell and twinkle one after another, the big one turning a little.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
/** a swell past full size that settles: 0 to 1 with a little overshoot */
const pop = (x: number) => { const k = clamp(x); return k < 0.6 ? ease(k / 0.6) * 1.15 : 1.15 - 0.15 * ease((k - 0.6) / 0.4); };
/** a point in the plane that faces us: a to the right, b up, in screen units */
const at = (c: V3, a: number, b: number): V3 => [c[0] + a * 0.577, c[1] - a * 0.577, c[2] + b];
const starPts = (c: V3, R: number, rot: number): V3[] => {
  // four sharp tips joined by inward curves (a quadratic through a point near the middle)
  const out: V3[] = [];
  for (let k = 0; k < 4; k++) {
    const a0 = rot + (k * Math.PI) / 2, a1 = a0 + Math.PI / 2, am = a0 + Math.PI / 4, m = R * 0.16;
    for (let i = 0; i < 12; i++) {
      const s = i / 12, w0 = (1 - s) * (1 - s), w1 = 2 * s * (1 - s), w2 = s * s;
      out.push(at(c, w0 * Math.cos(a0) * R + w1 * Math.cos(am) * m + w2 * Math.cos(a1) * R, w0 * Math.sin(a0) * R + w1 * Math.sin(am) * m + w2 * Math.sin(a1) * R));
    }
  }
  return out;
};

/** a thick sparkle: a darker copy behind for depth, then the face cut into facets, half of each arm lit */
function sparkle(p: Pen, c: V3, R: number, rot: number) {
  if (R < 0.3) return;
  const d = Math.max(0.7, R * 0.1);
  p.face(starPts(at(c, d, -d), R, rot), 0.05, 0);
  const pts = starPts(c, R, rot);
  p.face(pts, 0.13, SH.edge, 0.55);
  for (let k = 0; k < 4; k++) p.face([c, ...pts.slice(k * 12, k * 12 + 7)], 0.4, 0);
}

export const sparkles: Illustration = {
  k: "sparkles", name: "Sparkles", title: "Nothing generated yet", body: "Describe what you want and your first results will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 11, 0.12);
    const bob = h * Math.sin(t * 2.2) * 0.8;
    const C: V3 = [0, 0, 17 + bob];
    // the big one swells and turns a touch
    const big = 16 * (1 + 0.12 * pop(h * 1.4)) * (1 + h * Math.sin(t * 3.1) * 0.03);
    // two small ones, twinkling in turn
    const s1 = 6.8 * (1 + 0.3 * pop((h - 0.25) * 2)) * (1 + h * Math.sin(t * 4.3) * 0.08);
    const s2 = 5 * (1 + 0.4 * pop((h - 0.45) * 2.2)) * (1 + h * Math.sin(t * 4.3 + 2) * 0.1);
    sparkle(p, at(C, 16, 13), s1, 0);
    sparkle(p, at(C, -2, 1), big, 0.18 * ease(h));
    sparkle(p, at(C, -16, -12), s2, 0);
  },
};
