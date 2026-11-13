// No autopay set up: a big bank card standing upright inside one bold circular arrow that wraps round it. The arrow turns steadily round the card, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const CZ = 20; // centre height of the card and the ring
const R0 = 16.4, R1 = 20.4; // the arrow's inner and outer radius
const CW = 12.6, CH = 8; // card half width, half height
const SPAN = Math.PI * 1.55; // how far round the arrow reaches

export const autopay: Illustration = {
  k: "autopay", name: "Autopay", title: "No autopay set up", body: "Turn on autopay and your regular bills will be paid on time, automatically.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -20);
    p.shadow(0, 0, 20, 8, 0.12);
    p.rotate("z", -0.6); // turned to face us
    const at = (a: number, r: number, y: number): V3 => [Math.cos(a) * r, y, CZ + Math.sin(a) * r];
    // the arrow: a thick band and a head, swept back for depth, turning clockwise
    const a0 = -u * Math.PI * 2 + 0.3;
    const band = (y: number): V3[] => {
      const out: V3[] = [];
      for (let s = 0; s <= 36; s++) out.push(at(a0 + (SPAN * s) / 36, R1, y));
      for (let s = 36; s >= 0; s--) out.push(at(a0 + (SPAN * s) / 36, R0, y));
      return out;
    };
    // the head points back the way the arrow turns (clockwise on screen = toward lower angles)
    const head = (y: number): V3[] => [at(a0 + 0.02, R0 - 3.2, y), at(a0 + 0.02, R1 + 3.2, y), at(a0 - 0.62, (R0 + R1) / 2, y)];
    const step = p.ink ? 2.4 : 0.4;
    for (let y = -2.4; y < -0.05; y += step) { p.face(band(y), SH.right, 0); p.face(head(y), SH.right, 0); }
    p.face(band(0), 0.3, 0);
    p.face(head(0), 0.3, 0);
    // the card: a thin slab, a lit face, a dark stripe, a bright chip, a number line
    const card = (y: number): V3[] => {
      const r = 1.6, out: V3[] = [];
      const corners: [number, number, number][] = [[CW - r, CH - r, 0], [-CW + r, CH - r, 0.5], [-CW + r, -CH + r, 1], [CW - r, -CH + r, 1.5]];
      for (const [x, z, q] of corners) for (let i = 0; i <= 4; i++) { const a = (q + i / 8) * Math.PI; out.push([x + Math.cos(a) * r, y, CZ + z + Math.sin(a) * r]); }
      return out;
    };
    for (let y = 1.2; y < 2.35; y += p.ink ? 1.2 : 0.4) p.face(card(y), SH.right, 0);
    p.face(card(2.4), 0.24, 0);
    const F = 2.45;
    p.clear([[-CW, F, CZ + 3.4], [CW, F, CZ + 3.4], [CW, F, CZ + 5.6], [-CW, F, CZ + 5.6]]);
    p.face([[-9.6, F, CZ - 2.8], [-4.4, F, CZ - 2.8], [-4.4, F, CZ + 1], [-9.6, F, CZ + 1]], 0.45, 0);
    p.line([[-6.9, F + 0.02, CZ - 2.8], [-6.9, F + 0.02, CZ + 1]], SH.edge, 0.6);
    p.line([[-9.6, F + 0.02, CZ - 5.6], [6.5, F + 0.02, CZ - 5.6]], SH.edge, 0.9);
  },
};
