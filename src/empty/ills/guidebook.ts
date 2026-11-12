// No guides saved: a travel guide standing upright, a map pin on its cover. Hover and it hops while three page markers slide up out of the top.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const X = 9, ZT = 26, YC = 3; // half width, height, the front of the cover

export const guidebook: Illustration = {
  k: "guidebook", name: "Guidebook", title: "No guides saved", body: "Save a guide for a place you want to visit and it will be shelved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const hop = 2.6 * Math.sin(Math.min(1, h / 0.5) * Math.PI);
    p.translate(0, 0, -15);
    p.scale(1.12);
    p.shadow(0, 0, 21 - hop, 10, 0.12);
    p.rotate("z", -0.3);
    p.translate(0, 0, hop);
    // page markers rising out of the pages
    [[-5.5, 6.5, 0.15], [-1, 4.4, 0.3], [3.5, 7.4, 0.45]].forEach(([x, len, at]) => {
      const k = ease((h - at) / 0.45);
      if (k > 0.02) p.box(x, -0.5, ZT - 1, 3, 1, 1 + len * k, { top: 0.3, left: 0.3, right: 0.14, lw: 0.5 });
    });
    // the back cover, the pages, the front cover
    p.box(-X, -YC, 0, X * 2, 0.8, ZT, { top: 0.22, left: 0.2, right: 0.1 });
    p.box(-X, -YC + 0.8, 0.7, X * 2 - 0.8, YC * 2 - 1.6, ZT - 1.4, { top: 0.2, left: 0.1, right: 0.045, edge: 0 });
    for (const y of [-1.2, 0, 1.2]) p.line([[X - 0.77, y, 1.2], [X - 0.77, y, ZT - 1.2]], 0.5, 0.4);
    for (const y of [-1.1, 0.4]) p.line([[-X + 0.6, y, ZT - 0.68], [X - 1.2, y, ZT - 0.68]], SH.edge, 0.45);
    p.box(-X, YC - 0.8, 0, X * 2, 0.8, ZT, { top: 0.24, left: 0.21, right: 0.1, lw: 0.6 });
    p.line([[-X, YC + 0.03, ZT], [X, YC + 0.03, ZT]], SH.edge, 0.6);
    // the cover: a map pin over two title bars, and a band near the spine
    const F = (u: number, v: number): V3 => [u, YC + 0.04, v];
    const pin: V3[] = [];
    for (let i = 0; i <= 20; i++) { const a = -0.62 + (i / 20) * (Math.PI + 1.24); pin.push(F(1 + Math.cos(a) * 4.2, 16.4 + Math.sin(a) * 4.2)); }
    pin.push(F(1, 8.6));
    p.clear(pin);
    p.face(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [1 + Math.cos(a) * 1.6, YC + 0.06, 16.6 + Math.sin(a) * 1.6] as V3; }), 0.3, 0);
    p.line([F(-4, 5.4), F(6, 5.4)], SH.edge, 1.2);
    p.line([F(-2, 3.2), F(4, 3.2)], SH.edge, 0.7);
    p.line([F(-X + 1.8, 0), F(-X + 1.8, ZT)], SH.edge, 0.6);
  },
};
