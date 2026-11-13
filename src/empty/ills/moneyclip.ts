// No cash on hand: a thick stack of folded notes held by one bold metal clip across the middle, a currency seal on the top note. Hover and the clip lifts as the top note slides out from under it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 14, D = 8, T = 8; // half length, half width and thickness of the stack
const CX = 3.2; // half width of the clip

// a note's printed seal: a dark ring round a lit oval with a dollar mark cut into it
function seal(p: Pen, x: number, z: number) {
  p.disc(x, 0, z, 4.4, 0.02);
  p.disc(x, 0, z + 0.02, 3.5, 0.34);
  const [cx, cy] = p.pt([x, 0, z]);
  p.screen((g) => {
    g.strokeStyle = "#000"; g.lineWidth = 0.75; g.lineCap = "round";
    g.beginPath();
    g.arc(cx, cy - 0.85, 0.95, -0.2, Math.PI * 1.5, true);
    g.arc(cx, cy + 0.85, 0.95, -Math.PI / 2, Math.PI * 0.8);
    g.moveTo(cx, cy - 2.6); g.lineTo(cx, cy + 2.6);
    g.stroke();
  });
}

export const moneyclip: Illustration = {
  k: "moneyclip", name: "Money clip", title: "No cash on hand", body: "Add the cash you carry and it will be counted here with the rest of your money.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = ease(clamp(h / 0.45)), slide = ease(clamp((h - 0.25) / 0.6)), bob = h * Math.sin(t * 2.6) * 0.25;
    p.translate(0, 0, -6);
    p.scale(1.12);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", -0.5);
    // the stack: dense near wall with the sheets cut into it, sparse end, a lit top
    p.box(-W, -D, 0, W * 2, D * 2, T, { top: 0.2, left: 0.13, right: 0.065, edge: 0 });
    for (const z of [2, 4, 6]) p.line([[-W, D + 0.03, z], [W, D + 0.03, z], [W + 0.03, -D, z]], SH.edge, 0.55);
    p.line([[-W, D + 0.03, T], [W, D + 0.03, T], [W + 0.03, -D, T]], SH.edge, 0.7);
    // the top note, sliding out toward the near end
    const sx = 4.5 * slide;
    p.push();
    p.translate(sx, 0, T + bob * 0.3);
    p.box(-W, -D, 0, W * 2, D * 2, 0.9, { top: 0.22, left: 0.14, right: 0.07, edge: 0 });
    seal(p, -8.5, 0.95);
    seal(p, 8.5, 0.95);
    p.pop();
    // the clip: a bright band down the near wall and across the top, lifting a little on hover
    const zt = T + 0.9 + 1.6 * lift + bob;
    p.box(-CX, D, -0.4, CX * 2, 1.1, zt + 0.4, { top: 0.36, left: 0.34, right: 0.12, edge: 0 });
    p.box(-CX, -D + 1, zt, CX * 2, D * 2, 1.2, { top: 0.36, left: 0.3, right: 0.12, edge: 0 });
    // dark cuts round the band so it stands off the notes
    p.line([[-CX - 0.05, -D + 1, zt + 1.2], [-CX - 0.05, D + 1.1, zt + 1.2], [-CX - 0.05, D + 1.13, -0.4]], SH.edge, 0.9);
    p.line([[CX + 0.05, -D + 1, zt + 1.22], [CX + 0.05, D + 1.1, zt + 1.22]], SH.edge, 0.7);
    p.line([[-CX, D + 1.13, zt + 1.2], [CX, D + 1.13, zt + 1.2]], SH.edge, 0.6);
  },
};
