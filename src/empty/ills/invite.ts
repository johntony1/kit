// No invitations: an envelope lying flat with its flap open and a card peeking out. Hover and the card rises out, a big plus on it, with a sparkle.
import { SH, type Illustration, type V3 } from "../dots";

const X = 14, Y = 9, T = 2.4; // half width, half depth, thickness of the envelope
const CW = 11, CH = 17; // half width and height of the card
const CY = -Y + 1.6; // the plane the card stands in

const backOut = (h: number) => 1 + 2.2 * Math.pow(h - 1, 3) + 1.2 * Math.pow(h - 1, 2);

export const invite: Illustration = {
  k: "invite", name: "Invitation", title: "No invitations", body: "When someone invites you to join them, it will be waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 2, 27, 12, 0.12);
    p.push();
    p.rotate("z", -0.38);
    // the flap, folded open behind: its inside faces us
    const fz = T + 12;
    p.face([[-X, -Y, T], [X, -Y, T], [0, -Y - 3.5, fz]], SH.right, 0);
    p.line([[-X + 1.2, -Y + 0.02, T + 0.3], [0, -Y - 3.2, fz - 1.4], [X - 1.2, -Y + 0.02, T + 0.3]], SH.edge, 0.55);
    // the envelope: a flat box with a lit back, then the dark mouth along the back edge
    p.box(-X, -Y, 0, X * 2, Y * 2, T, { top: 0.2 });
    p.clear([[-X + 0.8, -Y + 0.3, T + 0.02], [X - 0.8, -Y + 0.3, T + 0.02], [X - 0.8, CY + 0.9, T + 0.02], [-X + 0.8, CY + 0.9, T + 0.02]]);
    // the side and bottom flaps' seams on the back, cut
    const z = T + 0.03;
    p.line([[-X + 0.3, Y - 0.3, z], [-2.6, 0.6, z], [2.6, 0.6, z], [X - 0.3, Y - 0.3, z]], SH.edge, 0.65);
    p.line([[-X + 0.3, CY + 1.2, z], [-2.6, 0.6, z]], SH.edge, 0.55);
    p.line([[X - 0.3, CY + 1.2, z], [2.6, 0.6, z]], SH.edge, 0.55);
    // the card: peeks out at rest, rises with a little overshoot on hover, then bobs
    const rise = 4.5 + 11 * backOut(h) * (h > 0 ? 1 : 0) + h * Math.sin(t * 2.6) * 0.6;
    const top = T + rise;
    const bot = Math.max(T, top - CH);
    const cy = CY + 0.03;
    p.face([[-CW, CY, bot], [CW, CY, bot], [CW, CY, top], [-CW, CY, top]], 0.26, 0);
    p.face([[-CW, CY - 0.8, top], [CW, CY - 0.8, top], [CW, CY, top], [-CW, CY, top]], 0.3, 0);
    p.face([[CW, CY - 0.8, bot], [CW, CY, bot], [CW, CY, top], [CW, CY - 0.8, top]], SH.right, 0);
    p.line([[-CW + 0.1, cy, bot + 0.3], [-CW + 0.1, cy, top - 0.1], [CW - 0.1, cy, top - 0.1], [CW - 0.1, cy, bot + 0.3]], SH.edge, 0.6);
    // the plus in a ring, near the card's top, cut, plus two lines of text under it
    const pc = top - 6.5;
    const keep = (q: V3[]) => q.every((v) => v[2] > T + 0.4);
    const ring: V3[] = Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [Math.cos(a) * 4.2, cy, pc + Math.sin(a) * 4.2] as V3; }).filter((v) => v[2] > T + 0.4);
    if (ring.length > 1) p.line(ring, SH.edge, 0.9);
    const bars: V3[][] = [[[-2.2, cy, pc], [2.2, cy, pc]], [[0, cy, pc - 2.2], [0, cy, pc + 2.2]], [[-6, cy, pc - 7], [6, cy, pc - 7]], [[-4, cy, pc - 9.4], [4, cy, pc - 9.4]]];
    bars.forEach((b, i) => {
      const q = b.map((v) => [v[0], v[1], Math.max(v[2], T + 0.5)] as V3);
      if (keep(b) || (i === 1 && b[1][2] > T + 1)) p.line(q, SH.edge, i < 2 ? 1.3 : 0.65);
    });
    p.pop();
    // sparkles once the card is out
    const k = Math.max(0, (h - 0.6) / 0.4);
    if (k > 0) ([[-16, 0, 26], [10, -12, 30], [17, 2, 20]] as V3[]).forEach((q, i) => p.dot(q, 0.9 + 0.4 * Math.sin(t * 3 + i * 2.1), k));
  },
};
