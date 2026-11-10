// No discounts right now: a price tag hanging on a string from a peg, swinging gently.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const T = 0.7; // half thickness of the tag
const PX = 0, PZ = 33; // the hook the string hangs from
// the tag's outline in its own plane (x across, z up), hole end on top, measured from the hook
const TAG: [number, number][] = [[-3, -5.4], [3, -5.4], [7, -10], [7, -31], [-7, -31], [-7, -10]];

// the tag as a thick card standing in the plane y = 0; a: how far it has swung (radians)
function card(p: Pen, a: number) {
  const n = TAG.length, c = Math.cos(a), s = Math.sin(a);
  const P = (x: number, z: number, y: number): V3 => [PX + x, y, PZ + z];
  // the rim: edges whose outward side, once swung, faces up or toward +x
  for (let i = 0; i < n; i++) {
    const [x0, z0] = TAG[i], [x1, z1] = TAG[(i + 1) % n];
    let nx = z0 - z1, nz = x1 - x0; // outward: the outline runs clockwise
    const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    const wx = c * nx + s * nz, wz = -s * nx + c * nz;
    if (wx + wz <= 0.02) continue;
    p.face([P(x0, z0, -T), P(x1, z1, -T), P(x1, z1, T), P(x0, z0, T)], wz > wx ? SH.top : SH.right, 0);
  }
  p.face(TAG.map(([x, z]) => P(x, z, T)), 0.24, 0);
  // the hole, with a reinforcing ring
  const hole = (r: number) => Array.from({ length: 20 }, (_, i) => { const u = (i / 20) * Math.PI * 2; return P(Math.cos(u) * r, -8.2 + Math.sin(u) * r, T + 0.04); });
  p.line([...hole(1.8), hole(1.8)[0]], SH.edge, 0.5);
  p.clear(hole(0.9));
  // a big percent sign, then a rule for the price
  const ring = (cx: number, cz: number) => Array.from({ length: 17 }, (_, i) => { const u = (i / 16) * Math.PI * 2; return P(cx + Math.cos(u) * 1.6, cz + Math.sin(u) * 2, T + 0.04); });
  p.line(ring(-2.4, -14), SH.edge, 0.9);
  p.line(ring(2.4, -21.6), SH.edge, 0.9);
  p.line([P(3.4, -12.6, T + 0.04), P(-3.4, -23, T + 0.04)], SH.edge, 1);
  p.line([P(-4.4, -27, T + 0.04), P(4.4, -27, T + 0.04)], SH.edge, 0.65);
}

export const tag: Illustration = {
  k: "tag", name: "Price tag", title: "No discounts right now", body: "When a deal or a coupon is running, you will find it here.",
  kind: "loop", period: 3.2, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = 0.2 * Math.sin((Math.PI * 2 * t) / 3.2);
    p.translate(1.3, -1.3, -19.5);
    p.shadow(0, 0, 14, 6, 0.1);
    // the peg it hangs from: a small plate with a rod sticking out toward us
    p.box(-3, -3.4, PZ + 0.4, 6, 1.6, 5, { top: 0.22, left: 0.14, right: 0.065 });
    p.box(-0.7, -1.8, PZ + 1.4, 1.4, 3, 1.4, { top: 0.26, left: 0.2, right: 0.065 });
    p.push();
    p.rotate("y", a, [PX, 0, PZ + 2]);
    // the string: a loop from the peg down through the hole
    p.face([[PX - 0.5, 0.1, PZ + 2], [PX + 0.2, 0.1, PZ + 2], [PX - 1.2, 0.1, PZ - 7], [PX - 1.9, 0.1, PZ - 7]], 0.26, 0);
    p.face([[PX - 0.2, 0.1, PZ + 2], [PX + 0.5, 0.1, PZ + 2], [PX + 1.9, 0.1, PZ - 7], [PX + 1.2, 0.1, PZ - 7]], 0.26, 0);
    card(p, a);
    // the string's front strand, over the card and into the hole
    p.face([[PX - 0.3, T + 0.1, PZ - 4.4], [PX + 0.3, T + 0.1, PZ - 4.4], [PX + 0.3, T + 0.1, PZ - 7.4], [PX - 0.3, T + 0.1, PZ - 7.4]], 0.3, 0);
    p.pop();
    p.dot([0, 1.2, PZ + 2.1], 0.9, 1); // the peg's end
  },
};
