// No brunch yet: a thick square waffle with a grid of deep pockets. Hover and a pat of butter drops on with a bounce, then syrup fills the pockets from the middle out.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const N = 4, S = 7, W = N * S, T = 4.2, D = 2.2, RIM = 1.6; // pockets a side, pitch, width, thickness, pocket depth, ridge
const X0 = -W / 2;
/** butter height above the top: a drop, a bounce, rest */
const drop = (k: number) => (k <= 0 ? 24 : k < 0.5 ? 24 * (1 - Math.pow(k / 0.5, 2)) : k < 0.75 ? 3 * Math.sin(((k - 0.5) / 0.25) * Math.PI) : 0);

export const waffle: Illustration = {
  k: "waffle", name: "Waffle", title: "No brunch yet", body: "Brunch you order will show up here. Pick something to start your morning.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -6);
    p.scale(1.12);
    p.shadow(0, 0, 32, 16, 0.12);
    // the waffle: a lit slab, its sides scored where the pockets meet them
    p.box(X0, X0, 0, W, W, T, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    for (let i = 1; i < N; i++) {
      p.line([[X0 + i * S, -X0 + 0.03, 0.6], [X0 + i * S, -X0 + 0.03, T - 0.3]], 1, 0.6);
      p.line([[-X0 + 0.03, X0 + i * S, 0.6], [-X0 + 0.03, X0 + i * S, T - 0.3]], 1, 0.6);
    }
    // the pockets: a dark floor, its two far walls catching light; syrup fills them from the middle out
    const syrup = (h - 0.55) / 0.4;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = X0 + i * S + RIM / 2, y = X0 + j * S + RIM / 2, w = S - RIM, z = T, zb = T - D;
      const dist = Math.hypot(i - 1.5, j - 1.5) / 2.2, f = ease((syrup - dist * 0.6) / 0.4);
      p.face([[x, y, zb], [x + w, y, zb], [x + w, y + w, zb], [x, y + w, zb]], 0.03, 0);
      p.face([[x, y, zb], [x + w, y, zb], [x + w, y, z], [x, y, z]], 0.12, 0);
      p.face([[x, y, zb], [x, y + w, zb], [x, y + w, z], [x, y, z]], 0.065, 0);
      if (f > 0) {
        const zs = zb + (D - 0.3) * f;
        p.face([[x, y, zs], [x + w, y, zs], [x + w, y + w, zs], [x, y + w, zs]], 0.45, 0);
      }
    }
    // the butter: a soft square pat that drops onto the middle
    const k = Math.min(1, h / 0.6);
    if (k > 0) {
      const z = T + drop(k), b = 4.6;
      p.box(-b, -b, z, b * 2, b * 2, 2.4, { top: 0.45, left: 0.3, right: 0.16, edge: 0 });
    }
  },
};
