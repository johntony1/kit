// No pickups waiting: a parcel locker, a wall of small doors round a keypad. Hover and one door swings open on a parcel inside.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 13, D = 5, CW = 8, CH = 8, Z0 = 2; // half width, half depth, door size, height of the first row

export const locker: Illustration = {
  k: "locker", name: "Parcel locker", title: "No pickups waiting", body: "When a parcel is ready to collect, its locker and code will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.2));
    p.translate(0, 0, -15);
    p.shadow(0, 2, 27, 13, 0.11);
    p.rotate("z", -0.5); // turned so the doors face us
    p.box(-W - 0.5, -D, 0, W * 2 + 1, D * 2, Z0 + CH * 3 + 1, { top: 0.22, left: 0.035, right: 0.065 });
    p.box(-W - 1.2, -D - 0.5, Z0 + CH * 3 + 1, W * 2 + 2.4, D * 2 + 1.6, 1.6, { top: 0.26, left: 0.2, right: 0.09 }); // the canopy
    const Y = D + 0.03;
    const cell = (c: number, r: number, g = 1): V3[] => {
      const x0 = -W + 1 + c * CW + g, x1 = x0 + CW - g * 2, z0 = Z0 + r * CH + g, z1 = z0 + CH - g * 2;
      return [[x0, Y, z0], [x1, Y, z0], [x1, Y, z1], [x0, Y, z1]];
    };
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const q = cell(c, r);
      if (c === 1 && r === 1) {
        // the keypad: a bright screen over six keys
        p.face(q, 0.03, SH.edge, 0.5);
        const [x0, , z0] = q[0];
        p.face([[x0 + 1, Y, z0 + 4], [x0 + 5.6, Y, z0 + 4], [x0 + 5.6, Y, z0 + 5.9], [x0 + 1, Y, z0 + 5.9]], 0.3 + 0.5 * k, SH.edge, 0.45);
        for (let i = 0; i < 6; i++) p.dot([x0 + 1.6 + (i % 3) * 1.7, Y, z0 + 2.8 - Math.floor(i / 3) * 1.5], 0.45, 0.9);
      } else if (c === 0 && r === 1) {
        // the open locker: dark inside, a parcel waiting
        p.clear(q);
        const [x0, , z0] = q[0];
        if (k > 0.02) {
          p.box(x0 + 1.2, 1, z0 + 0.1, 4.4, 3.2, 3.8, { top: 0.5 * k, left: 0.38 * k, right: 0.2 * k, edge: k });
          p.line([[x0 + 3.4, 4.24, z0 + 3.9], [x0 + 3.4, 4.24, z0 + 2.4]], k, 0.6);
        }
        // its door, hinged on the left, swinging out toward us
        p.push();
        p.rotate("z", k * 1.75 + (k > 0.9 ? 0.04 * Math.sin(t * 2.4) : 0), [q[0][0], Y, 0]);
        p.face(q, 0.2, SH.edge, 0.6);
        p.dot([q[1][0] - 1.3, Y + 0.02, z0 + 3.3], 0.55, 1);
        p.pop();
      } else {
        p.face(q, 0.2, SH.edge, 0.5);
        p.dot([q[1][0] - 1.3, Y + 0.02, q[0][2] + 3.3], 0.5, 1);
        p.line([[q[0][0] + 1.2, Y + 0.02, q[2][2] - 1.5], [q[0][0] + 3.4, Y + 0.02, q[2][2] - 1.5]], 0.7, 0.5);
      }
    }
  },
};
