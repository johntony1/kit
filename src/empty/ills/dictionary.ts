// No words saved: a thick dictionary standing on end, index tabs down its page edge. Hover and a word card slides up out of the pages; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** letters as strokes in [u, v], about 2 wide and 3.6 tall, centred */
const GLYPH: Record<string, [number, number][][]> = {
  A: [[[-1.2, -1.8], [0, 1.8], [1.2, -1.8]], [[-0.75, -0.5], [0.75, -0.5]]],
  Z: [[[-1.1, 1.8], [1.1, 1.8], [-1.1, -1.8], [1.1, -1.8]]],
};

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const dictionary: Illustration = {
  k: "dictionary", name: "Dictionary", title: "No words saved", body: "Save a word while you read and it will be kept here with its meaning.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 11, 0.1);
    const W = 11, Z = 28, T = 5.5; // half width, height, half thickness
    // the back cover, then the block of pages, a touch smaller
    p.box(-W, -T, 0, W * 2, 1.2, Z, { lw: 0.6 });
    p.box(-W, -T + 1.2, 0.7, W * 2 - 0.9, T * 2 - 2.4, Z - 1.4, { top: 0.3, left: 0.2, right: 0.05, edge: 0 });
    // page lines down the fore edge
    for (const y of [-2.6, -0.9, 0.9, 2.6]) p.line([[W - 0.87, y, 1.2], [W - 0.87, y, Z - 1.2]], 0.7, 0.35);
    // the word card rising out of the pages
    const e = ease(Math.min(1, h / 0.75));
    if (e > 0.01) {
      const top = Z - 0.7 + 11.5 * e;
      p.box(-6.5, -0.4, Z - 0.7, 12, 0.8, top - (Z - 0.7), { top: 0.3, left: 0.3, right: 0.14, lw: 0.6 });
      if (e > 0.45) p.line([[-4.5, 0.43, top - 3], [0.5, 0.43, top - 3]], SH.edge, 0.9);
      if (e > 0.7) p.line([[-4.5, 0.43, top - 5.8], [3.5, 0.43, top - 5.8]], 0.6, 0.6);
      if (e > 0.9) p.line([[-4.5, 0.43, top - 8], [2, 0.43, top - 8]], 0.6, 0.6);
    }
    // the front cover with a border, A and Z, and a rule under them
    p.box(-W, T - 1.2, 0, W * 2, 1.2, Z, { left: 0.13, lw: 0.6 });
    const y = T + 0.03;
    p.line([[-W + 2.2, y, 2.4], [W - 2.2, y, 2.4], [W - 2.2, y, Z - 2.4], [-W + 2.2, y, Z - 2.4], [-W + 2.2, y, 2.4]], 0.55, 0.45);
    for (const [ch, cx] of [["A", -3.6], ["Z", 3.6]] as [string, number][])
      for (const s of GLYPH[ch]) p.line(s.map(([u, v]) => [cx + u * 2.1, y, 17.5 + v * 2.1] as V3), SH.edge, 1);
    p.line([[-6, y, 10.5], [6, y, 10.5]], SH.edge, 0.6);
    p.line([[-3.5, y, 7.6], [3.5, y, 7.6]], 0.6, 0.5);
    // index tabs stepping down the fore edge
    for (let i = 0; i < 5; i++) {
      const z = Z - 6.2 - i * 4.4, yy = -3 + i * 1.1;
      p.box(W - 0.9, yy, z, 1.5, 2.4, 2.6, { top: 0.5, left: 0.5, right: 0.5, edge: 0 });
    }
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [8, 0, Z + 12], 4.4 * pop);
    }
  },
};
