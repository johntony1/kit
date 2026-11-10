// No integrations: two app blocks set apart, one with a plug. Hover and the other slides over onto the plug; both light up.
import { SH, type Illustration, type V3 } from "../dots";

const BW = 9, BD = 4.6, BH = 7; // a block's width (x), half depth (y) and height
const PL = 3; // prong length

export const integrations: Illustration = {
  k: "integrations", name: "Integrations", title: "No integrations yet", body: "Connect the tools you already use and they will work together here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, 0, -8);
    p.shadow(-1, 0, 34, 15, 0.12);
    p.box(-17, -8, 0, 32, 16, 2.2, { top: p.ink ? 0.2 : 0.12, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[-17, 8, 2.2], [15, 8, 2.2], [15, -8, 2.2]], SH.edge, 0.6);
    const Z = 2.22;
    const AX = -15.5, SX = AX + BW; // block A's back, and its plug face
    const bx = SX + 0.3 + (1 - h) * 9; // block B's near face
    const on = h > 0.92;
    // where block B will sit, dashed
    if (h < 0.95) p.guide([[SX + 0.3, -BD, Z], [SX + 0.3 + BW, -BD, Z], [SX + 0.3 + BW, BD, Z], [SX + 0.3, BD, Z], [SX + 0.3, -BD, Z]], true);
    // block A, with a plate on its side and the prongs sticking out of it
    p.box(AX, -BD, Z, BW, BD * 2, BH, { top: 0.22, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[AX, BD, Z], [SX, BD, Z], [SX, -BD, Z]], SH.edge, 0.6);
    p.face([[SX + 0.02, -3, Z + 1.4], [SX + 0.02, 3, Z + 1.4], [SX + 0.02, 3, Z + 5.6], [SX + 0.02, -3, Z + 5.6]], 0.2, SH.edge, 0.55);
    if (!p.ink) p.line([[SX + 0.04, -3, Z + 1.4], [SX + 0.04, 3, Z + 1.4], [SX + 0.04, 3, Z + 5.6], [SX + 0.04, -3, Z + 5.6], [SX + 0.04, -3, Z + 1.4]], SH.edge, 0.6);
    // A's icon, a bolt, upright on screen, and its status light
    const za = Z + BH + 0.02;
    const ax = AX + 4.2, k = 1.5;
    p.line(([[0.4, -1], [-0.4, 0.1], [0.4, 0.1], [-0.4, 1.1]] as [number, number][]).map(([u, v]) => [ax + (u + v) * k, (v - u) * k, za] as V3), SH.edge, 0.9);
    p.face([[AX + 6.6, -3.6, za], [AX + 8, -3.6, za], [AX + 8, -2.2, za], [AX + 6.6, -2.2, za]], on ? 0.34 : 0.04, SH.edge, 0.5);
    // the prongs: the part not yet inside block B
    const reach = Math.min(PL, bx - SX);
    for (const y of [-2.1, 1.1]) if (reach > 0.05) p.box(SX, y, Z + 2.8, reach, 1, 1.5, { top: 0.34, left: 0.12, right: 0.065 });
    // block B
    p.box(bx, -BD, Z, BW, BD * 2, BH, { top: 0.22, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[bx, BD, Z], [bx + BW, BD, Z], [bx + BW, -BD, Z]], SH.edge, 0.6);
    const zb = Z + BH + 0.02;
    p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [bx + 4.2 + Math.cos(a) * 2, Math.sin(a) * 2, zb] as V3; }), SH.edge, 0.9);
    p.face([[bx + 6.6, -3.6, zb], [bx + 8, -3.6, zb], [bx + 8, -2.2, zb], [bx + 6.6, -2.2, zb]], on ? 0.34 : 0.04, SH.edge, 0.5);
    // a spark over the joint once it is in
    if (on) for (let i = 0; i < 5; i++) {
      const u = (t * 0.9 + i / 5) % 1, a = i * 1.26;
      p.dot([SX + 0.3, Math.cos(a) * (2 + u * 3), Z + BH + 1 + u * 5 + Math.sin(a)], 0.7, u < 0.7 ? 1 : 0.5);
    }
  },
};
