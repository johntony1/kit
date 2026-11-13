// No snippets saved: a code card standing up with a bold </> on it and a dashed cut line across, scissors waiting at the cut. Hover and the scissors run along the line, and the top piece, the snippet, lifts away.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 15, T = 3, CUT = 11, H = 36; // half width, thickness, height of the cut, total height

export const snippet: Illustration = {
  k: "snippet", name: "Snippet", title: "No snippets saved", body: "Save a piece of code you reuse and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 28, 11, 0.11);
    p.rotate("z", -0.42);
    const y = T / 2 + 0.03;
    const k = ease(Math.min(1, h / 0.6)); // how far the scissors have run
    const lift = ease(Math.max(0, Math.min(1, (h - 0.55) / 0.45)));
    // the bottom piece: two short code lines
    p.box(-W, -T / 2, 0, 2 * W, T, CUT - 0.4, { top: 0.2, left: 0.22, right: 0.065, edge: 0 });
    p.line([[-W + 4, y, 6.5], [W - 9, y, 6.5]], SH.edge, 1.3);
    p.line([[-W + 4, y, 3], [W - 15, y, 3]], SH.edge, 1.3);
    // the top piece: lifts and tilts once cut
    p.push();
    p.translate(0, 0, 4 * lift + h * Math.sin(t * 2.6) * 0.4 * lift);
    p.rotate("y", -0.12 * lift, [W, 0, CUT]);
    p.box(-W, -T / 2, CUT + 0.4, 2 * W, T, H - CUT - 0.4, { top: 0.2, left: 0.24, right: 0.065, edge: 0 });
    // a bold </> across the middle
    const z = 24.5, lw = 2.3;
    p.line([[-6, y, z + 5], [-12, y, z], [-6, y, z - 5]], SH.edge, lw);
    p.line([[6, y, z + 5], [12, y, z], [6, y, z - 5]], SH.edge, lw);
    p.line([[-2.4, y, z - 6], [2.4, y, z + 6]], SH.edge, lw);
    p.pop();
    // the cut: a solid gap where the scissors have been, dashes ahead of them
    const sx = -W - 1 + (2 * W + 2) * k;
    if (sx > -W) p.line([[-W, y, CUT], [Math.min(W, sx), y, CUT]], SH.edge, 1.1);
    for (let x = -W + 0.8; x < W - 1; x += 3.6) if (x > sx) p.line([[x, y, CUT], [Math.min(W - 0.4, x + 1.8), y, CUT]], SH.edge, 1.1);
    // the scissors, open blades pointing along the cut, snipping as they go
    if (k < 1) {
      const snip = 0.2 + 0.2 * Math.abs(Math.sin(h * 30));
      const [x0, y0] = p.pt([sx, y + 0.5, CUT]);
      const [x1, y1] = p.pt([sx + 4, y + 0.5, CUT]);
      const a = Math.atan2(y1 - y0, x1 - x0);
      p.screen((g) => {
        g.translate(x0, y0); g.rotate(a);
        const draw = (col: string, lw: number) => {
          g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round";
          for (const s of [-1, 1]) {
            g.beginPath(); g.moveTo(0, 0); g.lineTo(7 * Math.cos(s * snip), 7 * Math.sin(s * snip)); g.stroke();
            g.beginPath(); g.arc(-3.6, -s * 2.4, 1.9, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.moveTo(0, 0); g.lineTo(-2.2, -s * 1.5); g.stroke();
          }
        };
        draw("#000", 3); draw("#fff", 1.4);
      });
    }
  },
};
