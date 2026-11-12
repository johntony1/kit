// No objectives yet: three progress bars stacked into a rack with a flag at half mast on top. Hover and the bars fill, each a little further than the one below, and the flag runs up its pole.
import { SH, type Illustration } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const FROM = [0.24, 0.16, 0.1], TO = [0.9, 0.64, 0.42]; // how full each bar is, top to bottom
const L = 28, BH = 4.8, GAP = 2;

export const okr: Illustration = {
  k: "okr", name: "Objectives", title: "No objectives yet", body: "Set an objective and track the key results that get you there.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 32, 13, 0.1);
    // the bars, bottom to top: a bright filled part, then the dim rest of the track
    for (let i = 2; i >= 0; i--) {
      const z = (2 - i) * (BH + GAP);
      const f = FROM[i] + (TO[i] - FROM[i]) * ease(clamp((h - 0.08 * (2 - i)) / 0.6)), w = L * f;
      p.box(-14, -2.6, z, w, 5.2, BH, { top: 0.42, left: 0.36, right: 0.14, lw: 0.6 });
      p.box(-14 + w, -2.6, z, L - w, 5.2, BH, { top: 0.12, left: 0.035, right: 0.05, lw: 0.6 });
      if (i > 0) for (const x of [-12, 9.2]) p.box(x, -1.6, z + BH, 2.8, 3.2, GAP, { top: 0.1, left: 0.1, right: 0.05, edge: 0 });
    }
    // the flag on top: half way up at rest, running to the top and waving
    const top = 2 * (BH + GAP) + BH, k = ease(clamp((h - 0.3) / 0.6));
    p.face([[-11.1, 0, top], [-9.7, 0, top], [-9.7, 0, top + 12.6], [-11.1, 0, top + 12.6]], 0.5, SH.edge, 0.7);
    p.dot([-10, 0, top + 12.8], 0.8, 1);
    const fz = top + 7 + 5.2 * k, wave = h * Math.sin(t * 5) * 0.7;
    p.face([[-9.7, 0, fz], [-9.7, 0, fz - 6], [-1.6, 0, fz - 3 + wave]], 0.45, SH.edge, 0.7);
  },
};
