// No images yet: an image file standing up, a landscape in its window and a folded corner. Hover and two more slide out from behind it and a plus pops in.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 10.5, H = 27, T = 0.5, F = 5; // half width, height, half thickness, folded corner
const cl = (x: number) => Math.max(0, Math.min(1, x));

function sheet(p: Pen, fill: number) {
  p.face([[W, -T, 0], [W, T, 0], [W, T, H - F], [W, -T, H - F]], SH.right, SH.edge, 0.5);
  p.face([[-W, -T, H], [W - F, -T, H], [W - F, T, H], [-W, T, H]], SH.top, SH.edge, 0.5);
  p.face([[-W, T, 0], [W, T, 0], [W, T, H - F], [W - F, T, H], [-W, T, H]], fill, SH.edge, 0.55);
  p.face([[W - F, T + 0.03, H], [W, T + 0.03, H - F], [W - F, T + 0.03, H - F]], 0.36, SH.edge, 0.5);
}
function plus(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const images: Illustration = {
  k: "images", name: "Images", title: "No images yet", body: "Upload a picture or drop one in. Your images will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-2, 0, -14);
    p.shadow(2, 2, 25, 11, 0.11);
    p.rotate("z", -0.42);
    // the ones behind, sliding out to the right
    for (const i of [2, 1]) {
      const k = easeInOut(cl((h - (i - 1) * 0.12) / 0.6));
      p.push();
      p.translate(i * 1.2 + k * i * 4.6, -i * 2.2, i * 0.9 + k * i * 1.6);
      sheet(p, i === 2 ? 0.1 : 0.15);
      p.pop();
    }
    sheet(p, 0.22);
    // the picture: a dark sky, a sun, two hills
    const fy = T + 0.03, x0 = -7.5, x1 = 7.5, z0 = 8.5, z1 = 20.5;
    p.face([[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]], 0.03, SH.edge, 0.55);
    p.ringV("y", [3.6, fy + 0.02, 17], 1.9, 0.36, 0);
    p.face([[x0, fy + 0.03, z0], [x0, fy + 0.03, z0 + 2.5], [-3.4, fy + 0.03, 16.6], [1.2, fy + 0.03, z0]], 0.12, SH.edge, 0.5);
    p.face([[-2.4, fy + 0.04, z0], [3.2, fy + 0.04, 13.6], [x1, fy + 0.04, z0 + 2.2], [x1, fy + 0.04, z0]], 0.26, SH.edge, 0.55);
    p.line([[x0, fy, 5.4], [x1, fy, 5.4]], SH.edge, 0.65);
    p.line([[x0, fy, 3], [1, fy, 3]], SH.edge, 0.65);
    const b = cl((h - 0.66) / 0.34);
    if (b > 0) {
      const pop = b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35);
      plus(p, [W + 10, -4, H + 4], 4.6 * pop);
    }
  },
};
