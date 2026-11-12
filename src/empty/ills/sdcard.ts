// Memory card: a memory card standing on end, its corner clipped and its contacts showing. Hover and it lifts, the contacts light one by one and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10, H = 27, T = 1.1, C = 6; // half width, height, half thickness, the clipped corner

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const sdcard: Illustration = {
  k: "sdcard", name: "Memory card", title: "No cards found", body: "Insert a memory card and its files will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 4 * back(clamp(h / 0.6)) + h * Math.sin(t * 2.8) * 0.6;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 20 - h * 3, 8, 0.12);
    p.rotate("z", -0.5);
    p.translate(0, 0, lift);
    // the edges we see: the top, the clipped corner, the right side
    p.face([[-W, -T, H], [W - C, -T, H], [W - C, T, H], [-W, T, H]], 0.3, SH.edge, 0.5);
    p.face([[W - C, -T, H], [W, -T, H - C], [W, T, H - C], [W - C, T, H]], 0.14, SH.edge, 0.5);
    p.face([[W, -T, 0], [W, T, 0], [W, T, H - C], [W, -T, H - C]], SH.right, SH.edge, 0.5);
    // the front
    p.face([[-W, T, 0], [W, T, 0], [W, T, H - C], [W - C, T, H], [-W, T, H]], 0.22, SH.edge, 0.6);
    const y = T + 0.03;
    // the contacts: bright strips in a dark recess along the top
    p.clear([[-W + 1.4, y, H - 8.4], [W - 1.6, y, H - 8.4], [W - 1.6, y, H - 6.6], [W - 6.4, y, H - 1.4], [-W + 1.4, y, H - 1.4]]);
    for (let i = 0; i < 6; i++) {
      const x = -W + 2.3 + i * 2.7, top = i === 5 ? H - 5 : H - 2.2;
      const on = clamp((h - 0.4 - i * 0.07) / 0.1);
      p.face([[x, y + 0.02, H - 7.6], [x + 1.7, y + 0.02, H - 7.6], [x + 1.7, y + 0.02, top], [x, y + 0.02, top]], 0.3 + 0.7 * on, 0);
    }
    // the lock switch on the left edge
    p.clear([[-W, y, 13], [-W + 1.5, y, 13], [-W + 1.5, y, 16.4], [-W, y, 16.4]]);
    // the label: a cut frame with two lines
    p.line([[-W + 3, y, 3], [W - 3, y, 3], [W - 3, y, 12.6], [-W + 3, y, 12.6], [-W + 3, y, 3]], SH.edge, 0.6);
    p.line([[-W + 5, y, 9.6], [W - 5, y, 9.6]], SH.edge, 1);
    p.line([[-W + 5, y, 6.4], [1, y, 6.4]], SH.edge, 0.7);
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [W + 3, 0, H + 1], 4.6 * pop);
    }
  },
};
