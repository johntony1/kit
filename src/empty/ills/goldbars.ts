// No reserves yet: gold bars stacked three and two. Hover and one more bar drops onto the top with a bounce, and the stack glints.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const HL = 7.5, HD = 3.7, BH = 4.3, IN = 1.15; // half length (x), half depth (y), height, how far the top is set in

// one ingot: a long block with sloped sides
function bar(p: Pen, cy: number, z: number, top = 0.26) {
  const X = HL, x1 = HL - IN, y0 = cy + HD, y1 = cy + HD - IN, yb = cy - HD, yb1 = cy - HD + IN, Z = z + BH;
  p.face([[-X, y0, z], [X, y0, z], [x1, y1, Z], [-x1, y1, Z]], 0.1, SH.edge, 0.6); // the long side
  p.face([[X, yb, z], [X, y0, z], [x1, y1, Z], [x1, yb1, Z]], 0.05, SH.edge, 0.6); // the end
  p.face([[-x1, yb1, Z], [x1, yb1, Z], [x1, y1, Z], [-x1, y1, Z]], top, SH.edge, 0.6);
}
function glint(p: Pen, at: V3, s: number) {
  if (s <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#fff"; g.beginPath();
    g.moveTo(x, y - s); g.lineTo(x + s * 0.22, y - s * 0.22); g.lineTo(x + s, y); g.lineTo(x + s * 0.22, y + s * 0.22);
    g.lineTo(x, y + s); g.lineTo(x - s * 0.22, y + s * 0.22); g.lineTo(x - s, y); g.lineTo(x - s * 0.22, y - s * 0.22); g.closePath(); g.fill();
  });
}
// height above its seat: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k < 0.5) return 30 * (1 - Math.pow(k / 0.5, 2));
  if (k < 0.75) { const v = (k - 0.5) / 0.25; return 3.4 * 4 * v * (1 - v); }
  if (k < 0.9) { const v = (k - 0.75) / 0.15; return 1 * 4 * v * (1 - v); }
  return 0;
}

export const goldbars: Illustration = {
  k: "goldbars", name: "Gold bars", title: "No reserves yet", body: "Add funds to your reserve and they will be held here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -8);
    p.shadow(0, 0, 28, 14, 0.11);
    const pitch = HD * 2 + 0.5;
    for (const i of [-1, 0, 1]) bar(p, i * pitch, 0);
    for (const i of [-0.5, 0.5]) bar(p, i * pitch, BH, 0.28);
    const k = clamp(h / 0.8);
    if (k > 0.02) bar(p, 0, BH * 2 + drop(k), 0.34);
    const b = clamp((h - 0.72) / 0.28);
    glint(p, [HL, -pitch - 2, BH * 2 + 6], 3.6 * b * (0.8 + 0.2 * Math.sin(t * 5)));
    glint(p, [-HL + 1, pitch, BH + 7], 2.4 * b * (0.8 + 0.2 * Math.sin(t * 5 + 2)));
  },
};
