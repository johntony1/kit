// No versions yet: three copies of a page standing one behind the other, a restore arrow on the front one. Hover and the copies spread apart and the arrow winds back.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 10, H = 25, T = 0.5;
const cl = (x: number) => Math.max(0, Math.min(1, x));

function card(p: Pen, fill: number) {
  p.box(-W, -T, 0, W * 2, T * 2, H, { top: 0.2, left: fill, right: 0.065 });
  p.dot([W - 2.6, T + 0.03, H - 2.6], 0.9, 1); // its version mark
}

export const versions: Illustration = {
  k: "versions", name: "Version history", title: "No versions yet", body: "Each time you save, a version is kept here so you can go back to it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = easeInOut(cl(h / 0.7));
    p.translate(-4, 0, -15);
    p.shadow(4, 0, 27, 12, 0.11);
    p.rotate("z", -0.42);
    for (const i of [2, 1]) {
      p.push();
      p.translate(i * (3.4 + k * 2.6), -i * (3.6 + k * 2.4), i * (2.8 + k * 1.6));
      card(p, i === 2 ? 0.09 : 0.14);
      p.pop();
    }
    card(p, 0.22);
    const fy = T + 0.03;
    p.line([[-7, fy, 21.4], [0, fy, 21.4]], SH.edge, 0.9);
    p.line([[-7, fy, 18.6], [4, fy, 18.6]], SH.edge, 0.6);
    // the restore mark: an open ring with an arrowhead, and a pair of clock hands inside
    const cz = 9, r = 5.2, turn = -k * Math.PI * 2;
    const at = (a: number, q = r): V3 => [Math.cos(a) * q, fy, cz + Math.sin(a) * q];
    const a0 = Math.PI * 0.86 + turn * 0.25, a1 = a0 - Math.PI * 1.62;
    p.line(Array.from({ length: 25 }, (_, i) => at(a0 + ((a1 - a0) * i) / 24)), SH.edge, 0.95);
    const tip = at(a0), back = a0 - 0.5;
    p.line([at(back, r + 1.9), tip, at(back, r - 1.9)], SH.edge, 0.95);
    p.line([at(Math.PI / 2 + turn, 3.1), [0, fy, cz], at(turn * (1 / 12) - 0.3, 2.3)], SH.edge, 0.8);
  },
};
