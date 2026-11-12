// No fine tunes yet: a small console with three faders and a dial. Hover and the faders glide to new settings and the dial turns up.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const TZ = 4.5;
const FADERS: [number, number, number][] = [[-12.5, 4, -4.5], [-6, -3, 3.5], [0.5, 2.5, -2]]; // x, rest, tuned (along y)

export const finetune: Illustration = {
  k: "finetune", name: "Fine tune", title: "No fine tunes yet", body: "Train a model on your own examples. Your tuned versions will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -6);
    p.shadow(0, 0, 31, 15, 0.11);
    p.rotate("z", -0.5);
    p.box(-18, -10, 0, 36, 20, TZ);
    const z = TZ + 0.02;
    p.line([[-18, 10.03, 1.4], [18, 10.03, 1.4]], SH.edge, 0.45);
    // the faders: a dark groove with marks beside it, and a cap that slides
    FADERS.forEach(([x, y0, y1], i) => {
      p.clear([[x - 0.7, -7.5, z], [x + 0.7, -7.5, z], [x + 0.7, 7.5, z], [x - 0.7, 7.5, z]]);
      for (let m = -2; m <= 2; m++) p.line([[x + 1.9, m * 3, z], [x + 2.9, m * 3, z]], SH.edge, 0.4);
      const k = ease(clamp((h - i * 0.14) / 0.6)), y = y0 + (y1 - y0) * k + h * Math.sin(t * 2 + i * 2) * 0.25;
      p.box(x - 2.1, y - 1.5, z, 4.2, 3, 2.4, { top: 0.24, lw: 0.5 });
      p.line([[x - 1.3, y, z + 2.42], [x + 1.3, y, z + 2.42]], SH.edge, 0.7);
    });
    // the dial: a knob with a pointer, ringed by marks
    const cx = 10.5, a = 2.4 - 3.6 * ease(clamp((h - 0.3) / 0.7)) + h * Math.sin(t * 2.4) * 0.06;
    for (let m = 0; m < 7; m++) { const q = 2.4 - m * 0.6; p.line([[cx + Math.cos(q) * 6, Math.sin(q) * 6, z], [cx + Math.cos(q) * 7.1, Math.sin(q) * 7.1, z]] as V3[], SH.edge, 0.45); }
    p.cylinder(cx, 0, z, 4.6, 3.2, { side: 0.12, top: 0.22 });
    p.line([[cx + Math.cos(a) * 1, Math.sin(a) * 1, z + 3.23], [cx + Math.cos(a) * 4, Math.sin(a) * 4, z + 3.23]], SH.edge, 1);
    // a light on the front that comes on when the tune is set
    p.dot([14.5, 10.05, 3], 0.9, h > 0.85 ? 1 : 0);
  },
};
