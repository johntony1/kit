// No drinks yet: a juice box with an orange slice on its front and a straw in the top. Hover and the straw pops up, bends over and a few drops spring from its tip.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const W = 9.5, D = 6, H = 25; // half width, half depth, height
/** a bright mark drawn flat to the screen */
function stroke(p: Pen, pts: V3[], lw: number) {
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const juice: Illustration = {
  k: "juice", name: "Juice", title: "No drinks yet", body: "Add a drink to the menu and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // the straw rises past its rest and settles, then bends over
    const r = seg(h, 0, 0.5), back = 1 + 2.4 * Math.pow(r - 1, 3) + 1.4 * Math.pow(r - 1, 2);
    const L = 7 + 5 * back, bend = 0.35 + 0.55 * seg(h, 0.35, 0.7);
    p.translate(0, 0, -16);
    p.shadow(0, 0, 22, 11, 0.1);
    p.rotate("z", -0.3);
    // the box: a bright front for the label, a dim end, a lit top with its folded seam
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.24, right: 0.065, edge: 0 });
    p.line([[-W, D + 0.03, H - 1.6], [W, D + 0.03, H - 1.6], [W + 0.03, -D, H - 1.6]], SH.edge, 0.7);
    p.line([[-W, D + 0.03, 1.4], [W, D + 0.03, 1.4], [W + 0.03, -D, 1.4]], SH.edge, 0.55);
    p.line([[-W + 1, 0, H + 0.03], [W - 1, 0, H + 0.03]], SH.edge, 0.6);
    // the orange slice on the front: a dark peel ring, bright flesh cut into segments, and a leaf
    const c: V3 = [-1, D + 0.04, 11], R = 6.2;
    p.ringV("y", c, R, 0.03, 0);
    p.ringV("y", [c[0], c[1] + 0.01, c[2]], R - 1.3, 0.34, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      p.line([[c[0], c[1] + 0.03, c[2]], [c[0] + Math.cos(a) * (R - 1.6), c[1] + 0.03, c[2] + Math.sin(a) * (R - 1.6)]], SH.edge, 0.7);
    }
    p.face(Array.from({ length: 13 }, (_, i) => {
      const s = i <= 6 ? i / 6 : (12 - i) / 6, w = (i <= 6 ? 1 : -1) * 1.6 * Math.sin(Math.PI * s);
      return [c[0] + 1.5 + s * 6 - w * 0.5, c[1] + 0.05, c[2] + R - 0.6 + s * 3.4 + w] as V3;
    }), 0.32, SH.edge, 0.5);
    // the straw: up out of a hole in the top, then bent over toward us
    const base: V3 = [4.5, -1.5, H], up: V3 = [4.5, -1.5, H + L];
    p.disc(4.5, -1.5, H + 0.04, 1.3, 0.02, 0);
    const tip: V3 = [up[0] + Math.sin(bend) * 4.4, up[1] - Math.sin(bend) * 1.2, up[2] + Math.cos(bend) * 4.4];
    stroke(p, [base, up, tip], 2.3);
    // drops springing from the tip once it bends
    const d = seg(h, 0.6, 1);
    if (d > 0) for (let i = 0; i < 3; i++) {
      const u = (d * 1.4 + t * 0.6 + i / 3) % 1, s = (i - 1) * 2.2;
      const [x, y] = p.pt([tip[0] + 1 + u * 4 + s * 0.4, tip[1] + s * 0.3, tip[2] + 3 * Math.sin(u * Math.PI) - u * 4]);
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, 1.1 * Math.sin(u * Math.PI) + 0.2, 0, Math.PI * 2); g.fill(); });
    }
  },
};
