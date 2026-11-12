// No gift cards: a gift card tucked in its sleeve, a bow showing. Hover and the card slides up out of the sleeve and sparkles.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const giftcard: Illustration = {
  k: "giftcard", name: "Gift card", title: "No gift cards", body: "Gift cards you buy or receive will be kept here with their balance.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.2));
    p.translate(0, 0, -13);
    p.shadow(0, 0, 25, 9, 0.11);
    p.rotate("z", -0.6); // turned to face us
    const W = 13, SL = 12; // half width of the sleeve, its height
    // the back of the sleeve
    p.box(-W, -1.8, 0, W * 2, 1, SL + 1.5, { top: 0.2, left: 0.08, right: 0.06, edge: 0.8 });
    // the card: it stands in the sleeve and slides up
    const z0 = 4.5 + 8 * k + (k > 0.9 ? 0.4 * Math.sin(t * 2.4) : 0), CH = 16, CW = 11.5, Y = 0.32;
    p.box(-CW, -0.7, z0, CW * 2, 1, CH, { top: 0.3, left: 0.17, right: 0.1 });
    const q = (x: number, z: number): V3 => [x, Y, z0 + z];
    // the ribbon: an upright band and a band across, with a bow where they meet
    p.face([q(-6.4, 0), q(-3.6, 0), q(-3.6, CH), q(-6.4, CH)], 0.42, 0);
    p.face([q(-CW, CH - 5.6), q(CW, CH - 5.6), q(CW, CH - 3.2), q(-CW, CH - 3.2)], 0.42, 0);
    const bx = -5, bz = CH - 4.4;
    for (const s of [-1, 1]) {
      p.face([q(bx, bz), q(bx + s * 4.6, bz + 3), q(bx + s * 5.4, bz + 0.2), q(bx + s * 3.6, bz - 1.6)], 0.9, SH.edge, 0.5);
      p.line([q(bx, bz), q(bx + s * 2.4, bz - 4.4)], SH.edge, 0.9);
    }
    p.dot(q(bx, bz), 1.25, 1);
    // the value, lower right: a mark and two short lines
    p.line([q(2, 6.4), q(8.6, 6.4)], 0.8, 0.7); p.line([q(2, 4.2), q(6, 4.2)], 0.55, 0.6);
    // the front of the sleeve, with its cut out thumb notch
    const F = 1.2;
    p.box(-W, 0.4, 0, W * 2, 0.8, SL, { top: 0.24, left: 0.11, right: 0.06 });
    const notch: V3[] = Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return [Math.cos(a) * 3.4, F + 0.03, SL + Math.sin(a) * 3] as V3; });
    p.clear(notch); p.line(notch, SH.edge, 0.55);
    p.line([[-W + 2, F + 0.03, 3], [-W + 9, F + 0.03, 3]], 0.6, 0.5);
    // sparkles once it is out
    const s = Math.max(0, (h - 0.6) / 0.4);
    if (s > 0) ([[-13, 2, 26], [12.5, 0, 30], [15, 2, 17]] as V3[]).forEach((v, i) => {
      const [x, y] = p.pt(v), r = (2 + 0.8 * Math.sin(t * 3.4 + i * 2.1)) * s;
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 0.7; g.lineCap = "round"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); });
    });
  },
};
