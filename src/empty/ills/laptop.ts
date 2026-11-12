// Laptop: an open laptop with a dark screen. Hover and the lid leans back and a window pops open on the screen.
import { SH, type Illustration, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const X = 16, Y = 10.5, B = 1.8, D = 21, T = 1.1; // base half width, half depth, height; lid depth, thickness

export const laptop: Illustration = {
  k: "laptop", name: "Laptop", title: "Nothing open yet", body: "Open a file or start something new and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.5));
    p.translate(2, 2, -10);
    p.shadow(0, 2, 30, 14, 0.12);
    p.rotate("z", -0.34);
    // the base, with its keys in a dark well and a trackpad cut in front
    p.box(-X, -Y, 0, 2 * X, 2 * Y, B, { top: 0.22, left: 0.13, right: 0.065 });
    const z = B + 0.02;
    p.face([[-X + 2, -Y + 2.6, z], [X - 2, -Y + 2.6, z], [X - 2, 2.6, z], [-X + 2, 2.6, z]], 0.03, SH.edge, 0.5);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
      const x0 = -X + 2.9 + c * 2.96, y0 = -Y + 3.4 + r * 3;
      p.face([[x0, y0, z + 0.02], [x0 + 2.1, y0, z + 0.02], [x0 + 2.1, y0 + 2.1, z + 0.02], [x0, y0 + 2.1, z + 0.02]], 0.2, 0);
    }
    p.line([[-4.5, 4.6, z], [4.5, 4.6, z], [4.5, 8.8, z], [-4.5, 8.8, z], [-4.5, 4.6, z]], SH.edge, 0.5);
    // the lid, hinged along the back edge
    p.push();
    p.rotate("x", 1.6 + 0.26 * k + h * Math.sin(t * 2) * 0.012, [0, -Y, B]);
    const q = (x: number, y: number, zz: number): V3 => [x, -Y + y, B + zz];
    p.face([q(X, 0, 0), q(X, D, 0), q(X, D, T), q(X, 0, T)], 0.065, SH.edge, 0.5);
    p.face([q(-X, D, 0), q(X, D, 0), q(X, D, T), q(-X, D, T)], 0.26, SH.edge, 0.5);
    p.face([q(-X, 0, 0), q(X, 0, 0), q(X, D, 0), q(-X, D, 0)], 0.2, SH.edge, 0.6);
    p.clear([q(-X + 1.5, 1.8, -0.03), q(X - 1.5, 1.8, -0.03), q(X - 1.5, D - 1.5, -0.03), q(-X + 1.5, D - 1.5, -0.03)]);
    // a window pops open on the screen: a lit pane with a title bar and two lines
    const a = ease(cl((h - 0.3) / 0.45));
    if (a > 0.03) {
      const cx = -1, cy = 10.6, w = 10.5 * a, hh = 6.4 * a;
      p.face([q(cx - w, cy - hh, -0.06), q(cx + w, cy - hh, -0.06), q(cx + w, cy + hh, -0.06), q(cx - w, cy + hh, -0.06)], 0.34, SH.edge, 0.6);
      if (a > 0.8) {
        p.line([q(cx - w, cy + hh - 2.6, -0.09), q(cx + w, cy + hh - 2.6, -0.09)], SH.edge, 0.6);
        p.dot(q(cx - w + 1.5, cy + hh - 1.3, -0.09), 0.5, 0);
        p.line([q(cx - w + 2, cy + 0.6, -0.09), q(cx + w - 5, cy + 0.6, -0.09)], SH.edge, 0.8);
        p.line([q(cx - w + 2, cy - 2.6, -0.09), q(cx + w - 9, cy - 2.6, -0.09)], SH.edge, 0.8);
      }
    }
    p.pop();
  },
};
