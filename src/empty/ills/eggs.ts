// No eggs left: an open egg carton with two rows of three round eggs. Hover and the eggs hop one after another.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735, YAW = -0.42;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const L = 17.5, D = 11.5, H = 6; // the tray: half length, half depth, height
// an egg outline, a little narrower at the top
const EGG: P2[] = Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2, s = Math.sin(a); return [Math.cos(a) * 4.8 * (1 - 0.13 * s), s * 5.6] as P2; });
const SHADE: P2[] = (() => {
  const out: P2[] = [];
  for (let i = 0; i <= 14; i++) { const a = -1.9 + (i / 14) * 2.6, s = Math.sin(a); out.push([Math.cos(a) * 4.8 * (1 - 0.13 * s), s * 5.6]); }
  for (let i = 14; i >= 0; i--) { const a = -1.9 + (i / 14) * 2.6, s = Math.sin(a), f = Math.sin((i / 14) * Math.PI); out.push([Math.cos(a) * 4.8 * (1 - 0.13 * s) - 2.1 * f, s * 5.6 + 1.4 * f]); }
  return out;
})();
// one egg standing at a place on the tray, turned to face us
function egg(p: Pen, x: number, y: number, z: number) {
  p.push();
  p.translate(x, y, z);
  p.rotate("z", -YAW);
  p.face(EGG.map(B), 0.28, 0);
  p.face(SHADE.map(B), 0.1, 0);
  p.line([...EGG, EGG[0]].map(B), SH.edge, 0.9);
  p.pop();
}

export const eggs: Illustration = {
  k: "eggs", name: "Egg carton", title: "No eggs left", body: "Add a carton to your next order and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", YAW); // turned so its long side faces us
    // the tray: a lit rim round a dark inside
    p.box(-L, -D, 0, L * 2, D * 2, H, { top: 0.26, left: 0.12, right: 0.065, edge: 0 });
    p.face([[-L + 1.5, -D + 1.5, H + 0.02], [L - 1.5, -D + 1.5, H + 0.02], [L - 1.5, D - 1.5, H + 0.02], [-L + 1.5, D - 1.5, H + 0.02]], 0.03, 0);
    p.line([[-L, D, H], [L, D, H], [L, -D, H]], SH.edge, 0.7);
    p.line([[L, D, H], [L, D, 0]], SH.edge, 0.7);
    // the eggs: the back row, then the front row, each hopping in its turn while hovered
    const rows: [number, number][] = [[-5.6, 0], [5.6, 3]];
    for (const [y, n] of rows) for (let i = 0; i < 3; i++) {
      const ph = Math.max(0, Math.min(1, h * 2.2 - (n + i) * 0.2)), hop = Math.sin(ph * Math.PI) * 5;
      egg(p, (i - 1) * 11, y, H + 2.8 + hop);
    }
    // the near wall of the tray again, over the feet of the front row
    p.face([[-L, D, 0], [L, D, 0], [L, D, H], [-L, D, H]], 0.12, 0);
    p.face([[-L, D - 1.5, H], [L, D - 1.5, H], [L, D, H], [-L, D, H]], 0.26, 0);
    p.line([[-L, D, H], [L, D, H]], SH.edge, 0.7);
  },
};
