// No feeds logged: a baby bottle with measuring marks, a screw collar and a teat. Hover and milk pours up into it, sloshing as it settles, and a drop forms at the teat.
import { type Illustration, type V3 } from "../dots";

const R = 7, HB = 20; // body radius and height
const cl = (x: number) => Math.max(0, Math.min(1, x));
const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const A0 = -Math.PI / 4, A1 = (Math.PI * 3) / 4, AM = Math.PI / 5; // the visible half of a round wall, and where its light turns to shade

export const babybottle: Illustration = {
  k: "babybottle", name: "Baby bottle", title: "No feeds logged", body: "Log a feed and the times and amounts will add up here through the day.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.7), lvl = 3 + 12 * (1 - Math.pow(1 - k, 3)), slosh = h * Math.sin(t * 5) * 0.5 * (1 - k * 0.5);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 20, 10, 0.12);
    const band = (r: number, z0: number, z1: number, a0: number, a1: number, f: number) => p.face([...arc(r, z0, a0, a1), ...arc(r, z1, a1, a0)], f, 0);
    // the glass: the far wall inside, faint
    band(R - 0.2, 0, HB, A0 + Math.PI, A1 + Math.PI, 0.05);
    // the milk: a bright column with a lit top that tips as it sloshes
    band(R - 0.4, 0, lvl, A0, AM, 0.2);
    band(R - 0.4, 0, lvl, AM, A1, 0.32);
    p.face(Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * (R - 0.4), Math.sin(a) * (R - 0.4), lvl + Math.cos(a - Math.PI / 4) * slosh] as V3; }), 0.42, 0);
    // the near wall above the milk: clear, a lit strip on the left
    band(R, lvl, HB, A1 - 0.55, A1 - 0.25, 0.2);
    // the measuring marks on the front, as cuts
    for (let i = 1; i <= 4; i++) {
      const z = i * 4, w = i % 2 ? 0.35 : 0.6;
      p.line(arc(R + 0.05, z, Math.PI / 4 - w, Math.PI / 4 + w * 0.2, 4), 1, 0.9);
    }
    // the outline of the body
    p.line([...arc(R + 0.05, 0.2, A0, A1)], 1, 0.6);
    p.line([[R * Math.cos(A0), R * Math.sin(A0), 0], [R * Math.cos(A0), R * Math.sin(A0), HB]], 1, 0.6);
    p.line([[R * Math.cos(A1), R * Math.sin(A1), 0], [R * Math.cos(A1), R * Math.sin(A1), HB]], 1, 0.6);
    // the collar: a lit ring with a groove
    p.cylinder(0, 0, HB, R + 0.6, 4, { side: 0.14, top: 0.22, edge: 0 });
    band(R + 0.62, HB + 2.6, HB + 4, AM, A1, 0.26);
    p.line(arc(R + 0.65, HB + 1.4, A0, A1), 1, 0.8);
    // the teat: a dome of rings stepping in, then the tip
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI * 0.5, r = 1.8 + 3.4 * Math.cos(a), z = HB + 4 + 6.5 * Math.sin(a);
      p.face(arc(r, z, 0, Math.PI * 2, 32), 0.13 + 0.12 * (i / 10), 0);
    }
    p.cylinder(0, 0, HB + 10.5, 1.5, 2.2, { side: 0.16, top: 0.3, edge: 0 });
    // a drop at the tip once it is full
    const d = cl((h - 0.7) / 0.3);
    if (d > 0) p.dot([0, 0, HB + 14.3], 0.6 + 0.6 * d, 1);
  },
};
