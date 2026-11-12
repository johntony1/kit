// No mixes yet: a two deck mixer. Hover and both platters spin, the crossfader slides across and the level lights jump.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const dj: Illustration = {
  k: "dj", name: "Mixer", title: "No mixes yet", body: "Record a mix or upload one and it will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -5);
    p.scale(0.98);
    p.shadow(0, 0, 32, 16, 0.1);
    const X = 21, Y = 10.5, Z = 4;
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.12, left: 0.12, right: 0.065, lw: 0.65 });
    const z = Z + 0.03, e = ease(h);
    // the two decks: a dark platter with a bright label and a mark that shows the spin
    [-12.6, 12.6].forEach((cx, i) => {
      p.disc(cx, -1, z, 7.6, 0.02, SH.edge);
      p.cylinder(cx, -1, z, 6.7, 0.9, { side: 0.1, top: 0.045, lw: 0.5 });
      const zz = z + 0.95, a = (i ? 2.2 : 0.4) + t * 5 * h * (i ? -1 : 1);
      p.disc(cx, -1, zz, 2.7, 0.5, SH.edge);
      p.line([[cx, -1, zz + 0.02], [cx + Math.cos(a) * 2.6, -1 + Math.sin(a) * 2.6, zz + 0.02]], SH.edge, 0.7);
      const m: V3 = [cx + Math.cos(a) * 5.2, -1 + Math.sin(a) * 5.2, zz];
      p.dot(m, 0.75, 0.95);
      // a cue button in the near corner
      p.box(cx - 1.4 + (i ? 4 : -4), 7, Z, 2.8, 2.2, 0.5, { top: 0.5 + 0.5 * e * (0.5 + 0.5 * Math.sin(t * 6 + i * 3)), left: 0.3, right: 0.2, lw: 0.45 });
    });
    // the middle strip: knobs, two channel faders with level lights between them, and the crossfader
    for (const x of [-2.6, 0, 2.6]) p.cylinder(x, -8, Z, 0.95, 1, { side: 0.2, top: 0.6, lw: 0.4 });
    [-2.6, 2.6].forEach((x, i) => {
      p.clear([[x - 0.4, -5, z], [x + 0.4, -5, z], [x + 0.4, 3, z], [x - 0.4, 3, z]]);
      const y = (i ? 1.4 : -3.4) + (i ? -4 : 4) * e;
      p.box(x - 1.1, y - 0.7, Z, 2.2, 1.4, 1, { top: 0.6, left: 0.4, right: 0.3, lw: 0.45 });
    });
    for (let i = 0; i < 5; i++) {
      const lvl = h * (2.6 + 2.4 * Math.abs(Math.sin(t * 5.5)));
      p.dot([0, 2.6 - i * 1.7, z], 0.55, i < lvl ? 1 : 0.22);
    }
    p.clear([[-3.8, 6.7, z], [3.8, 6.7, z], [3.8, 7.5, z], [-3.8, 7.5, z]]);
    p.box(-3.6 + 5.6 * e - 0.8, 6, Z, 1.6, 2.2, 1.1, { top: 0.6, left: 0.4, right: 0.3, lw: 0.45 });
  },
};
