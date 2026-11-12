// Ballot box: a ballot box with a slot in its lid and a ballot paper standing in the slot. Hover and the paper drops in; a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 12, D = 8.5, H = 15, LID = 2.6;

// a round bright badge with a dark tick, flat to the screen
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.52, y - r * 0.35); g.stroke();
  });
}

export const ballot: Illustration = {
  k: "ballot", name: "Ballot box", title: "No votes yet", body: "Votes will be counted here as soon as people start casting them.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 1, 27, 13, 0.11);
    p.rotate("z", -0.5);
    // the box and its wider lid
    p.box(-W, -D, 0, W * 2, D * 2, H);
    p.box(-W - 1.2, -D - 1.2, H, W * 2 + 2.4, D * 2 + 2.4, LID, { top: 0.22, left: 0.16 });
    const ZT = H + LID;
    // the slot
    p.clear([[-8, -1.1, ZT + 0.02], [8, -1.1, ZT + 0.02], [8, 1.1, ZT + 0.02], [-8, 1.1, ZT + 0.02]]);
    // a seal on the front: a lit plaque with a cut tick
    const y = D + 0.03;
    p.face([[-4.6, y, 3.4], [4.6, y, 3.4], [4.6, y, 11.6], [-4.6, y, 11.6]], 0.3, SH.edge, 0.55);
    p.line([[-2.4, y + 0.02, 7.4], [-0.7, y + 0.02, 5.6], [2.6, y + 0.02, 9.6]], SH.edge, 1);
    // the ballot paper: stands in the slot, then drops through it
    const k = ease(clamp(h / 0.6));
    const zb = ZT - 2 - 13.5 * k, hi = zb + 15, lo = Math.max(zb, ZT);
    if (hi > lo + 0.2) {
      p.face([[-6, 0, lo], [6, 0, lo], [6, 0, hi], [-6, 0, hi]], 0.9, SH.edge, 0.55);
      // a cross in a box, and two lines
      if (hi - 5.4 > lo) {
        p.line([[-4.2, 0.03, hi - 2], [-1.4, 0.03, hi - 4.8]], SH.edge, 0.8);
        p.line([[-1.4, 0.03, hi - 2], [-4.2, 0.03, hi - 4.8]], SH.edge, 0.8);
        p.line([[0.6, 0.03, hi - 2.6], [4.4, 0.03, hi - 2.6]], SH.edge, 0.8);
        p.line([[0.6, 0.03, hi - 4.6], [3.2, 0.03, hi - 4.6]], SH.edge, 0.6);
      }
      if (hi - 8.6 > lo) p.line([[-4.2, 0.03, hi - 8], [4.4, 0.03, hi - 8]], SH.edge, 0.6);
    }
    // the near lip of the slot, over the paper
    p.line([[-8, 1.1, ZT + 0.02], [8, 1.1, ZT + 0.02]], SH.edge, 0.6);
    const b = clamp((h - 0.62) / 0.38);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [12, -4, ZT + 8], 4.8 * pop);
    }
  },
};
