// No articles yet: a stack of three thick books. Hover and the top one lifts off and turns, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));

function badge(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

/** a closed book lying flat: its pages face front left, its spine shows at the right end */
function book(p: Pen, x: number, y: number, z: number, w: number, d: number, th: number, rot: number, label: boolean) {
  p.push();
  p.translate(x, y, 0);
  p.rotate("z", rot);
  p.box(-w / 2, -d / 2, z, w, d, th, { top: 0.21, left: 0.1, right: 0.06, lw: 0.6 });
  const fx = w / 2 + 0.03, fy = d / 2 + 0.03;
  // the page block, set in between the two boards
  p.face([[-w / 2 + 0.7, fy, z + 1], [w / 2 - 1, fy, z + 1], [w / 2 - 1, fy, z + th - 1], [-w / 2 + 0.7, fy, z + th - 1]], 0.3, 0);
  p.line([[-w / 2 + 0.7, fy + 0.02, z + th / 2], [w / 2 - 1, fy + 0.02, z + th / 2]], SH.edge, 0.4);
  // bands across the spine
  for (const by of [-d / 2 + 2.6, d / 2 - 2.6]) p.line([[fx, by, z], [fx, by, z + th]], SH.edge, 0.55);
  if (label) {
    const zt = z + th + 0.03;
    p.face([[-w / 2 + 3, -d / 2 + 3, zt], [w / 2 - 3, -d / 2 + 3, zt], [w / 2 - 3, -d / 2 + 7.5, zt], [-w / 2 + 3, -d / 2 + 7.5, zt]], 0.34, SH.edge, 0.5);
    p.line([[-w / 2 + 5, -d / 2 + 5.25, zt], [w / 2 - 5, -d / 2 + 5.25, zt]], SH.edge, 0.6);
  }
  p.pop();
}

export const knowledge: Illustration = {
  k: "knowledge", name: "Knowledge base", title: "No articles yet", body: "Write your first article and it will be filed here for your team and customers to read.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.scale(1.12, [0, 0, 8]);
    p.shadow(0, 0, 27, 13.5, 0.12);
    book(p, 0, 0, 0, 27, 19, 5.4, 0, false);
    book(p, -1.5, -1, 5.4, 22, 14.5, 4.6, 0, false);
    const k = ease(cl(h / 0.65));
    book(p, 0.5, -0.5, 10 + 6 * k + h * Math.sin(t * 2.2) * 0.5, 18, 12.5, 4.4, 0.14 - 0.42 * k, true);
    const b = cl((h - 0.62) / 0.38);
    if (b > 0) badge(p, [13, -12, 22], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
