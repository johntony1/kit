// Storage is full: a hard drive with its platter on top and a capacity bar on the front, one bar short of full. Hover and the last bar fills, the bar flashes and a warning badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const X = 14, Y = 9.5, H = 10;

// a round bright badge with a dark exclamation mark, flat to the screen
function bang(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.32; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y - r * 0.52); g.lineTo(x, y + r * 0.08); g.stroke();
    g.beginPath(); g.arc(x, y + r * 0.5, r * 0.17, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
  });
}

export const lowstorage: Illustration = {
  k: "lowstorage", name: "Full disk", title: "Storage is full", body: "Free up some space or upgrade your plan to keep saving.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -7);
    p.shadow(0, 1, 30, 14, 0.12);
    const full = cl((h - 0.35) / 0.2);
    p.push();
    p.rotate("z", -0.5);
    p.translate(full * Math.sin(t * 26) * 0.25 * (1 - cl((h - 0.8) / 0.2) * 0.6), 0, 0);
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    // the platter on top, with its spindle and the reading arm
    p.disc(-3.5, 0, H + 0.03, 7.6, 0.3, SH.edge);
    p.disc(-3.5, 0, H + 0.05, 4.6, 0, 0.5);
    p.disc(-3.5, 0, H + 0.06, 1.7, 0.03, SH.edge);
    p.line([[10.5, 6, H + 0.08], [2.2, 2.6, H + 0.08]], SH.edge, 1.2);
    p.disc(10.5, 6, H + 0.08, 1.5, 0.3, SH.edge);
    // the capacity bar on the front: eight cells in a dark slot
    const f = Y + 0.03, flash = full >= 1 ? 0.5 + 0.5 * Math.sin(t * 9) : 1;
    p.clear([[-11.6, f, 3.2], [6.6, f, 3.2], [6.6, f, 7], [-11.6, f, 7]]);
    p.line([[-11.6, f, 3.2], [6.6, f, 3.2], [6.6, f, 7], [-11.6, f, 7], [-11.6, f, 3.2]], 0.6, 0.45);
    for (let i = 0; i < 8; i++) {
      const lit = i < 7 || ease(cl(h / 0.35)) > 0.5;
      if (!lit) continue;
      const x = -10.9 + i * 2.15;
      p.face([[x, f + 0.02, 3.9], [x + 1.6, f + 0.02, 3.9], [x + 1.6, f + 0.02, 6.3], [x, f + 0.02, 6.3]], 0.2 + 0.2 * flash, 0);
    }
    p.dot([10.4, f + 0.02, 5.1], 1.1, full > 0 ? flash : 0.5);
    p.pop();
    const b = cl((h - 0.6) / 0.4);
    if (b > 0) bang(p, [13, -11, H + 11], 5 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
