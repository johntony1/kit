// Nobody has rung: a video doorbell, a tall rounded plate with a lens at the top and a big round button. Hover and the button presses in, its ring lights and sound waves ripple out from both sides.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const rrect = (a0: number, v0: number, a1: number, v1: number, r: number): Q => {
  const out: Q = [];
  const cs: [number, number, number][] = [[a1 - r, v1 - r, 0], [a0 + r, v1 - r, 1], [a0 + r, v0 + r, 2], [a1 - r, v0 + r, 3]];
  for (const [x, y, q] of cs) for (let i = 0; i <= 6; i++) { const s = ((q + i / 6) * Math.PI) / 2; out.push([x + Math.cos(s) * r, y + Math.sin(s) * r]); }
  return out;
};
const circ = (ca: number, cv: number, r: number, n = 32): Q => Array.from({ length: n }, (_, i) => { const s = (i / n) * Math.PI * 2; return [ca + Math.cos(s) * r, cv + Math.sin(s) * r]; });
const PLATE = rrect(-8, 0, 8, 30, 5);
const BV = 10.5; // the button's height on the plate

export const doorbell: Illustration = {
  k: "doorbell", name: "Doorbell", title: "Nobody has rung", body: "When someone rings at your door, you will see the visit here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 18, 8, 0.12);
    p.rotate("z", -0.62);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v] as V3);
    // the plate: its depth, then the lit face
    for (let y = -4; y < 0; y += 0.5) p.face(put(PLATE, y), 0.065, 0);
    p.face(put(PLATE, 0), 0.065, 0);
    p.line([...put(PLATE, 0.02), put(PLATE, 0.02)[0]], 1, 0.6);
    // the lens: a dark round window with a bright rim and a glint
    p.face(put(circ(0, 23, 4), 0.05), 0.3, 0);
    p.face(put(circ(0, 23, 2.8), 0.1), 0.03, 0);
    p.dot([-0.9, 0.15, 23.9], 0.7, 1);
    // a short speaker slot under the lens
    p.face(put(rrect(-3.5, 16.8, 3.5, 18.2, 0.7), 0.05), 0.3, 0);
    // the button: a dark well, then the button standing out of it, pressed in on hover
    const press = h < 0.35 ? Math.sin((h / 0.35) * Math.PI / 2) : h < 0.6 ? 1 - (h - 0.35) / 0.25 * 0.6 : 0.4;
    p.face(put(circ(0, BV, 6.6), 0.05), 0.3, 0);
    p.face(put(circ(0, BV, 5.8), 0.07), 0.03, 0);
    const out = 1.8 * (1 - press);
    for (let y = 0.1; y < out; y += 0.4) p.face(put(circ(0, BV, 5), y), 0.14, 0);
    p.face(put(circ(0, BV, 5), out + 0.1), 0.45, 0);
    // the ring lights once it is pressed, and sound waves ripple out
    const lit = Math.min(1, Math.max(0, (h - 0.3) / 0.2));
    if (lit > 0) {
      const ring = put(circ(0, BV, 5.45, 40), 0.15).map((v) => p.pt(v));
      const arc = (side: number, r: number): [number, number][] =>
        Array.from({ length: 9 }, (_, i) => { const s = -0.6 + (i / 8) * 1.2; return p.pt([side * (Math.cos(s) * r), 0, BV + Math.sin(s) * r]); });
      const w1 = Math.min(1, Math.max(0, (h - 0.45) / 0.25)), w2 = Math.min(1, Math.max(0, (h - 0.65) / 0.25));
      const glow = 0.75 + 0.25 * h * Math.sin(t * 6);
      p.screen((g) => {
        g.lineCap = "round"; g.lineJoin = "round";
        g.strokeStyle = `rgba(255,255,255,${lit * glow})`; g.lineWidth = 1.3;
        g.beginPath(); ring.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
        g.lineWidth = 1.5;
        for (const side of [-1, 1]) for (const [r, w] of [[11, w1], [14, w2]] as [number, number][]) {
          if (w <= 0) continue;
          g.strokeStyle = `rgba(255,255,255,${w})`;
          g.beginPath(); arc(side, r).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        }
      });
    }
  },
};
