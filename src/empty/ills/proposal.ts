// No proposals yet: a presentation folder standing on a base, a proposal tucked in its pocket. Hover and the proposal slides up to show its chart, and a star badge pops on the corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function star(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = (i % 2 ? 0.28 : 0.62) * r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.fillStyle = "#000"; g.fill();
  });
}

export const proposal: Illustration = {
  k: "proposal", name: "Proposal", title: "No proposals yet", body: "Write a proposal and send it to a client. You will see when they open it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const lift = 8.5 * ease(Math.min(1, h / 0.72));
    p.translate(0, 0, -16);
    p.shadow(0, 1, 28, 13, 0.11);
    p.rotate("z", -0.42);
    p.box(-13.5, -4, 0, 27, 8, 1.6, { top: 0.2, left: 0.12, right: 0.065 });
    // the back of the folder
    p.box(-12, -1.4, 1.6, 24, 1, 22.5, { top: 0.2, left: 0.065, right: 0.065, lw: 0.6 });
    // the proposal: a title, a small bar chart, a ring and two lines of text
    const y = 0.1, zt = 26 + lift, zb = 4 + lift;
    p.face([[-10, y, zb], [10, y, zb], [10, y, zt], [-10, y, zt]], 0.21, SH.edge, 0.6);
    const d = y + 0.03;
    p.line([[-7, d, zt - 3.4], [2, d, zt - 3.4]], SH.edge, 1.4);
    p.line([[-7, d, zt - 6], [-1, d, zt - 6]], SH.edge, 0.55);
    [3, 5.2, 7.4].forEach((bh, i) => { const x = -7 + i * 3; p.face([[x, d, zt - 16.5], [x + 2.2, d, zt - 16.5], [x + 2.2, d, zt - 16.5 + bh], [x, d, zt - 16.5 + bh]], 0.03, SH.edge, 0.45); });
    p.ringV("y", [5.4, d, zt - 12.6], 2.9, 0, SH.edge, 0.8);
    p.line([[5.4, d, zt - 12.6], [5.4, d, zt - 9.7]], SH.edge, 0.6); p.line([[5.4, d, zt - 12.6], [7.8, d, zt - 14.2]], SH.edge, 0.6);
    p.line([[-7, d, zt - 19.2], [7, d, zt - 19.2]], SH.edge, 0.55);
    // the pocket in front, cut on a slant, with a slot for a card
    const f = 0.7;
    p.face([[12, -1.4, 1.6], [12, f, 1.6], [12, f, 17.5], [12, -1.4, 17.5]], 0.065, SH.edge, 0.5);
    p.face([[-12, f, 1.6], [12, f, 1.6], [12, f, 17.5], [-12, f, 9.5]], 0.13, SH.edge, 0.6);
    p.line([[-8.5, f + 0.03, 4.4], [-8.5, f + 0.03, 7.2], [-2.5, f + 0.03, 7.2], [-2.5, f + 0.03, 4.4]], SH.edge, 0.6);
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) star(p, [10, y, zt], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
