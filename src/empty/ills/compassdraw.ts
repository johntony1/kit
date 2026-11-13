// Nothing drawn yet: a drawing compass in a bold upside down V, a knob on its hinge. It turns on its needle so the pencil leg draws a bright arc on the floor, then turns back and wipes it, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const PER = 4, X = 38, HZ = 38, S0 = -0.6, S1 = 0.6; // seconds per loop, leg spread, hinge height, swing

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/** a flat strip down a leg, standing in the compass plane facing us: from k0 to k1 along hinge → foot, half widths w0, w1 */
function strip(p: Pen, foot: number, k0: number, k1: number, w0: number, w1: number, fill: number) {
  const hx = X / 2, at = (k: number, w: number): V3 => {
    const x = hx + (foot - hx) * k, z = HZ * (1 - k), dx = foot - hx, l = Math.hypot(dx, HZ);
    return [x + (HZ / l) * w, 1.6, z + (dx / l) * w];
  };
  p.face([at(k0, -w0), at(k0, w0), at(k1, w1), at(k1, -w1)], fill, 0);
}

export const compassdraw: Illustration = {
  k: "compassdraw", name: "Drawing compass", title: "Nothing drawn yet", body: "Start a drawing and it will be saved here as you go.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    const k = u < 0.45 ? ease(u / 0.45) : u < 0.58 ? 1 : 1 - ease((u - 0.58) / 0.42);
    const s = S0 + (S1 - S0) * k;
    p.translate(-13.4, 13.4, -20); // the needle sits left of centre so the hinge is centred
    p.shadow(13.4, -13.4, 34, 12, 0.1);
    // the arc on the floor, from where the swing began to where the pencil is now
    if (k > 0.01) {
      const n = Math.ceil(k * 40);
      const pts = Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + S0 + ((s - S0) * i) / n; return p.pt([Math.cos(a) * X, Math.sin(a) * X, 0]); });
      p.screen((g) => {
        g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fff"; g.lineWidth = 1.7;
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      });
    }
    p.rotate("z", -Math.PI / 4 + s); // the compass plane, turned about the needle
    const needle = () => {
      strip(p, 0, 0.04, 0.88, 5, 2, 0.24);
      const [ax, ay] = p.pt([0.7, 1.6, HZ * 0.12]), [bx, by] = p.pt([0, 1.6, 0]);
      p.screen((g) => { g.lineCap = "round"; g.strokeStyle = "#fff"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); });
    };
    const pencil = () => {
      strip(p, X, 0.04, 0.5, 5, 3.6, 0.24); // the metal leg
      strip(p, X, 0.5, 0.6, 4.6, 4.6, 0.04); // the clamp
      strip(p, X, 0.6, 0.86, 3, 3, 0.3); // the pencil
      strip(p, X, 0.86, 1, 3, 0.6, 0.12); // its sharpened point
    };
    if (s > 0) { needle(); pencil(); } else { pencil(); needle(); }
    // the hinge and the knob on top
    p.box(X / 2 - 2, 0, HZ + 3, 4, 3.4, 7, { top: 0.3, left: 0.24, right: 0.1, edge: 0 });
    p.ringV("y", [X / 2, 1.8, HZ], 6.2, 0.02, 0);
    p.ringV("y", [X / 2, 1.85, HZ], 5, 0.3, 0);
    p.dot([X / 2, 1.9, HZ], 2, 0);
  },
};
