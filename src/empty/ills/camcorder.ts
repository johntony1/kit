// No recordings yet: a camcorder, its big lens towards us and a handle on top. Hover and its side screen swings out to face forward, lights up, and the record light blinks.
import { type Illustration, type Pen, type V3 } from "../dots";

const X = 6.5, Y0 = -12, Y1 = 7, H = 14; // half width, back, front and height of the body
const LZ = 7.2, LR = 6.4; // lens axis height and radius

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** screen winding: < 0 when a face listed anticlockwise from outside looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

/** a barrel along +y from y0 to y1: strips round its visible side, lit on top, darker below */
function barrel(p: Pen, y0: number, y1: number, r: number) {
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, m = (a0 + a1) / 2;
    if (Math.cos(m) + Math.sin(m) < -0.1) continue;
    const at = (a: number, y: number): V3 => [Math.cos(a) * r, y, LZ + Math.sin(a) * r];
    p.face([at(a0, y0), at(a1, y0), at(a1, y1), at(a0, y1)], Math.sin(m) > 0.35 ? 0.22 : Math.sin(m) > -0.35 ? 0.12 : 0.065, 0);
  }
}

export const camcorder: Illustration = {
  k: "camcorder", name: "Camcorder", title: "No recordings yet", body: "Record your first clip and it will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3, 0, -11);
    p.shadow(2, 0, 30, 12, 0.12);
    p.rotate("z", -0.25);
    // the body: lit top, sparse front round the lens, dense long side
    p.box(-X, Y0, 0, X * 2, Y1 - Y0, H, { top: 0.2, left: 0.065, right: 0.12, edge: 0 });
    // the handle on top: two posts and a bar
    p.box(-1.5, Y0 + 2, H, 3, 2.4, 3.6, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(-1.5, Y1 - 5, H, 3, 2.4, 3.6, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(-1.5, Y0 + 2, H + 3.6, 3, Y1 - Y0 - 4.6, 2.2, { top: 0.26, left: 0.2, right: 0.12, edge: 0 });
    // the lens: a barrel, a lit rim, the dark glass and a glint
    barrel(p, Y1, Y1 + 5, LR);
    p.ringV("y", [0, Y1 + 5, LZ], LR, 0.3, 0);
    p.ringV("y", [0, Y1 + 5.05, LZ], LR - 1.7, 0.02, 0);
    p.dot([-1.5, Y1 + 5.1, LZ + 1.5], 1, 1);
    // the record light on the front, blinking once hovered
    const blink = h > 0.6 ? (Math.sin(t * 6) > -0.2 ? 1 : 0.15) : 0;
    p.dot([X - 1.5, Y1 + 0.05, H - 1.6], 1.1, 0.15 + blink * 0.85);
    // the side screen: hinged at the back of the long side, swinging out to face forward
    const a = -ease(Math.min(1, h * 1.25)) * Math.PI * 0.5;
    const hy = Y0 + 1.5, x0 = X + 0.05, x1 = X + 1.3, ya = hy, yb = hy + 11, z0 = 2.5, z1 = H - 2.5;
    p.push();
    p.rotate("z", a, [x0, hy, 0]);
    const quads: [V3[], number][] = [
      [[[x1, ya, z0], [x1, yb, z0], [x1, yb, z1], [x1, ya, z1]], 0.26], // its outside, lit
      [[[x0, ya, z0], [x0, ya, z1], [x0, yb, z1], [x0, yb, z0]], 0.03], // the screen, dark
      [[[x0, ya, z1], [x1, ya, z1], [x1, yb, z1], [x0, yb, z1]], 0.26], // top edge
      [[[x0, yb, z0], [x1, yb, z0], [x1, yb, z1], [x0, yb, z1]], 0.12], // free end
    ];
    for (const [q, f] of quads) if (facing(p, q) < 0) p.face(q, f, 0);
    // once it faces us: the picture lights up with a play mark on it
    if (h > 0.55) {
      const k = Math.min(1, (h - 0.55) / 0.3), yc = (ya + yb) / 2, zc = (z0 + z1) / 2;
      p.face([[x0 - 0.05, ya + 1, z0 + 1], [x0 - 0.05, yb - 1, z0 + 1], [x0 - 0.05, yb - 1, z1 - 1], [x0 - 0.05, ya + 1, z1 - 1]], 0.22 * k, 0);
      p.face([[x0 - 0.1, yc + 1.6, zc - 2.4], [x0 - 0.1, yc + 1.6, zc + 2.4], [x0 - 0.1, yc - 2.4, zc]], 0.02, 0);
    }
    p.pop();
  },
};
