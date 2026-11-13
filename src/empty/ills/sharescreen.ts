// Nobody is sharing: an open laptop, its dark screen showing the share mark. Over and over an arrow rises out of the box on the screen and fades, as if waiting to share.
import { easeInOut, type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop

export const sharescreen: Illustration = {
  k: "sharescreen", name: "Screen share", title: "Nobody is sharing", body: "When someone shares their screen, you will see it here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) + 0.45) % 1;
    p.translate(0, 0, -12);
    p.shadow(0, 2, 30, 14, 0.12);
    p.rotate("z", -0.42);
    const W = 16, D = 11;
    // the base, with a dark keyboard well and a trackpad cut into its lit top
    p.box(-W, -D, 0, W * 2, D * 2, 2.2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    const Z = 2.22;
    p.clear([[-W + 2.5, -D + 2, Z], [W - 2.5, -D + 2, Z], [W - 2.5, 1, Z], [-W + 2.5, 1, Z]]);
    p.line([[-5, 3.5, Z], [5, 3.5, Z], [5, 9, Z], [-5, 9, Z], [-5, 3.5, Z]], 1, 0.7);
    // the lid, tipped back a little from the hinge
    p.push();
    p.rotate("x", 0.16, [0, -D, 2]);
    p.box(-W, -D - 1.4, 2, W * 2, 1.4, 22, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    const y = -D + 0.03;
    const S: V3[] = [[-W + 1.8, y, 3.8], [W - 1.8, y, 3.8], [W - 1.8, y, 22.2], [-W + 1.8, y, 22.2]];
    p.face(S, 0.03, 0);
    // the share mark: a box open at the top, an arrow rising out of it
    const pt = (x: number, z: number) => p.pt([x, y + 0.02, z]);
    const rise = easeInOut(Math.min(1, u / 0.7)), fade = u < 0.55 ? 1 : Math.max(0, 1 - (u - 0.55) / 0.3);
    const box = [pt(-3.4, 15.5), pt(-6.5, 15.5), pt(-6.5, 7.5), pt(6.5, 7.5), pt(6.5, 15.5), pt(3.4, 15.5)];
    const z0 = 9.5 + rise * 7.5;
    const a = pt(0, z0), b = pt(0, z0 + 7), l = pt(-3, z0 + 4), r = pt(3, z0 + 4);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 1.8;
      g.beginPath(); box.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z))); g.stroke();
      g.globalAlpha = fade;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(l[0], l[1]); g.lineTo(b[0], b[1]); g.lineTo(r[0], r[1]); g.stroke();
    });
    p.pop();
  },
};
