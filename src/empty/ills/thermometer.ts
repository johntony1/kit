// No temperature logged: a thermometer on a backboard with a scale beside it. Hover and the column climbs past the marks and settles on a reading.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const TX = -2.8, Y = 1.55; // the tube's centre line, the board's front

export const thermometer: Illustration = {
  k: "thermometer", name: "Thermometer", title: "No temperature logged", body: "Take a reading and log it here to follow how it changes.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const s = clamp(h * 1.1);
    const lvl = 26.5 - 13.5 * Math.exp(-4.4 * s) * Math.cos(6.5 * s) + h * Math.sin(t * 2.6) * 0.35;
    p.translate(0, 0, -18);
    p.shadow(0, 1, 22, 10, 0.11);
    p.rotate("z", -0.5);
    // a foot and the backboard
    p.box(-10, -4.5, 0, 20, 9, 2.2, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(-8, -1.5, 2.2, 16, 3, 34, { top: 0.22, left: 0.1, right: 0.055, lw: 0.6 });
    // the scale: long and short marks
    for (let i = 0; i <= 10; i++) {
      const z = 12.5 + i * 2;
      p.line([[1, Y, z], [i % 2 ? 4 : 6, Y, z]], i % 2 ? 0.7 : 1, i % 2 ? 0.45 : 0.6);
    }
    // the glass: a dark tube with a round top, over a bulb
    const tube: V3[] = [[TX - 1.6, Y, 7], [TX + 1.6, Y, 7], ...Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [TX + Math.cos(a) * 1.6, Y, 32.4 + Math.sin(a) * 1.6] as V3; })];
    p.face(tube, 0.02, SH.edge, 0.55);
    // the column and the bulb, bright
    p.face([[TX - 0.85, Y + 0.02, 7], [TX + 0.85, Y + 0.02, 7], [TX + 0.85, Y + 0.02, lvl], [TX - 0.85, Y + 0.02, lvl]], 0.5, SH.edge, 0.5);
    p.ringV("y", [TX, Y + 0.03, 7.4], 3.5, 0.5, SH.edge, 0.6);
    // a marker that rides beside the column
    p.face([[TX + 2.2, Y + 0.02, lvl], [TX + 3.6, Y + 0.02, lvl + 0.9], [TX + 3.6, Y + 0.02, lvl - 0.9]], 0.4 * h, h > 0.05 ? SH.edge : 0, 0.45);
  },
};
