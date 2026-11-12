// No holidays planned: a striped beach umbrella on a patch of sand, a towel and a ball beside it. The umbrella sways in the breeze and the ball bounces.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a rail, a pole): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const P = 3.2; // seconds per loop
const ZA = 27, R = 16, DROP = 6.5, N = 8; // the canopy: apex height, radius, how far the rim hangs, panels

export const beach: Illustration = {
  k: "beach", name: "Beach umbrella", title: "No holidays planned", body: "Plan some time away and your holidays will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 30, 13, 0.1);
    // the sand: a sparse patch
    p.disc(0, 0, 0, 23, 0.03, 0);
    // a towel laid out on it
    p.box(4, 6, 0, 15, 8, 0.5, { top: 0.22, left: 0.14, right: 0.08 });
    for (const x of [7, 10, 13, 16]) p.line([[x, 6, 0.53], [x, 14, 0.53]], SH.edge, 0.7);
    // the umbrella: a leaning pole and a canopy of alternating panels, swaying
    p.push();
    p.rotate("y", -0.16 + 0.04 * Math.sin(w), [0, 0, 0]);
    p.rotate("x", 0.05 * Math.sin(w + 1.3), [0, 0, 0]);
    rod(p, [[0, 0, 0], [0, 0, ZA + 1.6]], 1);
    const rim = (i: number): V3 => { const a = (i / N) * Math.PI * 2 + 0.2; return [Math.cos(a) * R, Math.sin(a) * R, ZA - DROP]; };
    Array.from({ length: N }, (_, i) => i)
      .sort((a, b) => { const ca = rim(a + 0.5), cb = rim(b + 0.5); return ca[0] + ca[1] - cb[0] - cb[1]; })
      .forEach((i) => {
        const a = rim(i), b = rim(i + 1);
        p.face([[0, 0, ZA], a, b], i % 2 ? 0.26 : 0.1, SH.edge, 0.55);
        p.line([[0, 0, ZA], a, b], SH.edge, 0.5);
      });
    p.dot([0, 0, ZA + 1.6], 0.9, 1);
    p.pop();
    // the ball: bounces twice a loop
    const bz = 4 + 6 * Math.abs(Math.sin(w));
    const [bx, by] = p.pt([-12, 11, bz]);
    p.screen((g) => {
      g.beginPath(); g.arc(bx, by, 4, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      g.strokeStyle = "#000"; g.lineWidth = 0.6;
      g.beginPath(); g.ellipse(bx, by, 1.5, 4, 0.5, 0, Math.PI * 2); g.stroke();
    });
  },
};
