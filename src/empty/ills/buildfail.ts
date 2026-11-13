// The build did not pass: a tall tower of wooden blocks stacked in crossing layers. Hover and one block slides out of the middle, the top of the tower lurches over, and a cross badge pops in.
import { SH, type Illustration, type Pen } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 6.6, B = 2.1, HB = 3.2, N = 8, OUT = 3; // half length and half width of a block, its height, layers, the layer that loses a block
const tone = { top: 0.26, left: 0.12, right: 0.065, lw: 0.6 };

// one layer: three blocks side by side, along x on even layers and along y on odd ones; the middle one can slide
function layer(p: Pen, i: number, slide: number) {
  const z = i * HB;
  for (const j of [-1, 0, 1]) {
    const o = j * B * 2, s = j === 0 ? slide : 0;
    if (i % 2 === 0) p.box(-L + s, o - B + 0.12, z, L * 2, B * 2 - 0.24, HB - 0.12, tone);
    else p.box(o - B + 0.12, -L + s, z, B * 2 - 0.24, L * 2, HB - 0.12, tone);
  }
  // the seams, cut into the two faces we see: under the layer, and between its blocks
  const e = L + 0.03, lw = 0.75;
  if (i > 0) { p.line([[-L, e, z], [L, e, z]], SH.edge, lw); p.line([[e, -L, z], [e, L, z]], SH.edge, lw); }
  for (const c of [-B, B]) {
    if (i % 2 === 0) p.line([[e, c, z], [e, c, z + HB]], SH.edge, lw);
    else if (!(slide > 0.1 && c === B)) p.line([[c, e, z], [c, e, z + HB]], SH.edge, lw);
  }
}

export const buildfail: Illustration = {
  k: "buildfail", name: "Failed build", title: "The build did not pass", body: "Check the failing step, fix it and run the build again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.scale(1.22, [0, 0, 14]);
    p.shadow(0, 0, 20, 10, 0.12);
    const k = ease(Math.min(1, h * 1.5));
    const lurch = Math.max(0, (h - 0.55) / 0.45);
    const lean = 0.2 * ease(lurch) - Math.sin(lurch * Math.PI) * 0.04 + h * Math.sin(t * 2.5) * 0.008;
    for (let i = 0; i < N; i++) {
      if (i <= OUT) { layer(p, i, i === OUT ? 7.5 * k : 0); continue; }
      // the layers above the gap lean over together, pivoting on the gap's right edge
      p.push();
      p.rotate("y", lean, [L, 0, (OUT + 1) * HB]);
      layer(p, i, 0);
      p.pop();
    }
    // the cross badge
    const b = Math.max(0, (h - 0.72) / 0.28);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([-9, 9, N * HB + 2]), r = 4.6 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1.2, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.4, y - r * 0.4); g.lineTo(x + r * 0.4, y + r * 0.4); g.moveTo(x + r * 0.4, y - r * 0.4); g.lineTo(x - r * 0.4, y + r * 0.4); g.stroke();
      });
    }
  },
};
