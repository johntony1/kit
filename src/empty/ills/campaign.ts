// No campaigns yet: an empty billboard on two posts, a rolled poster waiting along its top edge. Hover and the poster unrolls down the board, and the lamps above it come on.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const Y = 1.24, TOP = 28, BOT = 12.6;

export const campaign: Illustration = {
  k: "campaign", name: "Campaign", title: "No campaigns yet", body: "Launch your first campaign and track how far it reaches from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.7));
    p.translate(0, 0, -17);
    p.shadow(0, 1, 30, 13, 0.11);
    p.rotate("z", -0.42);
    // two posts and the board, its face dark until the poster covers it
    for (const x of [-10, 7.4]) p.box(x, -1, 0, 2.6, 2, 11, { top: 0, left: 0.2, right: 0.1, edge: 0 });
    p.box(-17.5, -1.2, 11, 35, 2.4, 18.6, { top: 0.22, left: 0.035, right: 0.065, lw: 0.6 });
    p.box(-17.5, 1.2, 10.2, 35, 2.2, 0.9, { lw: 0.5 }); // the catwalk
    p.guide([[-15.5, Y, BOT], [15.5, Y, BOT], [15.5, Y, TOP], [-15.5, Y, TOP], [-15.5, Y, BOT]]);
    // the poster, unrolled as far as `edge`
    const edge = TOP - 1.2 - (TOP - BOT - 1.2) * k;
    p.face([[-15.5, Y, edge], [15.5, Y, edge], [15.5, Y, TOP], [-15.5, Y, TOP]], 0.21, SH.edge, 0.55);
    const d = Y + 0.03, shown = (z: number) => z > edge + 0.4;
    // its art: a bold star, a headline, two lines and a button
    if (shown(15.4)) p.face(Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? 2.3 : 5.4; return [-8.4 + Math.cos(a) * q, d, 20.6 + Math.sin(a) * q] as V3; }), 0.03, SH.edge, 0.6);
    if (shown(24)) p.line([[-0.5, d, 24], [12.5, d, 24]], SH.edge, 1.5);
    if (shown(20.8)) p.line([[-0.5, d, 20.8], [10, d, 20.8]], SH.edge, 0.6);
    if (shown(18.4)) p.line([[-0.5, d, 18.4], [7, d, 18.4]], SH.edge, 0.6);
    if (shown(14.2)) p.face([[-0.5, d, 14.2], [6, d, 14.2], [6, d, 16.4], [-0.5, d, 16.4]], 0.03, SH.edge, 0.5);
    // the roll at the poster's lower edge
    p.box(-16, Y, edge - 0.9, 32, 1.5, 1.6, { top: 0.3, left: 0.3, right: 0.2, lw: 0.5 });
    // three lamps on arms over the top: they come on once the poster is up
    const on = Math.max(0, (h - 0.66) / 0.34);
    for (const x of [-11, 0, 11]) {
      p.box(x - 0.4, 0, 29.6, 0.8, 5.4, 0.7, { top: 0.2, left: 0.2, right: 0.2, edge: 0 });
      p.box(x - 1.4, 4.4, 28.6, 2.8, 2.6, 1.7, { top: 0.22, left: on > 0 ? 0.34 : 0.12, right: 0.065, lw: 0.5 });
      if (on > 0) {
        p.dot([x, 5.7, 27.9], 1.2 * Math.min(1, on * 2) + 0.15 * Math.sin(t * 4 + x), 1);
        p.guide([[x, 5.7, 27.9], [x - 3, Y, 21]], true); p.guide([[x, 5.7, 27.9], [x + 3, Y, 21]], true);
      }
    }
  },
};
