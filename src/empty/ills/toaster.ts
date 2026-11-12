// Toaster: a rounded toaster seen front on, two slices of bread standing tall out of its slots and a lever on the side. Hover: the lever goes down, then the toast pops up.
import { type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 17, T = 16, RC = 5, D = 11, OX = -4.5, OY = -19; // half width, height, corner radius, depth, where its front foot stands
/** front on, with a little depth d going back up and to the right */
const B = (u: number, v: number, d = 0): V3 => { const x = OX + u + d * 0.5, y = OY + v + d * 0.36; return [x * K, -x * K, y]; };
// the body seen from the front: square at the bottom, round at the top
const prof: P2[] = (() => {
  const o: P2[] = [[-W, 0], [-W, T - RC]];
  for (let i = 1; i <= 8; i++) { const a = Math.PI - (i / 8) * (Math.PI / 2); o.push([-W + RC + RC * Math.cos(a), T - RC + RC * Math.sin(a)]); }
  for (let i = 1; i <= 8; i++) { const a = Math.PI / 2 - (i / 8) * (Math.PI / 2); o.push([W - RC + RC * Math.cos(a), T - RC + RC * Math.sin(a)]); }
  o.push([W, 0]);
  return o;
})();
// a slice of bread standing s above the slot: straight sides and a wide round top
const bread = (s: number): P2[] => {
  const o: P2[] = [[9, 0], [9, s - 5.4]];
  for (let i = 0; i <= 20; i++) { const a = -0.55 + (i / 20) * (Math.PI + 1.1); o.push([11.2 * Math.cos(a), s - 3.6 + 3.6 * Math.sin(a)]); }
  o.push([-9, s - 5.4], [-9, 0]);
  return o;
};

export const toaster: Illustration = {
  k: "toaster", name: "Toaster", title: "Nothing toasting", body: "Start something and you can watch it come up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // the slices sink with the lever, then pop up past their rest and settle
    const s = h < 0.35 ? 13 - 8 * ease(h / 0.35) : h < 0.7 ? 5 + 11 * ease((h - 0.35) / 0.35) : 16 - 3 * ease((h - 0.7) / 0.3);
    const lev = h < 0.35 ? 10.5 - 6.5 * ease(h / 0.35) : h < 0.6 ? 4 + 6.5 * ease((h - 0.35) / 0.25) : 10.5;
    p.push(); p.translate(0, 0, -21); p.shadow(0, 0, 27, 11, 0.11); p.pop();
    // the top (lit) and the right end (in shade), wrapped round the corners
    for (let i = 1; i < prof.length - 1; i++) {
      const [x0, z0] = prof[i], [x1, z1] = prof[i + 1], l = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / l, nz = (x1 - x0) / l;
      if (nx < -0.3) continue;
      p.face([B(x0, z0), B(x1, z1), B(x1, z1, D), B(x0, z0, D)], nz > 0.5 ? 0.12 : 0.065, 0);
    }
    // two slots, a slice standing in each: the far one first, in half tone, off to the right and higher
    for (const [d, du, up, tone] of [[8, 3.2, 3.4, 0.13], [3.4, -1.5, 0, 0.3]]) {
      p.clear([B(-12.5, T, d - 1.3), B(12.5, T, d - 1.3), B(12.5, T, d + 1.3), B(-12.5, T, d + 1.3)]);
      const b = bread(s + up).map(([x, z]) => B(x + du, T + z, d));
      p.face(b, tone, 0);
      if (tone > 0.2) p.line([...b, b[0]], 1, 1.2);
    }
    // the lever on the right end: a bright knob in a dark track
    p.line([B(W, 3, D * 0.5), B(W, 13, D * 0.5)], 1, 1);
    p.face([B(W, lev - 2, D * 0.5 - 2), B(W + 7, lev - 2, D * 0.5 - 2), B(W + 7, lev + 2, D * 0.5 - 2), B(W, lev + 2, D * 0.5 - 2)], 0.3, 0);
    // the front, bright, with a seam along the bottom and a round dial cut into it
    p.face(prof.map(([x, z]) => B(x, z)), 0.22, 0);
    p.line([B(-W, 3.2), B(W, 3.2)], 1, 1);
    p.dot(B(10.5, 9.6), 2.4, 0);
    p.dot(B(10.5, 9.6), 0.8, 1);
    // two feet
    for (const u of [-13, 9]) p.face([B(u, -1.6), B(u + 4, -1.6), B(u + 4, 0), B(u, 0)], 0.3, 0);
  },
};
