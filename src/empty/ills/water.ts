// No water logged: a clear bottle with a little water in the bottom. Hover and it fills up, bubbles rising, with a sparkle when it is full.
import { SH, type Illustration, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 8, H = 24; // the body
const arc = (r: number, z: number): V3[] => Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const water: Illustration = {
  k: "water", name: "Water bottle", title: "No water logged", body: "Log a glass of water to start tracking how much you drink.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.75)), L = 4.5 + 14.5 * k + h * Math.sin(t * 3) * 0.3;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 19, 9, 0.12);
    // the water, bright, then the empty glass above it
    p.cylinder(0, 0, 0, R, L, { side: 0.22, top: 0.3 });
    p.cylinder(0, 0, L, R, H - L, { side: 0.065, top: 0.12 });
    p.line(arc(R, L), SH.edge, 0.9);
    // bubbles rising while it fills
    if (h > 0.05) for (let i = 0; i < 4; i++) {
      const u = (t * 0.7 + i * 0.27) % 1, a = 0.2 + i * 0.45;
      p.dot([Math.cos(a) * (R + 0.1), Math.sin(a) * (R + 0.1), 1 + u * (L - 2.5)], 0.75, 0);
    }
    // the shoulder, the neck and a ribbed cap with a carry loop
    p.line(arc(R, H), SH.edge, 0.7);
    p.cylinder(0, 0, H, 6.4, 1.4, { side: 0.1, top: 0.14 });
    p.cylinder(0, 0, H + 1.4, 4, 2, { side: 0.065, top: 0.12 });
    p.cylinder(0, 0, H + 3.4, 5, 4, { side: 0.2, top: 0.3 });
    for (let i = 1; i < 8; i++) { const a = -Math.PI / 4 + (Math.PI * i) / 8; p.line([[Math.cos(a) * 5.02, Math.sin(a) * 5.02, H + 3.8], [Math.cos(a) * 5.02, Math.sin(a) * 5.02, H + 7]], SH.edge, 0.6); }
    p.line([...arc(5, H + 3.4)], SH.edge, 0.7);
    // sparkles when it is full
    const s = cl((h - 0.78) / 0.22);
    if (s > 0) ([[-13, 4, 22], [9, -9, 30], [14, 2, 14]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.45 * Math.sin(t * 3.2 + i * 2.1), s));
  },
};
