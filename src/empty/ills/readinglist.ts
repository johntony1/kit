// Nothing to read: a small stack of books with a ribbon marker. Hover and one more book drops onto the pile with a bounce; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
function drop(k: number) {
  if (k <= 0) return 34;
  if (k < 0.5) return 34 * (1 - Math.pow(k / 0.5, 2));
  if (k < 0.75) { const v = (k - 0.5) / 0.25; return 3.4 * 4 * v * (1 - v); }
  if (k < 0.9) { const v = (k - 0.75) / 0.15; return 1 * 4 * v * (1 - v); }
  return 0;
}
/** a closed book lying flat: spine toward us on the left, page edges on the right */
function book(p: Pen, z: number, w: number, d: number, th: number, turn: number, bands: number) {
  p.push();
  p.rotate("z", turn);
  p.box(-w, -d, z, w * 2, d * 2, th, { top: 0.21, left: 0.13, right: 0.07, lw: 0.6 });
  // the pages, set in between the covers
  p.face([[w + 0.02, -d + 0.5, z + 0.8], [w + 0.02, d - 0.9, z + 0.8], [w + 0.02, d - 0.9, z + th - 0.8], [w + 0.02, -d + 0.5, z + th - 0.8]], 0.3, 0);
  p.line([[w + 0.04, -d + 0.5, z + th / 2], [w + 0.04, d - 0.9, z + th / 2]], 0.05, 0.35);
  // bands on the spine
  const y = d + 0.03;
  p.line([[-w + 2.5, y, z + 0.5], [-w + 2.5, y, z + th - 0.5]], SH.edge, 0.5);
  p.line([[w - 2.5, y, z + 0.5], [w - 2.5, y, z + th - 0.5]], SH.edge, 0.5);
  if (bands) p.line([[-w + 6, y, z + th / 2], [-w + 6 + bands, y, z + th / 2]], SH.edge, 0.9);
  p.pop();
}

export const readinglist: Illustration = {
  k: "readinglist", name: "Reading list", title: "Nothing to read", body: "Save a book or an article for later and it will stack up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 26, 13, 0.11);
    const T = 5.2;
    book(p, 0, 14, 10, T, 0.06, 9);
    book(p, T, 12.5, 9, T, -0.16, 12);
    book(p, T * 2, 13, 9.4, T - 0.6, 0.12, 7);
    // a ribbon marker hanging out of the top book
    p.push(); p.rotate("z", 0.12);
    p.face([[13.05, -3, T * 3 - 1.4], [13.05, -1, T * 3 - 1.4], [13.05, -1, T * 3 - 7], [13.05, -2, T * 3 - 6], [13.05, -3, T * 3 - 7]], 0.6, SH.edge, 0.5);
    p.pop();
    // the new book
    const k = Math.min(1, h * 1.25);
    if (k > 0.01) {
      p.push();
      p.translate(0, 0, drop(k));
      book(p, T * 3 - 0.6, 11.5, 8.4, T - 0.8, -0.1 - (1 - Math.min(1, k * 2)) * 0.25, 10);
      p.pop();
    }
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [12, -10, T * 4 + 5], 4.6 * pop);
    }
  },
};
