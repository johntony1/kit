// Hand with coin: an open hand seen from above, fingers spread and thumb out, one large coin over the palm. Hover and the coin drops into the palm with a bounce.
import { type Illustration, type V3 } from "../dots";

const T = 2.5; // the hand's thickness
const S = { top: 0.2, left: 0.1, right: 0.2, edge: 0 };

// height of the coin above the palm: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 24;
  if (k < 0.45) return 24 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 5 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 1.6 * 4 * v * (1 - v); }
  return 0;
}
const ring = (cx: number, cy: number, z: number, r: number): V3[] => Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const contribution: Illustration = {
  k: "contribution", name: "Hand with coin", title: "No contributions yet", body: "Make your first contribution and it will be recorded here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 22, 10, 0.08);
    // seen from above, the hand reaching up to the right
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.45);
    p.rotate("z", -0.5);
    p.scale(1.12);
    p.translate(5.5, 1, 0);
    // a bright cuff
    p.box(-21.5, -6.9, 0, 5, 13.8, 3.4, { top: 0.3, left: 0.2, right: 0.3, edge: 0 });
    // the thumb, out to the far side
    p.push();
    p.rotate("z", -0.85, [-12, -5, 0]);
    p.box(-12, -7, 0, 10.5, 3.4, T, S);
    p.pop();
    // the palm, and four fingers of different lengths with clear gaps
    p.box(-16.5, -6.6, 0, 13.5, 13.2, T, S);
    p.line([[-16.5, -6.6, T + 0.03], [-16.5, 6.6, T + 0.03]], 1, 0.9);
    [10, 13, 12, 8.5].forEach((l, i) => {
      p.push();
      p.rotate("z", (i - 1.5) * 0.07, [-3, 0, 0]);
      p.box(-3.4, -6.6 + i * 3.7, 0, l + 0.4, 2.1, T, { top: 0.2, left: 0, right: 0.2, edge: 0 });
      p.pop();
    });
    // the coin: large and bright, lying flat, dropping into the palm
    const z = T + 0.05 + drop(Math.min(1, h * 1.15)), cx = -9.6, cy = 0;
    p.clear(ring(cx, cy, z, 5.8));
    p.disc(cx, cy, z + 0.02, 4.9, 0.3);
    p.line(ring(cx, cy, z + 0.04, 3.2), 1, 0.8);
    p.line([[cx - 1.1, cy + 1.1, z + 0.04], [cx + 1.1, cy - 1.1, z + 0.04]], 1, 0.9);
  },
};
