// Reward card: a card with a star on it, standing in a small holder. Hover and it lifts out, a shimmer crosses it and the star lights up.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const CW = 13, CH = 17, T = 0.7; // the card: half width, height, half thickness

export const rewardcard: Illustration = {
  k: "rewardcard", name: "Reward card", title: "No reward cards yet", body: "Join a rewards programme and your card will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(seg(h, 0, 0.6));
    p.translate(0, 0, -13);
    p.shadow(0, 0, 23, 10, 0.11);
    p.rotate("z", -0.5);
    // the holder: a low block with a slot
    p.box(-9, -4, 0, 18, 8, 3, { top: 0.2 });
    p.line([[-7.6, T + 0.3, 3.02], [7.6, T + 0.3, 3.02]], SH.edge, 1);
    // the card
    const zb = 3 + 6 * k + h * Math.sin(t * 2.4) * 0.6;
    p.box(-CW, -T, zb, CW * 2, T * 2, CH, { top: 0.32, left: 0.2, right: SH.right });
    const y = T + 0.03, f = (x: number, z: number): V3 => [x, y, zb + z];
    // a shimmer: a slanted bright band that crosses the card once
    const s = seg(h, 0.3, 0.9);
    if (s > 0 && s < 1) {
      const x0 = -CW - 6 + (CW * 2 + 10) * s, cl = (x: number) => Math.max(-CW, Math.min(CW, x));
      p.face([f(cl(x0), 0), f(cl(x0 + 3.4), 0), f(cl(x0 + 7.4), CH), f(cl(x0 + 4), CH)], 0.34, 0);
    }
    // the star, dim at rest and lit on hover
    const lit = seg(h, 0.45, 0.8), R = 5 * (1 + 0.2 * Math.sin(Math.PI * lit));
    const st = Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? R * 0.44 : R; return [-5.6 + Math.cos(a) * q, y + 0.02, zb + 9.4 + Math.sin(a) * q] as V3; });
    p.face(st, 0.06 + 0.34 * lit, SH.edge, 0.7);
    p.line([...st, st[0]], SH.edge, 0.9);
    // two lines of detail and a strip along the bottom
    p.line([f(2, 11.8), f(10, 11.8)], SH.edge, 1.1);
    p.line([f(2, 8.4), f(7.4, 8.4)], SH.edge, 0.7);
    p.line([f(-CW + 2, 3), f(CW - 2, 3)], SH.edge, 0.6);
    // sparkles at the end
    const e = seg(h, 0.75, 1);
    if (e > 0) ([[-15, 2, zb + 20], [9, 2, zb + 22], [17, 2, zb + 11]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.4 * Math.sin(t * 3.2 + i * 2), e));
  },
};
