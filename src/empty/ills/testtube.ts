// No experiments yet: one big test tube on a diagonal, half full of bright liquid. Bubbles rise through the liquid and pop at the surface, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
const L = 46, R = 9, LIQ = 22; // tube length from the bottom of the round end, radius, how high the liquid stands
const TILT = 0.55; // lean from upright, radians

export const testtube: Illustration = {
  k: "testtube", name: "Test tube", title: "No experiments yet", body: "Start your first experiment and its results will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 26, 10, 0.12);
    p.rotate("z", -Math.PI / 4); // x now runs straight across the screen, z straight up: a flat drawing plane
    const k = 1 / 1.2247, c = Math.cos(TILT), s = Math.sin(TILT);
    // a point in the tube's frame: a along the axis from the bottom, b across it
    const T = (a: number, b: number, y = 0): V3 => [(-12 + a * s + b * c) * k, y, -14 + a * c - b * s];
    // the outline of the tube up to height a: one straight side, the round bottom, the other side
    const shape = (a: number, inset: number): V3[] => {
      const r = R - inset;
      return [T(a, r), ...Array.from({ length: 21 }, (_, i) => { const f = (i / 20) * Math.PI; return T(R - Math.sin(f) * r, Math.cos(f) * r); }), T(a, -r)];
    };
    // the glass: nearly dark, so it reads as clear, with a bright rim
    p.face(shape(L, 0), 0.04, 0);
    // the liquid: bright, with a lit surface across the tube
    const lv = LIQ + 0.6 * Math.sin(u * Math.PI * 2);
    p.face(shape(lv, 1.3), 0.5, 0);
    p.face(Array.from({ length: 24 }, (_, i) => { const f = (i / 24) * Math.PI * 2; return T(lv + Math.sin(f) * 1.6, Math.cos(f) * (R - 1.3), 0.1); }), 0.8, 0);
    // bubbles: dark beads rising through the liquid, growing as they go, gone at the surface
    for (let j = 0; j < 5; j++) {
      const v = (u + j / 5) % 1, a = R * 0.6 + v * (lv - R * 0.6 - 1.5);
      const b = Math.sin(j * 2.7 + v * 6) * 2.6;
      p.dot(T(a, b, 0.2), 0.9 + v * 0.9, 0);
    }
    // the rim of the glass and the lip at the top
    const rim = shape(L, 0).map((v) => p.pt(v));
    const [l0, l1] = [p.pt(T(L, -R - 1.4)), p.pt(T(L, R + 1.4))], [m0, m1] = [p.pt(T(L - 2, -R - 1.4)), p.pt(T(L - 2, R + 1.4))];
    const shine = [p.pt(T(lv + 3, R - 2.6)), p.pt(T(L - 5, R - 2.6))];
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      g.strokeStyle = "#fff"; g.lineWidth = 1.6;
      g.beginPath(); rim.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      g.lineWidth = 1.2; g.beginPath(); g.moveTo(shine[0][0], shine[0][1]); g.lineTo(shine[1][0], shine[1][1]); g.stroke();
      g.fillStyle = "rgb(150,150,150)"; g.beginPath(); g.moveTo(l0[0], l0[1]); g.lineTo(l1[0], l1[1]); g.lineTo(m1[0], m1[1]); g.lineTo(m0[0], m0[1]); g.closePath(); g.fill();
      g.lineWidth = 1.4; g.stroke();
    });
  },
};
