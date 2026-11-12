// No accounts yet: a closed briefcase. Hover and its two clasps flip open, then the lid lifts and light spills out; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 13.5, D = 3.6, H = 17, S = 10.5; // half width, half depth, height, height of the seam

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
/** the handle: an arch standing on the lid, in the plane y */
const arch = (y: number, z: number): V3[] => {
  const o: V3[] = [], i: V3[] = [];
  for (let n = 0; n <= 12; n++) { const a = Math.PI - (n / 12) * Math.PI; o.push([Math.cos(a) * 7.4, y, z + Math.sin(a) * 8.4]); i.push([Math.cos(a) * 5.2, y, z + Math.sin(a) * 6.2]); }
  return [...o, ...i.reverse()];
};

export const briefcase: Illustration = {
  k: "briefcase", name: "Briefcase", title: "No accounts yet", body: "Open your first account and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const c1 = ease(clamp(h / 0.25)), c2 = ease(clamp((h - 0.12) / 0.25)), g = 3.4 * ease(clamp((h - 0.35) / 0.4)) + (h > 0.9 ? Math.sin(t * 2.8) * 0.3 : 0);
    p.translate(0, 0, -13);
    p.scale(1.08);
    p.shadow(0, 0, 26, 13, 0.12);
    p.push();
    p.rotate("z", -0.34); // turned so its wide front faces us
    // the lower half
    p.box(-W, -D, 0, W * 2, D * 2, S, { top: 0.03, left: 0.13, right: 0.065, lw: 0.6 });
    // light in the gap once the lid lifts
    if (g > 0.2) {
      p.face([[-W + 0.8, D, S], [W - 0.8, D, S], [W - 0.8, D, S + g], [-W + 0.8, D, S + g]], 0.5, 0);
      p.face([[W, D - 0.8, S], [W, -D + 0.8, S], [W, -D + 0.8, S + g], [W, D - 0.8, S + g]], 0.3, 0);
    }
    // the lid, with the handle on it
    p.push();
    p.translate(0, 0, g);
    p.face(arch(-1.1, H), 0.1, 0);
    p.box(-W, -D, S, W * 2, D * 2, H - S, { top: 0.13, left: 0.13, right: 0.065, lw: 0.6 });
    p.face([[-W, D + 0.03, S], [W, D + 0.03, S], [W, D + 0.03, S + 0.9], [-W, D + 0.03, S + 0.9]], 0.02, 0);
    p.face(arch(1.1, H), 0.4, SH.edge, 0.55);
    p.pop();
    // a band across the front and two clasps that flip up
    p.face([[-W, D + 0.03, 2.4], [W, D + 0.03, 2.4], [W, D + 0.03, 3.3], [-W, D + 0.03, 3.3]], 0.02, 0);
    [c1, c2].forEach((c, i) => {
      const x = i ? 7.6 : -7.6;
      p.box(x - 1.7, D, S - 2.4 + 3.2 * c, 3.4, 1, 4.2 - 1.6 * c, { top: 0.45, left: 0.45, right: 0.2, lw: 0.5 });
    });
    p.pop();
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) badge(p, [17, -11, 28], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
