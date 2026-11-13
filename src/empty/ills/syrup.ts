// No medicine logged: a big bottle of cough syrup with a bright label and a dark cross, a dosing cup for a cap and a spoon lying in front. Hover and the cup lifts off and the spoon fills with syrup.
import { type Illustration, type V3 } from "../dots";

const W = 8, D = 5.5, HB = 21; // half width, half depth, body height
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const syrup: Illustration = {
  k: "syrup", name: "Cough syrup", title: "No medicine logged", body: "Log a dose and the time and amount will be kept here, so you never double up.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const lift = ease(cl(h / 0.5)), fill = ease(cl((h - 0.35) / 0.55));
    p.translate(-1, 0, -19);
    p.shadow(2, 2, 26, 12, 0.12);
    p.rotate("z", -0.6); // the label faces us
    // the body: a dark amber block, a bright label with a big dark cross
    p.box(-W, -D, 0, W * 2, D * 2, HB, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    const y = D + 0.05;
    p.face([[-W + 1.2, y, 3.5], [W - 1.2, y, 3.5], [W - 1.2, y, 17.5], [-W + 1.2, y, 17.5]], 0.32, 0);
    const c = 10.5, A = 1.6, B = 4.6;
    p.face([[-A, y + 0.03, c - B], [A, y + 0.03, c - B], [A, y + 0.03, c - A], [B, y + 0.03, c - A], [B, y + 0.03, c + A], [A, y + 0.03, c + A], [A, y + 0.03, c + B], [-A, y + 0.03, c + B], [-A, y + 0.03, c + A], [-B, y + 0.03, c + A], [-B, y + 0.03, c - A], [-A, y + 0.03, c - A]], 0.02, 0);
    // the shoulder: sloping up to the neck
    const Z = HB, N = 3.2, Zs = HB + 4;
    p.face([[-W, -D, Z], [W, -D, Z], [N, -N, Zs], [-N, -N, Zs]], 0.14, 0);
    p.face([[-W, D, Z], [W, D, Z], [N, N, Zs], [-N, N, Zs]], 0.24, 0);
    p.face([[W, -D, Z], [W, D, Z], [N, N, Zs], [N, -N, Zs]], 0.1, 0);
    p.line([[-W, D + 0.05, Z], [W, D + 0.05, Z], [W + 0.05, -D, Z]], 1, 1);
    p.cylinder(0, 0, Zs, N, 1.8, { side: 0.12, top: 0.2, edge: 0 });
    // the dosing cup over the neck: a big lit drum, a dark rim cut, lifting off on hover
    p.push();
    p.translate(0, 0, lift * 6);
    p.rotate("x", lift * 0.25, [0, 0, Zs + 1]);
    p.cylinder(0, 0, Zs + 0.6, 5.4, 7, { side: 0.26, top: 0.3, edge: 0 });
    const rim: V3[] = Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * 5.45, Math.sin(a) * 5.45, Zs + 1.1]; });
    p.line(rim, 1, 1);
    p.pop();
    // the spoon lying in front: a bright handle and a deep bowl that fills with dark syrup
    const sx = 8.5, sy = D + 6.5;
    p.box(sx - 15, sy - 1, 0, 11, 2, 1, { top: 0.32, left: 0.16, right: 0.08, edge: 0 });
    p.disc(sx, sy, 0, 4.4, 0.12, 0);
    p.disc(sx, sy, 1, 4.4, 0.34, 0);
    p.disc(sx, sy, 1.05, 3.2, 0.14, 0);
    if (fill > 0) p.disc(sx, sy, 1.1, 3.1 * fill, 0.02, 0);
  },
};
