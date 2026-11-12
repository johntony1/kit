// Nothing pinned: a push pin standing in a square note. Hover and the pin lifts out, comes down hard and sticks, a ring spreading across the note where it lands.
import { SH, type Illustration, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const pinned: Illustration = {
  k: "pinned", name: "Pinned", title: "Nothing pinned", body: "Pin the things you need most often and they will stay here, close at hand.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 30, 15, 0.1);
    // the note: a thin square, a few written lines
    const N = 13, TH = 1.4;
    p.box(-N, -N, 0, N * 2, N * 2, TH, { top: 0.2, left: 0.13, right: 0.07, lw: 0.6 });
    const zt = TH + 0.03;
    for (const [y, a, b] of [[3, -9, 9], [6.5, -9, 9], [10, -9, 2]] as [number, number, number][]) p.line([[a, y, zt], [b, y, zt]], SH.edge, 1);
    // the pin: up, then down fast, then still
    const px = -1, py = -4;
    const up = ease(seg(h, 0, 0.42)), dn = Math.pow(seg(h, 0.5, 0.68), 2);
    const z = 11 * up * (1 - dn);
    // the ring where it lands
    const rk = seg(h, 0.68, 1);
    if (rk > 0 && rk < 1) p.line(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [px + Math.cos(a) * (3 + rk * 8), py + Math.sin(a) * (3 + rk * 8), zt] as V3; }), SH.edge, 1 - rk * 0.6);
    p.disc(px, py, zt, 1.3 + z * 0.12, 0.03);
    p.push();
    p.rotate("y", -0.22, [px, py, TH]);
    p.translate(0, 0, z);
    p.box(px - 0.5, py - 0.5, TH, 1, 1, 6, { top: 0.2, left: 0.2, right: 0.13, edge: 0 });
    p.cylinder(px, py, TH + 6, 5.2, 1.5, { side: 0.13, top: 0.22, lw: 0.6 });
    p.cylinder(px, py, TH + 7.5, 2.4, 6.5, { side: 0.1, top: 0.2, lw: 0.6 });
    p.cylinder(px, py, TH + 14, 4.6, 2.2, { side: 0.2, top: 0.34, lw: 0.6 });
    p.pop();
  },
};
