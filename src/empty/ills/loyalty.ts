// No points yet: a stamp card with eight empty rings. Hover and stamps land on it one after another, the last one a star.
import { SH, type Illustration, type V3 } from "../dots";

const CW = 15, CD = 9.5, CT = 1.3, RR = 2; // half width, half depth, thickness, corner radius
const cl = (x: number) => Math.min(1, Math.max(0, x));
// a rounded rectangle at height z
const rr = (z: number): V3[] => {
  const pts: V3[] = [];
  const corners: [number, number, number][] = [[CW - RR, CD - RR, 0], [-CW + RR, CD - RR, 1], [-CW + RR, -CD + RR, 2], [CW - RR, -CD + RR, 3]];
  for (const [x, y, q] of corners) for (let i = 0; i <= 4; i++) { const a = ((q + i / 4) * Math.PI) / 2; pts.push([x + Math.cos(a) * RR, y + Math.sin(a) * RR, z]); }
  return pts;
};
const star = (cx: number, cy: number, z: number, R: number): V3[] =>
  Array.from({ length: 10 }, (_, i) => { const a = Math.PI + (i * Math.PI) / 5, q = i % 2 ? R * 0.45 : R; return [cx + Math.cos(a) * q, cy + Math.sin(a) * q, z] as V3; });

export const loyalty: Illustration = {
  k: "loyalty", name: "Loyalty card", title: "No points yet", body: "Collect a stamp with every order. Your points and rewards will add up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = 3 * cl(h * 2);
    p.translate(0, 0, -3);
    p.shadow(0, 0, 28 - lift, 14 - lift * 0.5, 0.11);
    p.translate(0, 0, lift + (h > 0.9 ? 0.4 * Math.sin(t * 2.2) : 0));
    // the card: a slab with rounded corners
    p.face(rr(0), 0.3, SH.edge, 0.55);
    p.face(rr(CT), 0.11, SH.edge, 0.7);
    const z = CT + 0.03;
    // the heading along the far edge
    p.line([[-CW + 3, -CD + 3.2, z], [-CW + 12, -CD + 3.2, z]], 0.85, 0.8);
    p.line([[CW - 6.5, -CD + 3.2, z], [CW - 3, -CD + 3.2, z]], 0.5, 0.6);
    // eight places for a stamp, in two rows; five fill on hover
    for (let i = 0; i < 8; i++) {
      const cx = -10.2 + (i % 4) * 6.8, cy = -1.4 + Math.floor(i / 4) * 6.4;
      const k = i < 5 ? cl((h - 0.12 - i * 0.14) / 0.2) : 0;
      p.disc(cx, cy, z, 2.5, 0, SH.edge);
      p.clear(Array.from({ length: 20 }, (_, j) => { const a = (j / 20) * Math.PI * 2; return [cx + Math.cos(a) * 2.2, cy + Math.sin(a) * 2.2, z] as V3; }));
      if (k <= 0) continue;
      // the stamp comes down from above, wide, and settles to size
      const up = (1 - k) * 7, s = 1 + (1 - k) * 0.7;
      if (i === 4) {
        p.disc(cx, cy, z + up, 2.5 * s, 1, 0);
        p.face(star(cx, cy, z + up + 0.03, 1.9 * s), 0, 0);
      } else {
        p.disc(cx, cy, z + up, 2.5 * s, 0.85, 0);
        p.line([[cx - 0.2, cy - 1.2, z + up + 0.03], [cx + 1, cy - 0.2, z + up + 0.03], [cx - 1.2, cy + 1.3, z + up + 0.03]], 0, 0.7);
      }
    }
  },
};
