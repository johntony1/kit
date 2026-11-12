// No international transfers: a banknote with wings, flying on the spot. The wings beat, the note bobs and its shadow breathes on the floor below.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 2.4; // seconds per loop
const W = 14.5, Z0 = 6, Z1 = 25, D = 1.8; // the note: half width, bottom, top, depth
const circle = (cx: number, cz: number, r: number, y: number): V3[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
// a wing: three feathers fanning out, drawn from its root; u runs outward, v up
const WING: P2[] = [[0, -4], [0, 4], [4, 8], [9, 10], [13.5, 9.6], [10.6, 6.8], [12.8, 5.4], [9.6, 3.2], [11, 1.4], [7, 0], [7.6, -2], [3.4, -4]];

function wing(p: Pen, s: 1 | -1, a: number, side: number) {
  p.push();
  p.rotate("y", -s * a, [s * (W - 1), 0, Z1 - 4]);
  const pts = (y: number): V3[] => WING.map(([u, v]) => [s * (W - 1 + u), y, Z1 - 4 + v]);
  p.face(pts(-D - 0.5), side, 0);
  p.face(pts(-D), 0.3, 0);
  // the feathers, as cuts
  for (const [a0, a1] of [[[2.2, 1.6], [10.4, 6.6]], [[2.6, -1.2], [9.4, 3]]] as [P2, P2][]) {
    p.line([[s * (W - 1 + a0[0]), -D + 0.03, Z1 - 4 + a0[1]], [s * (W - 1 + a1[0]), -D + 0.03, Z1 - 4 + a1[1]]], SH.edge, 0.75);
  }
  p.pop();
}

export const remit: Illustration = {
  k: "remit", name: "Money abroad", title: "No international transfers", body: "Send money to another country and you can follow it here until it lands.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const side = p.ink ? 0.065 : 0.045;
    const flap = Math.sin(u * Math.PI * 4), bob = Math.sin(u * Math.PI * 2) * 1.6;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 22 - bob * 1.5, 8 - bob * 0.5, 0.11);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 0, bob);
    p.rotate("y", Math.sin(u * Math.PI * 2 + 1) * 0.05, [0, 0, 18]);
    // the wings, behind the note: up on one beat, down on the next
    wing(p, -1, 0.5 + flap * 0.32, side);
    wing(p, 1, 0.5 + flap * 0.32, side);
    // the note: its depth, then the bright front
    const note = (y: number): V3[] => [[-W, y, Z0], [W, y, Z0], [W, y, Z1], [-W, y, Z1]];
    const step = p.ink ? D : 0.4;
    for (let y = -D; y < -0.05; y += step) p.face(note(y), side, 0);
    p.face(note(0), 0.3, 0);
    // a border cut inside the edge, a dark medallion with a bright coin in it, a mark at each end
    const m = 2;
    p.line([[-W + m, 0.03, Z0 + m], [W - m, 0.03, Z0 + m], [W - m, 0.03, Z1 - m], [-W + m, 0.03, Z1 - m], [-W + m, 0.03, Z0 + m]], SH.edge, 0.7);
    const cz = (Z0 + Z1) / 2;
    p.clear(circle(0, cz, 5.6, 0.04));
    p.face(circle(0, cz, 2.8, 0.06), 0.3, 0);
    p.clear(circle(-8.2, cz, 1.3, 0.04));
    p.clear(circle(8.2, cz, 1.3, 0.04));
  },
};
