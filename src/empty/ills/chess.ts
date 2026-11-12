// No games in progress: a corner of a chessboard with a king and a pawn. Hover and the pawn hops one square forward.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = 7.4, TOP = 1.8; // square size, board thickness
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a turned piece: rings of [radius, height] stacked from the board up; returns the height reached */
function lathe(p: Pen, x: number, y: number, z: number, parts: [number, number][]) {
  for (const [r, hh] of parts) { p.cylinder(x, y, z, r, hh, { side: 0.13, top: 0.26, lw: 0.5 }); z += hh; }
  return z;
}
/** a ball that faces the screen */
function ball(p: Pen, [x, y, z]: V3, r: number) {
  const ring: V3[] = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2, u = Math.cos(a) * r * 0.577; return [x + u, y - u, z + Math.sin(a) * r] as V3; });
  p.face(ring, 0.26, 0);
  p.line([...ring, ring[0]], SH.edge, 0.5);
}

export const chess: Illustration = {
  k: "chess", name: "Chess", title: "No games in progress", body: "Start a game or accept a challenge and it will be waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 15, 0.1);
    // the board: sixteen squares on a slab
    p.box(-S * 2 - 1, -S * 2 - 1, 0, S * 4 + 2, S * 4 + 2, TOP, { top: 0.2, lw: 0.65 });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const x = -S * 2 + i * S, y = -S * 2 + j * S;
      p.face([[x, y, TOP + 0.02], [x + S, y, TOP + 0.02], [x + S, y + S, TOP + 0.02], [x, y + S, TOP + 0.02]], (i + j) % 2 ? 0.035 : 0.24, 0);
    }
    // the king, at the back
    const kx = -S / 2, ky = -S * 1.5;
    let z = lathe(p, kx, ky, TOP, [[3.5, 1.4], [2.7, 1], [1.9, 3], [1.7, 3], [1.9, 3], [3, 1], [2.3, 2.4], [2.9, 0.9]]);
    p.box(kx - 0.45, ky - 0.45, z, 0.9, 0.9, 4.2, { top: 0.5, left: 0.5, right: 0.3, edge: 0 });
    p.box(kx - 1.6, ky - 0.45, z + 1.9, 3.2, 0.9, 0.9, { top: 0.5, left: 0.5, right: 0.3, edge: 0 });
    // the pawn: one square forward on hover, in a hop
    const k = ease(Math.min(1, h / 0.8)), px = S / 2, py = S * 1.5 - S * k, hop = Math.sin(Math.PI * k) * 6;
    p.guide([[px, S * 1.5, TOP], [px, S * 0.5, TOP]], true);
    z = lathe(p, px, py, TOP + hop, [[3, 1.2], [2.2, 0.9], [1.5, 2], [1.3, 2.2], [2.3, 0.8]]);
    ball(p, [px, py, z + 1.7], 2.3);
  },
};
