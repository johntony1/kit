// No orders yet: a stack of parcels waiting for one more. Hover and the floating parcel drops onto the stack and settles.
import { SH, type Illustration, type Pen } from "../dots";

/** a taped parcel: tape over the top and down the front, a shipping label on the front */
function parcel(p: Pen, x: number, y: number, z: number, w: number, d: number, hh: number, tape = 0.12) {
  p.box(x, y, z, w, d, hh, { top: 0.22, left: 0.13, right: 0.065 });
  const mx = x + w / 2, Z = z + hh, Y = y + d;
  // tape: a darker strip along the top and down the front
  p.face([[mx - 1.3, y, Z + 0.02], [mx + 1.3, y, Z + 0.02], [mx + 1.3, Y, Z + 0.02], [mx - 1.3, Y, Z + 0.02]], tape, SH.edge, 0.5);
  p.face([[mx - 1.3, Y + 0.02, Z], [mx + 1.3, Y + 0.02, Z], [mx + 1.3, Y + 0.02, Z - Math.min(4, hh * 0.5)], [mx - 1.3, Y + 0.02, Z - Math.min(4, hh * 0.5)]], 0.22, SH.edge, 0.5);
  // the label, left of the tape
  const l0 = x + 1.2, l1 = Math.min(mx - 2.2, l0 + 6), z0 = z + 1.3, z1 = z + Math.min(hh - 1.3, 5.2);
  if (l1 - l0 > 2.5) {
    p.face([[l0, Y + 0.03, z0], [l1, Y + 0.03, z0], [l1, Y + 0.03, z1], [l0, Y + 0.03, z1]], 0.26, SH.edge, 0.5);
    p.line([[l0 + 0.9, Y + 0.06, z1 - 1.3], [l1 - 0.9, Y + 0.06, z1 - 1.3]], SH.edge, 0.6);
    p.line([[l0 + 0.9, Y + 0.06, z0 + 1.3], [l0 + (l1 - l0) * 0.55, Y + 0.06, z0 + 1.3]], SH.edge, 0.6);
  }
  // this way up: two small arrows on the right wall
  const X = x + w + 0.03, ay = y + d * 0.3, az = z + hh * 0.35;
  for (const o of [0, 2]) p.line([[X, ay + o - 0.7, az], [X, ay + o, az + 1.2], [X, ay + o + 0.7, az]], SH.edge, 0.55);
}

export const orders: Illustration = {
  k: "orders", name: "Parcels", title: "No orders to ship", body: "When customers place orders, they will be listed here ready to pack and ship.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 30, 14, 0.12);
    // the stack: a wide parcel, a smaller one turned a little on top
    parcel(p, -11, -9, 0, 21, 17, 9);
    p.push(); p.rotate("z", 0.1, [0, 0, 0]);
    parcel(p, -8, -6.5, 9, 15, 12, 7.5);
    p.pop();
    // the new parcel: floats above at rest, drops on hover with a small bounce
    const k = Math.min(1, h);
    const fall = k < 0.72 ? 1 - (k / 0.72) ** 2 : 0.11 * Math.sin(((k - 0.72) / 0.28) * Math.PI);
    const lift = 12 * fall, z0 = 16.5;
    p.push(); p.rotate("z", -0.06, [0, 0, 0]);
    // its landing spot, dashed, with drop lines from the floating corners
    const c: [number, number][] = [[-5, -4.5], [5, -4.5], [5, 4], [-5, 4]];
    if (lift > 0.6) {
      p.guide([...c.map(([x, y]) => [x, y, z0] as [number, number, number]), [c[0][0], c[0][1], z0]], true);
      for (const [x, y] of c.slice(1)) p.guide([[x, y, z0], [x, y, z0 + lift]]);
      // a soft shadow on the parcel below, darker the closer it gets
      p.face(c.map(([x, y]) => [x, y, z0 + 0.03] as [number, number, number]), 0.12 + 0.06 * (1 - fall), 0);
    }
    parcel(p, -5, -4.5, z0 + lift, 10, 8.5, 6.5, 0.34);
    p.pop();
    // a puff where it lands
    if (k > 0.72) for (let i = 0; i < 6; i++) {
      const u = Math.min(1, (k - 0.72) / 0.28 + (t * 0.3) % 0.2), a = i * 1.05;
      p.dot([Math.cos(a) * (7 + u * 4), Math.sin(a) * (6 + u * 3), z0 + 0.5 + u * 2], 0.6, Math.sin(u * Math.PI));
    }
  },
};
