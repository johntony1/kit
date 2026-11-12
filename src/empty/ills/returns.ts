// No returns: a taped parcel. An arrow sweeps back over it from right to left, the parcel nudges back with it, then the arrow fades.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.min(1, Math.max(0, x));

export const returns: Illustration = {
  k: "returns", name: "Return parcel", title: "No returns", body: "If anything is sent back, you can follow it from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const head = ease(cl((u - 0.06) / 0.4)), tail = ease(cl((u - 0.62) / 0.3));
    const nudge = Math.sin(cl((u - 0.3) / 0.45) * Math.PI);
    p.translate(0, 0, -13);
    p.shadow(0, 0, 25, 12, 0.11);
    p.rotate("z", -0.5);
    // the parcel, nudged back the way the arrow points
    const W = 9, D = 7.5, H = 12.5, x = -nudge * 2.2;
    p.box(x - W, -D, 0, W * 2, D * 2, H, { top: 0.22, left: 0.13, right: 0.07 });
    p.face([[x - 2, -D, H + 0.02], [x + 2, -D, H + 0.02], [x + 2, D, H + 0.02], [x - 2, D, H + 0.02]], 0.4, 0.7, 0.4); // tape
    p.face([[x - 2, D + 0.02, H], [x + 2, D + 0.02, H], [x + 2, D + 0.02, H - 4], [x - 2, D + 0.02, H - 4]], 0.32, 0.7, 0.4);
    // the label on the front, with a small turn back mark
    p.face([[x - 7, D + 0.03, 2], [x - 0.5, D + 0.03, 2], [x - 0.5, D + 0.03, 6.6], [x - 7, D + 0.03, 6.6]], 0.3, 0.8, 0.45);
    p.line([[x - 2, D + 0.06, 3.2], [x - 5.4, D + 0.06, 3.2], [x - 5.4, D + 0.06, 5.2], [x - 2.6, D + 0.06, 5.2]], SH.edge, 0.6);
    p.line([[x - 3.6, D + 0.06, 6], [x - 2.4, D + 0.06, 5.2], [x - 3.6, D + 0.06, 4.4]], SH.edge, 0.6);
    // the arrow: a band arching over the parcel from the right, its head leading
    const A0 = -0.42, A1 = Math.PI + 0.3;
    const a0 = A0 + (A1 - A0) * tail, a1 = A0 + (A1 - A0) * head;
    if (a1 - a0 > 0.05) {
      const at = (a: number, r: number): V3 => [Math.cos(a) * (16 + r), 0, 9 + Math.sin(a) * (17 + r)];
      const n = 28, o: V3[] = [], i: V3[] = [];
      for (let j = 0; j <= n; j++) { const a = a0 + ((a1 - a0) * j) / n; o.push(at(a, 1.3)); i.push(at(a, -1.3)); }
      p.face([...o, ...i.reverse()], 0.5, SH.edge, 0.6);
      // the head: a triangle along the arc
      const d = 0.34;
      p.face([at(a1 - 0.02, 3.6), at(a1 + d, 0), at(a1 - 0.02, -3.6)], 0.9, SH.edge, 0.6);
    }
  },
};
