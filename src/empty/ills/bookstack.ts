// Stack of books: three books piled up with an apple on top. Hover and the apple hops while the books shuffle a little out of line.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const TAU = Math.PI * 2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a closed book lying flat, centred on the origin: covers dense, the block of pages sparse, the spine on the right */
function book(p: Pen, w: number, d: number, z: number, hh: number) {
  const x = -w / 2, y = -d / 2, c = 0.9;
  p.box(x, y, z, w, d, hh, { top: 0.3, left: 0.2, right: 0.12, edge: 0 });
  // the pages show along the near side, set in a little from the covers
  p.face([[x + 0.6, y + d + 0.03, z + c], [x + w - 1.2, y + d + 0.03, z + c], [x + w - 1.2, y + d + 0.03, z + hh - c], [x + 0.6, y + d + 0.03, z + hh - c]], 0.06, 0);
  p.line([[x, y + d + 0.03, z + hh], [x + w, y + d + 0.03, z + hh], [x + w + 0.03, y, z + hh]], SH.edge, 0.5);
  // two bands across the spine
  for (const k of [0.22, 0.78]) p.line([[x + w + 0.03, y + d * k, z + 0.4], [x + w + 0.03, y + d * k, z + hh - 0.4]], SH.edge, 0.5);
}

export const bookstack: Illustration = {
  k: "bookstack", name: "Stack of books", title: "No reading yet", body: "Books and articles set for you will be stacked up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, -15);
    p.scale(1.1);
    p.shadow(0, 0, 30, 14, 0.12);
    const turn = (a: number, fn: () => void) => { p.push(); p.rotate("z", a); fn(); p.pop(); };
    turn(0.04 - 0.07 * e, () => book(p, 31, 22, 0, 6));
    turn(-0.13 + 0.25 * e, () => book(p, 27, 19, 6, 5.4));
    turn(0.12 - 0.22 * e, () => book(p, 24, 17, 11.4, 5));
    // the apple: it hops on hover, then bobs
    const up = Math.sin(Math.min(1, h * 1.3) * Math.PI) * 6 + h * Math.abs(Math.sin(t * 3)) * 1.6;
    const r = 6.6, C: V3 = [0, 0, 16.4 + r * 0.8 + up];
    const bb = (u: number, v: number): V3 => [C[0] + u * 0.5774, C[1] - u * 0.5774, C[2] + v];
    // a round fruit, a little wider at the shoulders, with a dip where the stalk sits
    const shape = (k: number, du: number, dv: number): V3[] => Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * TAU, s = Math.sin(a), q = 1 + 0.07 * s - 0.2 * Math.exp(-Math.pow((a - Math.PI / 2) / 0.3, 2)); return bb(Math.cos(a) * r * k * 1.06 + du, s * r * k * q + dv); });
    p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * TAU; return [Math.cos(a) * 3.4 * (1 - up * 0.06), Math.sin(a) * 3.4 * (1 - up * 0.06), 16.43] as V3; }));
    p.face(shape(1, 0, 0), 0.12, 0);
    p.face(shape(0.84, -0.8, 0.6), 0.34, 0);
    // the stalk and a leaf
    const [sx, sy] = p.pt(bb(0, r * 0.72)), [tx, ty] = p.pt(bb(1.2, r * 1.3));
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.lineCap = "round"; g.beginPath(); g.moveTo(sx, sy); g.lineTo(tx, ty); g.stroke(); });
    p.face([bb(1, r * 1.02), bb(3.4, r * 1.5), bb(6.6, r * 1.42), bb(4.4, r * 0.98)], 0.4, 0);
  },
};
