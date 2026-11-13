// Nothing to light up: a camping lantern, a dark domed cap with a wire handle loop, a glass chamber with guard wires and a dark base. Hover and the flame catches and the glass glows bright.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// the visible half of a cone between two rings round the z axis
function cone(p: Pen, r0: number, z0: number, r1: number, z1: number, side: number) {
  const N = 40, pts: V3[] = [];
  for (let i = 0; i <= N / 2; i++) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([Math.cos(a) * r0, Math.sin(a) * r0, z0]); }
  for (let i = N / 2; i >= 0; i--) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([Math.cos(a) * r1, Math.sin(a) * r1, z1]); }
  p.face(pts, side, 0);
}

export const lantern: Illustration = {
  k: "lantern", name: "Lantern", title: "Nothing to light up", body: "There is nothing here yet. Add something and it will light up this space.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -18);
    p.shadow(0, 0, 22, 10, 0.12);
    const glow = ease(Math.min(1, h * 1.4)), fl = h * Math.sin(t * 9) * 0.04;
    // the base: wide and dark, a lit rim on top
    p.cylinder(0, 0, 0, 8.6, 5, { side: 0.065, top: 0.1, edge: 0 });
    p.cylinder(0, 0, 5, 7.6, 1.2, { side: 0.2, top: 0.1, edge: 0 });
    // the glass chamber: sparse when dark, a bright glow when lit
    p.cylinder(0, 0, 6.2, 7, 17, { side: glow > 0.02 ? 0.065 + glow * (0.4 + fl) : 0.065, top: 0.1, edge: 0 });
    // the flame inside, cut out of the glow as a dark outline, and the wick
    const fh = 2.5 + glow * 5;
    const flame: V3[] = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2, s = Math.sin(a), w = Math.cos(a) * 2.2 * (s < 0 ? 1 : 1 - s * 0.85);
      return [w * 0.577, -w * 0.577, 12 + (s < 0 ? s * 2.4 : s * fh)] as V3;
    });
    p.face(flame, glow > 0.02 ? 0.95 : 0.2, 0);
    p.line([...flame, flame[0]], 1, 0.8);
    // the guard wires down the glass, as dark cuts
    for (const a of [0.15, 1.45]) {
      const x = Math.cos(a + Math.PI / 4) * 7.05, y = Math.sin(a + Math.PI / 4) * 7.05;
      p.line([[x, y, 6.4], [x, y, 23]], 1, 0.55);
    }
    // the cap: a dark collar and a dome, a small lit knob on top
    p.cylinder(0, 0, 23.2, 8.6, 2.2, { side: 0.2, top: 0.065, edge: 0 });
    cone(p, 8, 25.4, 3, 29.4, 0.065);
    p.disc(0, 0, 29.4, 3, 0.1);
    p.cylinder(0, 0, 29.4, 1.8, 1.8, { side: 0.2, top: 0.3, edge: 0 });
    // the handle loop: a wire bail from the cap's sides, up over the knob
    const pts = Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI; return p.pt([Math.cos(a) * 9 * 0.707, -Math.cos(a) * 9 * 0.707, 24.3 + Math.sin(a) * 13.5]); });
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.7; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    });
  },
};
