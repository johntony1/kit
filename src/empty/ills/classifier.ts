// Nothing sorted yet: two big open bins side by side, one marked with a circle and one with a triangle. A ball drops into the circle bin, then a block drops into the triangle bin, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const W = 15, Dp = 13, H = 17; // bin width, depth, height
const X0 = [-17, 2]; // where each bin starts along x

export const classifier: Illustration = {
  k: "classifier", name: "Classifier", title: "Nothing sorted yet", body: "Send some items through and they will be sorted into the right groups here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 32, 12, 0.12);
    p.rotate("z", -0.42);
    const y0 = -Dp / 2, y1 = Dp / 2;
    X0.forEach((x0, i) => {
      const x1 = x0 + W, cx = x0 + W / 2;
      // the dark mouth and the two far inside walls
      p.face([[x0, y0, H], [x1, y0, H], [x1, y1, H], [x0, y1, H]], 0.035, 0);
      p.face([[x0, y0, 3], [x1, y0, 3], [x1, y0, H], [x0, y0, H]], 0.09, 0);
      p.face([[x0, y0, 3], [x0, y1, 3], [x0, y1, H], [x0, y0, H]], 0.05, 0);
      // this bin's item: appears just above the rim and drops in
      const k = (u - i * 0.5 + 1) % 1;
      if (k < 0.42) {
        const grow = Math.min(1, k / 0.08), f = Math.max(0, (k - 0.08) / 0.3);
        const z = H + 3 - 12 * Math.min(1, f * f);
        if (i === 0) {
          const r = 3.6 * grow;
          const disc = (rr: number, dz: number, du: number): V3[] => Array.from({ length: 28 }, (_, j) => { const s = (j / 28) * Math.PI * 2, w = Math.cos(s) * rr + du; return [cx + w * 0.577, -w * 0.577, z + r + dz + Math.sin(s) * rr] as V3; });
          p.face(disc(r, 0, 0), 0.14, 0);
          p.face(disc(r * 0.7, r * 0.2, -r * 0.2), 0.42, 0);
        } else {
          const s = 6 * grow;
          p.push();
          p.rotate("z", 0.5 + k * 2, [cx, 0, 0]);
          p.box(cx - s / 2, -s / 2, z, s, s, s, { top: 0.42, left: 0.16, right: 0.065, edge: 0 });
          p.pop();
        }
      }
      // the outer walls: a lit front, a shaded end
      p.face([[x0, y1, 0], [x1, y1, 0], [x1, y1, H], [x0, y1, H]], 0.22, 0);
      p.face([[x1, y0, 0], [x1, y1, 0], [x1, y1, H], [x1, y0, H]], 0.065, 0);
      // a bright rim round the top
      const e = 1.3;
      p.face([[x0, y0, H], [x1, y0, H], [x1, y0 + e, H], [x0, y0 + e, H]], 0.3, 0);
      p.face([[x0, y0, H], [x0 + e, y0, H], [x0 + e, y1, H], [x0, y1, H]], 0.3, 0);
      p.face([[x1 - e, y0, H], [x1, y0, H], [x1, y1, H], [x1 - e, y1, H]], 0.3, 0);
      p.face([[x0, y1 - e, H], [x1, y1 - e, H], [x1, y1, H], [x0, y1, H]], 0.3, 0);
      // the mark cut into the front: a thick circle or a thick triangle
      const fy = y1 + 0.03, mz = H / 2 - 0.5;
      const shape = (r: number, dy: number): V3[] => i === 0
        ? Array.from({ length: 36 }, (_, j) => { const a = (j / 36) * Math.PI * 2; return [cx + Math.cos(a) * r, fy + dy, mz + Math.sin(a) * r] as V3; })
        : [0, 1, 2].map((j) => { const a = Math.PI / 2 + (j * 2 * Math.PI) / 3; return [cx + Math.cos(a) * r * 1.2, fy + dy, mz - 0.6 + Math.sin(a) * r * 1.2] as V3; });
      p.clear(shape(5, 0));
      p.face(shape(i === 0 ? 3.2 : 2.6, 0.02), 0.22, 0);
    });
  },
};
