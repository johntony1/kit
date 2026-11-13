// Nothing opened yet: a sealed envelope lying flat. Hover and the flap swings open, the letter rises out of it and a tick badge pops in.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const W = 16, D = 10.5, TH = 2.6; // half width, half depth, thickness
const S = -7.8; // where the letter stands, just inside the back edge

export const emailopen: Illustration = {
  k: "emailopen", name: "Opened email", title: "Nothing opened yet", body: "When people open the emails you send, you will see it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 14, 0.12);
    p.push();
    p.rotate("z", -0.42);
    p.rotate("x", -0.5, [0, D, 0]); // leaning back so its face looks at us
    const a = ease(cl(h / 0.45)) * 2.55; // the flap's swing
    const rise = ease(cl((h - 0.38) / 0.42)) * 11;
    const fl = (x: number, y: number): V3 => { const r = y + D; return [x, -D + r * Math.cos(a), TH + r * Math.sin(a)]; };
    const flap = () => {
      const pts = [fl(-W, -D), fl(W, -D), fl(0, 3.5)];
      p.face(pts, a > Math.PI / 2 ? 0.09 : 0.26, 0);
      p.line([pts[0], pts[2], pts[1]], 1, 0.8);
    };
    // the body: sides, then the strip behind the letter
    p.face([[-W, D, 0], [W, D, 0], [W, D, TH], [-W, D, TH]], 0.12, 0);
    p.face([[W, -D, 0], [W, D, 0], [W, D, TH], [W, -D, TH]], 0.065, 0);
    if (a > Math.PI / 2) flap();
    p.face([[-W, -D, TH], [W, -D, TH], [W, S, TH], [-W, S, TH]], a > 0.05 ? 0.03 : 0.2, 0);
    // the letter, rising out of the slot
    if (rise > 0.2) {
      const L = 12.5, z1 = TH + rise;
      p.box(-L, S - 0.4, TH - 1, L * 2, 0.8, z1 - TH + 1, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
      for (let i = 0; i < 3; i++) {
        const z = z1 - 3 - i * 2.4;
        if (z > TH + 0.6) p.line([[-L + 3, S + 0.45, z], [L - 3 - (i === 2 ? 9 : 0), S + 0.45, z]], 1, 0.7);
      }
    }
    // the front of the envelope, its folds meeting in the middle
    p.face([[-W, S, TH], [W, S, TH], [W, D, TH], [-W, D, TH]], 0.2, 0);
    p.line([[-W + 0.3, D - 0.3, TH + 0.02], [0, -1, TH + 0.02], [W - 0.3, D - 0.3, TH + 0.02]], 1, 0.8);
    p.line([[-W, D, TH], [W, D, TH], [W, -D, TH]], 1, 0.5);
    if (a <= Math.PI / 2) flap();
    p.pop();
    // the tick badge pops in once the letter is out, flat to the screen
    const b = cl((h - 0.72) / 0.28);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const r = 4.6 * pop, c: V3 = [-9.5, -12.5, 14];
      const at = (u: number, v: number): V3 => [c[0] + u * 0.577, c[1] - u * 0.577, c[2] + v];
      const ring = (rr: number): V3[] => Array.from({ length: 28 }, (_, i) => { const s = (i / 28) * Math.PI * 2; return at(Math.cos(s) * rr, Math.sin(s) * rr); });
      p.face(ring(r + 0.7), 0.03, 0);
      p.face(ring(r), 0.45, 0);
      p.line([at(-r * 0.45, 0), at(-r * 0.1, -r * 0.35), at(r * 0.45, r * 0.35)], 0, Math.max(0.5, r * 0.22));
    }
  },
};
