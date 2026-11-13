// No laundry yet: a deep plastic laundry basket with tall slots round its walls, a thick rim and a hand hole at the end. Hover and a folded towel drops in, bounces, and its end flops over the front rim.
import { SH, type Illustration, type V3 } from "../dots";

const L = 13, D = 9, HB = 15; // half length, half depth, height

// height above its rest: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 22;
  if (k < 0.45) return 22 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 2.6 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 0.8 * 4 * v * (1 - v); }
  return 0;
}

export const laundrybasket: Illustration = {
  k: "laundrybasket", name: "Laundry basket", title: "No laundry yet", body: "Add your first load and it will be waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", -0.42);
    // the tub, open at the top: dark inside, a lit long wall, a sparser end
    p.box(-L, -D, 0, L * 2, D * 2, HB, { open: true, left: 0.22, right: 0.13, edge: 0 });
    p.face([[-L, -D, HB + 0.02], [L, -D, HB + 0.02], [L, D, HB + 0.02], [-L, D, HB + 0.02]], 0.03, 0);
    // tall slots cut through the long wall and the end
    for (let i = 0; i < 9; i++) { const x = -L + 2.2 + i * 2.85; p.clear([[x, D + 0.03, 2.5], [x + 1.2, D + 0.03, 2.5], [x + 1.2, D + 0.03, 10], [x, D + 0.03, 10]]); }
    for (let i = 0; i < 6; i++) { const y = -D + 2 + i * 2.85; p.clear([[L + 0.03, y, 2.5], [L + 0.03, y + 1.2, 2.5], [L + 0.03, y + 1.2, 10], [L + 0.03, y, 10]]); }
    // the hand hole high on the end
    p.clear(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [L + 0.03, Math.cos(a) * 3.6, HB - 2.6 + Math.sin(a) * 1.1] as V3; }));
    // the rim: a lit band all round the top, with a cut where it meets the walls
    const R = 1.4, Z = HB + 0.04;
    p.face([[-L - 0.6, D - R, Z], [L + 0.6, D - R, Z], [L + 0.6, D + 0.6, Z], [-L - 0.6, D + 0.6, Z]], 0.32, 0);
    p.face([[L - R, -D - 0.6, Z], [L + 0.6, -D - 0.6, Z], [L + 0.6, D + 0.6, Z], [L - R, D + 0.6, Z]], 0.32, 0);
    p.face([[-L - 0.6, -D - 0.6, Z], [L + 0.6, -D - 0.6, Z], [L + 0.6, -D + R, Z], [-L - 0.6, -D + R, Z]], 0.26, 0);
    p.face([[-L - 0.6, -D - 0.6, Z], [-L + R, -D - 0.6, Z], [-L + R, D + 0.6, Z], [-L - 0.6, D + 0.6, Z]], 0.26, 0);
    p.line([[-L, D + 0.63, HB - 0.6], [L + 0.63, D + 0.63, HB - 0.6], [L + 0.63, -D, HB - 0.6]], SH.edge, 0.6);
    // the towel drops in: a folded slab, then its end flops over the front rim
    const k = Math.min(1, h * 1.25);
    if (k > 0.01) {
      const z = HB - 4 + drop(k);
      p.push();
      p.translate(0, 0, z);
      p.box(-8, -6, 0, 16, 12, 4, { top: 0.34, left: 0.2, right: 0.1, edge: 0 });
      p.line([[-8, 6.03, 2], [8, 6.03, 2]], SH.edge, 0.6);
      p.pop();
      if (k > 0.45) {
        const len = 8 * Math.min(1, (k - 0.45) / 0.2);
        p.face([[-6, 6, HB], [3, 6, HB], [3, D + 0.7, HB + 0.4], [-6, D + 0.7, HB + 0.4]], 0.34, 0);
        p.face([[-6, D + 0.7, HB + 0.4], [3, D + 0.7, HB + 0.4], [3, D + 0.9, HB - len], [-6, D + 0.9, HB - len]], 0.24, 0);
        p.line([[-6, D + 0.95, HB - len], [3, D + 0.95, HB - len]], SH.edge, 0.6);
      }
    }
  },
};
