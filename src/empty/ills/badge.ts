// No profile yet: an ID badge on a lanyard, hanging from a hook and swinging gently. The photo is an empty silhouette.
import { SH, type Illustration } from "../dots";

const P = 3.2; // seconds per swing
const W = 10, H = 26, T = 0.7; // half width, height and half thickness of the card
const Z0 = 4; // the card's bottom edge
const HK = Z0 + H + 14; // the hook

export const badge: Illustration = {
  k: "badge", name: "ID badge", title: "No profile yet", body: "Add a photo and a few details so people know who they are working with.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = 0.16 * Math.sin((Math.PI * 2 * t) / P);
    p.translate(0, 0, -24);
    p.shadow(Math.sin(a) * 10, 0, 16, 6, 0.1);
    p.push();
    p.rotate("z", -0.5);
    // the hook: a small lit block with a peg
    p.box(-2.4, -3, HK, 4.8, 3, 3, { top: 0.26 });
    p.box(-0.9, 0, HK + 0.6, 1.8, 2.2, 1.8, { top: 0.26 });
    p.rotate("y", a, [0, 0, HK + 1.5]);
    // the lanyard: two straps from the peg down to the clip
    const ZC = Z0 + H + 2.4; // the clip's top
    const strap = (s: number, fill: number) => p.face([[s * 0.4, 0.5, HK + 1.6], [s * 2.4, 0.5, HK + 1.2], [s * 3.6, 0.5, ZC], [s * 1.4, 0.5, ZC]], fill, 0);
    strap(1, SH.right); strap(-1, 0.16);
    p.line([[-0.4, 0.55, HK + 1.6], [-1.4, 0.55, ZC]], SH.edge, 0.55);
    // the clip: a little lit block with a ring through the card
    p.box(-2.6, -0.8, ZC - 1, 5.2, 1.6, 2.4, { top: 0.28, left: 0.2 });
    p.line([[0, 0.82, ZC - 0.6], [0, 0.82, Z0 + H - 1.6]], SH.edge, 0.9);
    // the card: a lit front, a bright top edge, a sparse right edge
    p.box(-W, -T, Z0, W * 2, T * 2, H, { top: 0.3, left: 0.2, right: SH.right });
    const y = T + 0.03;
    // the slot punched for the clip
    p.line([[-2.6, y, Z0 + H - 2.4], [2.6, y, Z0 + H - 2.4]], SH.edge, 1.1);
    // the photo: a dark window with an empty lit silhouette inside
    const px0 = -W + 2.2, px1 = -0.6, pz0 = Z0 + 9, pz1 = Z0 + H - 5;
    p.clear([[px0, y, pz0], [px1, y, pz0], [px1, y, pz1], [px0, y, pz1]]);
    const cx = (px0 + px1) / 2;
    p.ringV("y", [cx, y + 0.01, pz0 + 7.2], 2.2, 0.26, 0);
    p.face(Array.from({ length: 17 }, (_, i) => { const q = (i / 16) * Math.PI; return [cx + Math.cos(q) * 3.3, y + 0.01, pz0 + Math.sin(q) * 3.6] as [number, number, number]; }), 0.26, 0);
    // the name and role, waiting to be filled in: cut lines
    p.line([[1.4, y, pz1 - 1.6], [W - 2, y, pz1 - 1.6]], SH.edge, 1.1);
    p.line([[1.4, y, pz1 - 4.6], [W - 4, y, pz1 - 4.6]], SH.edge, 0.7);
    p.line([[1.4, y, pz1 - 7.2], [W - 3, y, pz1 - 7.2]], SH.edge, 0.7);
    // a barcode strip along the bottom
    for (let i = 0; i < 11; i++) {
      const x = -W + 2.6 + i * 1.5;
      if (i % 4 === 3) continue;
      p.line([[x, y, Z0 + 2.4], [x, y, Z0 + 5.2]], SH.edge, 0.55);
    }
    p.pop();
  },
};
