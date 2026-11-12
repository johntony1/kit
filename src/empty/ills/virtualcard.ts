// No virtual cards: a phone lying flat, projecting a card that floats above it. The card bobs, a shimmer crosses it and light climbs the beams.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.4;
const rr = (hw: number, hd: number, r: number, z: number): V3[] => {
  const pts: V3[] = [];
  const corners: [number, number, number][] = [[hw - r, hd - r, 0], [-hw + r, hd - r, 1], [-hw + r, -hd + r, 2], [hw - r, -hd + r, 3]];
  for (const [x, y, q] of corners) for (let i = 0; i <= 5; i++) { const a = ((q + i / 5) * Math.PI) / 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]); }
  return pts;
};
const quad = (p: Pen, x0: number, y0: number, x1: number, y1: number, z: number, fill: number) => p.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], fill, 0);

export const virtualcard: Illustration = {
  k: "virtualcard", name: "Virtual card", title: "No virtual cards", body: "Create a virtual card to pay online without using your real card number.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1, w = u * Math.PI * 2;
    p.translate(0, 0, -9);
    p.shadow(0, 0, 28, 14, 0.1);
    // the phone: a slab with a dark screen and a lit patch the card rises from
    p.face(rr(13.5, 7.5, 2, 0), 0.1, SH.edge, 0.55);
    p.face(rr(13.5, 7.5, 2, 1.5), 0.2, SH.edge, 0.6);
    p.face(rr(11.3, 5.5, 1, 1.53), 0.035, SH.edge, 0.45);
    p.face(rr(7, 4, 1, 1.56), 0.12 + 0.06 * Math.sin(w), 0);
    const zc = 15 + Math.sin(w) * 1.3, CW = 11.5, CD = 7;
    // light climbing the four beams
    const from: [number, number][] = [[7, 4], [-7, 4], [-7, -4], [7, -4]], to: [number, number][] = [[CW, CD], [-CW, CD], [-CW, -CD], [CW, -CD]];
    from.forEach((a, i) => {
      p.guide([[a[0], a[1], 1.56], [to[i][0], to[i][1], zc]], true);
      for (let j = 0; j < 4; j++) { const s = (u * 2 + j / 4) % 1; p.dot([a[0] + (to[i][0] - a[0]) * s, a[1] + (to[i][1] - a[1]) * s, 1.6 + (zc - 1.6) * s], 0.45, 0.35 + 0.65 * s); }
    });
    // the card: a bright rim round a faint, see through face
    p.face(rr(CW, CD, 1.8, zc), 0.34, SH.edge, 0.55);
    p.face(rr(CW - 1.4, CD - 1.4, 0.8, zc + 0.02), 0.065, 0);
    quad(p, -8.6, -4.4, -4.6, -1.4, zc + 0.04, 0.5); // chip
    for (let i = 0; i < 4; i++) quad(p, -8.6 + i * 4.6, 1.2, -5.6 + i * 4.6, 2.1, zc + 0.04, 0.5); // number
    quad(p, -8.6, 3.9, -2, 4.6, zc + 0.04, 0.3); // name
    p.disc(6.8, -3, zc + 0.04, 1.7, 0.3); p.disc(8.6, -3, zc + 0.05, 1.7, 0.12, SH.edge);
    // the shimmer crossing the card
    const sx = -CW + 2 + ((u * 1.6) % 1) * (CW * 2 - 6);
    if (u < 0.625) p.face([[sx, -CD + 1, zc + 0.06], [sx + 1.4, -CD + 1, zc + 0.06], [sx + 2.6, CD - 1, zc + 0.06], [sx + 1.2, CD - 1, zc + 0.06]], 0.9 * Math.sin((u / 0.625) * Math.PI), 0);
  },
};
