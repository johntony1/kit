// Donation box: a collection box with a heart on its front and a coin resting in the slot. Hover and the coin drops in, the heart lights up and small hearts float off.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a point on the plane that faces us through c: u to the right, v up */
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.7071 - v * 0.4082, c[1] - u * 0.7071 - v * 0.4082, c[2] + v * 0.8165];
/** a heart outline in [u, v], about 2 wide, centred */
const HEART: [number, number][] = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [Math.pow(Math.sin(a), 3), (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16 + 0.1] as [number, number]; });
const W = 11, D = 8, H = 18; // half width, half depth, height
const CR = 5; // the coin

export const donation: Illustration = {
  k: "donation", name: "Donation box", title: "No donations yet", body: "Share your page and the first gifts will be counted here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = clamp(h / 0.36), lit = ease(clamp((h - 0.34) / 0.2));
    p.translate(0, 0, -13);
    p.scale(1.12);
    p.shadow(0, 0, 23, 11, 0.12);
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.12, right: 0.065 });
    // the lid's seam and the slot
    p.line([[-W, D + 0.03, H - 3.2], [W, D + 0.03, H - 3.2], [W + 0.03, -D, H - 3.2]], SH.edge, 0.55);
    p.face([[-6, -0.9, H + 0.02], [6, -0.9, H + 0.02], [6, 0.9, H + 0.02], [-6, 0.9, H + 0.02]], 0.02, 0);
    // the heart on the front: a dark cut at rest, lit once the coin is in
    const beat = 1 + 0.12 * lit * Math.sin(t * 5), s = 4.3 * beat;
    const heart = HEART.map(([a, b]) => [a * s, D + 0.04, 7.2 + b * s * 1.1] as V3);
    p.face(heart, lit > 0.5 ? 0.3 : 0.03, 0);
    p.line([...heart, heart[0]], SH.edge, 0.8);
    // the coin, standing in the slot, cut off where it passes into the box
    const cz = H + 1.6 - k * k * (CR + 2.2);
    if (k < 1) p.screen((c) => {
      const q = ([[-30, 0, H], [30, 0, H], [30, 0, H + 60], [-30, 0, H + 60]] as V3[]).map((v) => p.pt(v));
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      for (let i = 3; i > 0; i--) p.ringV("y", [0, -0.3 * i, cz], CR, SH.right, 0);
      p.ringV("y", [0, 0.05, cz], CR, 0.24, 0);
      p.ringV("y", [0, 0.08, cz], CR - 1.5, 0, SH.edge, 0.7);
    });
    // small hearts floating off
    const f = clamp((h - 0.5) / 0.5);
    if (f > 0) ([[-9, 30, 1.5], [3, 35, 1.9], [12, 29, 1.3]] as [number, number, number][]).forEach(([x, z, r], i) => {
      const C: V3 = [0, 0, 0], rise = 5 * ease(f) + Math.sin(t * 2 + i * 2) * 0.8, g = r * Math.min(1, f * 2.5);
      p.face(HEART.map(([a, b]) => bb(C, x * 0.8 + a * g + Math.sin(t * 1.6 + i) * 0.6, (z - 8 + rise) * 0.8 + b * g)), 0.3, 0);
    });
  },
};
