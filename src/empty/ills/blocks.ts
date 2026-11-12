// Letter blocks: three big toy blocks marked A, B and C, the top one sitting askew. Hover and it hops up, turns square and lands with a bounce as sparkles pop.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = 13.5, HS = S / 2;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
type G = [number, number][][];
const A: G = [[[0.08, 0], [0.5, 1], [0.92, 0]], [[0.26, 0.36], [0.74, 0.36]]];
const B: G = [[[0.16, 0], [0.16, 1], [0.58, 1], [0.8, 0.88], [0.8, 0.64], [0.58, 0.52], [0.16, 0.52]], [[0.58, 0.52], [0.86, 0.4], [0.86, 0.13], [0.62, 0], [0.16, 0]]];
const C: G = [[[0.86, 0.8], [0.66, 1], [0.36, 1], [0.12, 0.76], [0.12, 0.24], [0.36, 0], [0.66, 0], [0.86, 0.2]]];

// a block centred on x, standing on z, its letter cut into the lit front
function block(p: Pen, x: number, z: number, g: G) {
  p.box(x - HS, -HS, z, S, S, S, { top: 0.13, left: 0.3, right: 0.05, edge: 0 });
  const y = HS + 0.03, m = 3.1, w = S - m * 2;
  p.line([[x - HS + 1.1, y, z + 1.1], [x + HS - 1.1, y, z + 1.1], [x + HS - 1.1, y, z + S - 1.1], [x - HS + 1.1, y, z + S - 1.1], [x - HS + 1.1, y, z + 1.1]], SH.edge, 0.45);
  for (const s of g) p.line(s.map(([u, v]) => [x - HS + m + u * w, y, z + m + v * w] as V3), SH.edge, 1.5);
  p.line([[x - HS, HS, z + S], [x + HS, HS, z + S], [x + HS, -HS, z + S]], SH.edge, 0.5);
  p.line([[x + HS, HS, z], [x + HS, HS, z + S]], SH.edge, 0.5);
}
function spark(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1; g.lineCap = "round"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); });
}

export const blocks: Illustration = {
  k: "blocks", name: "Letter blocks", title: "No words learned yet", body: "Start a lesson and each new word you learn will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 1, 27, 13, 0.12);
    p.rotate("z", -0.62);
    p.scale(1.06);
    block(p, -HS - 0.6, 0, B);
    block(p, HS + 0.6, 0, C);
    // the top block: up, square, down with a bounce
    const k = clamp(h / 0.75);
    const up = k < 0.5 ? Math.sin((k / 0.5) * Math.PI) * 6 : k < 0.8 ? Math.sin(((k - 0.5) / 0.3) * Math.PI) * 1.6 : 0;
    p.push();
    p.translate(0, 0, up);
    p.rotate("z", 0.3 * (1 - clamp(k / 0.45)));
    block(p, 0, S, A);
    p.pop();
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) {
      const tw = 0.8 + 0.2 * Math.sin(t * 5);
      spark(p, [-13, 0, 33], 2.6 * b * tw);
      spark(p, [13, 0, 31], 2 * b * (1.8 - tw));
    }
  },
};
