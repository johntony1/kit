// No duplicates found: two identical pages standing one behind the other. Hover and the copy slides out from behind and an equals badge pops in between them.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 11, ZT = 28, F = 7, T = 1.6; // half width, height, folded corner, thickness

function page(p: Pen, front: number) {
  p.face([[X, -T, 0], [X, 0, 0], [X, 0, ZT - F], [X, -T, ZT - F]], SH.right, SH.edge, 0.5);
  p.face([[X - F, -T, ZT], [X - F, 0, ZT], [X, 0, ZT - F], [X, -T, ZT - F]], 0.12, SH.edge, 0.5);
  p.face([[-X, -T, ZT], [X - F, -T, ZT], [X - F, 0, ZT], [-X, 0, ZT]], 0.26, SH.edge, 0.5);
  p.face([[-X, 0, 0], [X, 0, 0], [X, 0, ZT - F], [X - F, 0, ZT], [-X, 0, ZT]], front, SH.edge, 0.6);
  p.face([[X - F, 0.08, ZT], [X, 0.08, ZT - F], [X - F, 0.08, ZT - F]], 0.12, SH.edge, 0.6);
  // a picture block and lines of text, the same on both
  const y = 0.08;
  p.clear([[-X + 3, y, ZT - 4], [-X + 10, y, ZT - 4], [-X + 10, y, ZT - 10], [-X + 3, y, ZT - 10]]);
  for (let i = 0; i < 3; i++) p.line([[-X + 3, y, ZT - 14 - i * 3.6], [X - (i === 2 ? 9 : 3), y, ZT - 14 - i * 3.6]], SH.edge, 0.9);
}

export const duplicate: Illustration = {
  k: "duplicate", name: "Duplicate", title: "No duplicates found", body: "Everything here is one of a kind. If two files match, they will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.25));
    p.translate(0, 0, -14);
    p.shadow(0, 0, 26, 10, 0.11);
    p.rotate("z", -0.5);
    // the copy behind: up and to the right, sliding further out on hover
    p.push();
    p.translate(-3 + 9 * k, -5, 3 + 2 * k);
    page(p, 0.16);
    p.pop();
    // the dark gap it casts on the front page's edge, then the front page
    p.push();
    p.translate(-6 - 2 * k, 0, 0);
    if (!p.ink) p.clear([[X + 0.2, -0.5, 0], [X + 1.4, -0.5, 0], [X + 1.4, -0.5, ZT - F + 1], [X + 0.2, -0.5, ZT - F + 1]]);
    page(p, 0.24);
    p.pop();
    // the equals badge, popping in at the copy's lower edge
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.6 ? easeInOut(b / 0.6) * 1.15 : 1.15 - 0.15 * easeInOut((b - 0.6) / 0.4);
      const [x, y] = p.pt([8, 2, 6] as V3), r = 4.4 * pop + (h > 0.95 ? Math.sin(t * 3) * 0.15 : 0);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.48, y - r * 0.25); g.lineTo(x + r * 0.48, y - r * 0.25); g.moveTo(x - r * 0.48, y + r * 0.25); g.lineTo(x + r * 0.48, y + r * 0.25); g.stroke();
      });
    }
  },
};
