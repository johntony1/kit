// Nothing playing: a striped tub of popcorn. Kernels keep popping out of the top and tumbling down to the floor.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const B = 6.6, T = 9.8, H = 21; // half width at the bottom and at the top, height
// the heap: [x, y, z, size], back to front
const HEAP: [number, number, number, number][] = [
  [-5, -5, 23, 3.4], [2, -6, 24, 3.6], [-7, 1, 23, 3.3], [6, -2, 23.5, 3.5], [-1, -1, 27, 4], [-5, 5, 23.5, 3.5],
  [4, 3, 26, 3.8], [0, 6, 23.5, 3.6], [6, 6, 23, 3.3], [-2, 2, 29.5, 3.4],
];
const K = 0.816; // makes a circle drawn across the screen plane round
/** one puff: three lobes that face the screen, each a lit disc with an outline */
function puff(p: Pen, [x, y, z]: V3, r: number, turn: number) {
  for (let l = 0; l < 3; l++) {
    const a = turn + (l * Math.PI * 2) / 3, ox = Math.cos(a) * r * 0.42, oz = Math.sin(a) * r * 0.36, rr = r * 0.62;
    const ring: V3[] = Array.from({ length: 14 }, (_, i) => { const q = (i / 14) * Math.PI * 2, u = (ox + Math.cos(q) * rr) * K * 0.707; return [x + u, y - u, z + oz + Math.sin(q) * rr] as V3; });
    p.face(ring, 0.26, 0);
    p.line([...ring, ring[0]], SH.edge, 0.5);
  }
}

export const popcorn: Illustration = {
  k: "popcorn", name: "Popcorn", title: "Nothing playing", body: "Pick something to watch and it will start playing here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 12, 0.11);
    // the kernels that fall behind the tub go first
    const fly = [0, 1, 2, 3].map((i) => {
      const u = (ph + i / 4) % 1, a = [2.5, -0.6, 0.9, 4.1][i], d = 17 * u;
      return { i, u, at: [Math.cos(a) * d, Math.sin(a) * d, 26 + 44 * u - 68 * u * u + 0.6] as V3, r: 3 * Math.min(1, u * 6) * Math.min(1, (1 - u) * 5), back: Math.cos(a) + Math.sin(a) < 0 };
    });
    for (const f of fly) if (f.back && f.r > 0.2) puff(p, f.at, f.r, f.u * 9 + f.i);
    // the tub: two striped walls that widen toward the top
    const N = 6;
    for (let i = 0; i < N; i++) {
      const u0 = -1 + (i * 2) / N, u1 = u0 + 2 / N, lit = i % 2 === 0;
      p.face([[u0 * B, B, 0], [u1 * B, B, 0], [u1 * T, T, H], [u0 * T, T, H]], lit ? 0.24 : 0.035, 0);
      p.face([[B, -u0 * B, 0], [B, -u1 * B, 0], [T, -u1 * T, H], [T, -u0 * T, H]], lit ? 0.11 : 0.02, 0);
    }
    p.line([[-B, B, 0], [B, B, 0], [B, -B, 0]], SH.edge, 0.6);
    p.line([[-B, B, 0], [-T, T, H]], SH.edge, 0.6); p.line([[B, B, 0], [T, T, H]], SH.edge, 0.6); p.line([[B, -B, 0], [T, -T, H]], SH.edge, 0.6);
    // the rolled rim
    p.face([[-T, -T, H], [T, -T, H], [T, T, H], [-T, T, H]], 0.03, 0);
    p.box(-T - 0.5, T - 0.4, H - 0.6, T * 2 + 1, 0.9, 1.7, { top: 0.3, left: 0.3, right: 0.2, lw: 0.5 });
    p.box(T - 0.4, -T - 0.5, H - 0.6, 0.9, T * 2 + 1, 1.7, { top: 0.3, left: 0.3, right: 0.2, lw: 0.5 });
    // the heap, breathing a touch as kernels pop
    HEAP.forEach(([x, y, z, r], i) => puff(p, [x, y, z + 0.5 * Math.sin(ph * Math.PI * 2 + i * 1.9)], r, i * 1.3));
    for (const f of fly) if (!f.back && f.r > 0.2) puff(p, f.at, f.r, f.u * 9 + f.i);
  },
};
