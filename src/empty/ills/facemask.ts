// Stay safe out there: a pleated face mask with its ear loops. Hover and the pleats stretch open as if worn, and a tick badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const W = 13; // half width of the mask
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
const cl = (x: number) => Math.max(0, Math.min(1, x));

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
  });
}

export const facemask: Illustration = {
  k: "facemask", name: "Face mask", title: "Stay safe out there", body: "Nothing to report right now. Health updates and reminders will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = cl(h / 0.7), e = 1 - Math.pow(1 - k, 3);
    const HT = 15 + 4 * e; // the mask's height in the middle, taller as the pleats open
    p.translate(0, 0, -HT / 2 - 2);
    p.shadow(0, 0, 30, 8, 0.1);
    // the edge of the mask at u: bottom and top, bulging at the nose and the chin
    const bot = (u: number) => 2 - 2.2 * (1 - (u / W) ** 2) - (HT - 15) * 0.5 * (1 - (u / W) ** 2);
    const top = (u: number) => 2 + HT * (0.72 + 0.28 * (1 - (u / W) ** 2));
    const us = Array.from({ length: 27 }, (_, i) => -W + (i / 26) * W * 2);
    const outline = (d: number): V3[] => [...us.map((u) => F(u, top(u), d)), ...us.slice().reverse().map((u) => F(u, bot(u), d))];
    // the ear loops behind it: bright bands out to each side
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round";
      for (const s of [-1, 1]) {
        const [a, b] = p.pt(F(s * (W - 0.5), top(W) - 1.2, -0.5)), [c, d] = p.pt(F(s * (W - 0.5), bot(W) + 1.2, -0.5));
        const [m, n] = p.pt(F(s * (W + 7 + 1.5 * e), (top(W) + bot(W)) / 2, -0.5));
        g.beginPath(); g.moveTo(a, b); g.bezierCurveTo(m + s * 1, b - 2, m + s * 1, d + 2, c, d); g.stroke();
      }
    });
    // its thickness, a lit rim stepping back, then the face
    for (let d = -2; d < 0; d += 0.5) p.face(outline(d), 0.2, 0);
    p.face(outline(0), 0.13, 0);
    // three pleats: lit bands, each with a dark fold line under it
    for (let i = 0; i < 3; i++) {
      const v0 = (u: number) => bot(u) + (top(u) - bot(u)) * (0.2 + i * 0.22);
      const v1 = (u: number) => v0(u) + (top(u) - bot(u)) * (0.1 + 0.05 * e);
      const uu = us.slice(2, 25);
      p.face([...uu.map((u) => F(u, v1(u), 0.1)), ...uu.slice().reverse().map((u) => F(u, v0(u), 0.1))], 0.26, 0);
      p.line(uu.map((u) => F(u, v0(u), 0.2)), 1, 0.8);
    }
    // the nose wire along the top
    p.face([...us.slice(5, 22).map((u) => F(u, top(u) - 0.4, 0.2)), ...us.slice(5, 22).reverse().map((u) => F(u, top(u) - 2, 0.2))], 0.4, 0);
    // the seams down both sides
    for (const s of [-1, 1]) p.line([F(s * (W - 1.6), bot(W - 1.6) + 0.4, 0.2), F(s * (W - 1.6), top(W - 1.6) - 0.4, 0.2)], 1, 0.7);
    const b = cl((h - 0.65) / 0.35);
    if (b > 0) {
      const pop = b < 0.65 ? (b / 0.65) * 1.18 : 1.18 - 0.18 * ((b - 0.65) / 0.35);
      badge(p, F(-W + 1, top(-W + 3) + 2.5, 0.5), 4.4 * pop);
    }
  },
};
