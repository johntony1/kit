// No calls yet: an old rotary phone, the receiver resting across its top and a big round dial on its sloped front. The dial is wound round and runs back, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const B = 15, D = 11, T = 11, TD = 6, H = 17; // base half width and depth, top half width and depth, height

export const rotaryphone: Illustration = {
  k: "rotaryphone", name: "Rotary phone", title: "No calls yet", body: "Calls you make and receive will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const turn = u < 0.42 ? 2 * ease(u / 0.42) : u < 0.82 ? 2 * (1 - ease((u - 0.42) / 0.4)) : 0;
    p.translate(0, 0, -15);
    p.shadow(0, 1, 28, 13, 0.12);
    p.rotate("z", -0.62);
    // the body: a block that narrows to its top, lit top, dense sloped front, sparse end
    p.face([[-T, -TD, H], [T, -TD, H], [T, TD, H], [-T, TD, H]], 0.09, 0);
    p.face([[-B, D, 0], [B, D, 0], [T, TD, H], [-T, TD, H]], 0.14, 0);
    p.face([[B, -D, 0], [B, D, 0], [T, TD, H], [T, -TD, H]], 0.065, 0);
    p.line([[-B, D, 0], [B, D, 0], [B, -D, 0]], 1, 0.5);
    // the dial on the sloped front: a point (a across, v up the slope) on the face
    const len = Math.hypot(D - TD, H), vy = -(D - TD) / len, vz = H / len, ny = H / len, nz = (D - TD) / len;
    const at = (a: number, v: number, off = 0.15): V3 => [a, (D + TD) / 2 + vy * v + ny * off, H / 2 + vz * v + nz * off];
    const circ = (ca: number, cv: number, r: number, off: number, n = 32): V3[] =>
      Array.from({ length: n }, (_, i) => { const s = (i / n) * Math.PI * 2; return at(ca + Math.cos(s) * r, cv + Math.sin(s) * r, off); });
    p.face(circ(0, 0, 8.4, 0.1, 40), 0.3, 0);
    p.face(circ(0, 0, 7.7, 0.25, 40), 0.035, 0);
    // ten finger holes, wound round clockwise by the turn
    for (let i = 0; i < 10; i++) {
      const a = 0.2 + i * 0.5 - turn;
      p.face(circ(Math.cos(a) * 5.5, Math.sin(a) * 5.5, 1.45, 0.35, 14), 0.45, 0);
    }
    p.face(circ(0, 0, 2.6, 0.35, 20), 0.3, 0);
    // the finger stop, low on the right
    p.line([at(Math.cos(-0.45) * 6.2, Math.sin(-0.45) * 6.2, 0.4), at(Math.cos(-0.45) * 8.4, Math.sin(-0.45) * 8.4, 0.4)], 1, 1.1);
    // the receiver: two prongs, then the handle and its two cups lying across the top
    p.box(-9, -1.2, H, 2.2, 2.4, 3.2, { top: 0.3 });
    p.box(6.8, -1.2, H, 2.2, 2.4, 3.2, { top: 0.3 });
    p.box(-15.5, -4, H + 2, 6.5, 8, 4.8, { top: 0.26 });
    p.box(-9, -2.2, H + 3.2, 18, 4.4, 3.2, { top: 0.26 });
    p.box(9, -4, H + 2, 6.5, 8, 4.8, { top: 0.26 });
  },
};
