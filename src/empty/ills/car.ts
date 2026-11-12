// Car: a small car seen from the front corner, round headlights and a dark windscreen. Hover and it rolls toward us with a bounce and its headlights come on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HW = 8, F = 15, B = -15, Z0 = 3, Z1 = 10.5, R = 18; // half width, nose, tail, sill, bonnet line, roof
const circle = (x: number, y: number, z: number, r: number): V3[] => Array.from({ length: 28 }, (_, i) => [x, y + Math.cos((i / 28) * Math.PI * 2) * r, z + Math.sin((i / 28) * Math.PI * 2) * r] as V3);

// a wheel on the side that faces right: a dark arch, a bright tyre, a dark hub, a spoke that turns
function wheel(p: Pen, y: number, spin: number) {
  p.clear(circle(HW + 0.02, y, 4, 5.1));
  p.face(circle(HW + 0.04, y, 4, 4), 0.3, 0);
  p.dot([HW + 0.06, y, 4], 1.5, 0);
  p.line([[HW + 0.08, y - Math.cos(spin) * 3, 4 - Math.sin(spin) * 3], [HW + 0.08, y + Math.cos(spin) * 3, 4 + Math.sin(spin) * 3]], SH.edge, 0.6);
}

export const car: Illustration = {
  k: "car", name: "Car", title: "No drives yet", body: "Your trips will be logged here once you take the first one.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const go = 4 * ease(Math.min(1, h / 0.7)), lit = Math.max(0, (h - 0.55) / 0.45);
    p.translate(0, 0, -11);
    p.shadow(0, -1, 34, 15, 0.12);
    p.scale(1.08);
    p.translate(0, go - 5, 0);
    // the beams on the road ahead
    if (lit > 0.03) {
      const fl = lit * (0.85 + 0.15 * Math.sin(t * 5));
      for (const x of [-5.2, 5.2]) {
        const q = ([[x - 1.4, F + 1.2, 0], [x + 1.4, F + 1.2, 0], [x + 4.4, F + 15, 0], [x - 4.4, F + 15, 0]] as V3[]).map((v) => p.pt(v));
        p.screen((g) => {
          const n = Math.round(150 * fl);
          g.fillStyle = `rgb(${n},${n},${n})`;
          g.beginPath(); q.forEach(([sx, sy], i) => (i ? g.lineTo(sx, sy) : g.moveTo(sx, sy))); g.closePath(); g.fill();
        });
      }
    }
    p.push();
    p.translate(0, 0, h * Math.abs(Math.sin(t * 5)) * 0.6);
    // the body
    p.box(-HW, B, Z0, HW * 2, F - B, Z1 - Z0, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    p.line([[-HW, F + 0.03, Z1], [HW, F + 0.03, Z1], [HW + 0.03, B, Z1]], SH.edge, 0.7);
    p.line([[HW, F + 0.03, Z0], [HW, F + 0.03, Z1]], SH.edge, 0.5);
    // the cabin: its side with two windows, the roof, the slanted windscreen
    const cw = HW - 1, side: V3[] = [[cw, B + 2, Z1], [cw, B + 5.5, R], [cw, 3, R], [cw, 8, Z1]];
    p.face(side, 0.1, 0);
    p.clear([[cw + 0.03, B + 4.6, Z1 + 1.2], [cw + 0.03, B + 7, R - 1.4], [cw + 0.03, -4.2, R - 1.4], [cw + 0.03, -4.2, Z1 + 1.2]]);
    p.clear([[cw + 0.03, -2.6, Z1 + 1.2], [cw + 0.03, -2.6, R - 1.4], [cw + 0.03, 2.2, R - 1.4], [cw + 0.03, 5.8, Z1 + 1.2]]);
    p.face([[-cw, B + 5.5, R], [cw, B + 5.5, R], [cw, 3, R], [-cw, 3, R]], 0.3, SH.edge, 0.6);
    p.face([[-cw, 3, R], [cw, 3, R], [cw, 8, Z1], [-cw, 8, Z1]], 0.2, SH.edge, 0.6);
    const ws = (x: number, k: number): V3 => [x, 3 + 5 * k + 0.04, R - (R - Z1) * k + 0.03];
    p.clear([ws(-cw + 1.2, 0.14), ws(cw - 1.2, 0.14), ws(cw - 1.2, 0.86), ws(-cw + 1.2, 0.86)]);
    // the face: a bumper, a grille, two round headlights
    const fy = F + 0.03;
    p.box(-HW - 0.5, F, Z0 - 0.4, HW * 2 + 1, 1.2, 2, { top: 0.3, left: 0.3, right: 0.12, edge: 0 });
    p.clear([[-2.4, fy, 6.2], [2.4, fy, 6.2], [2.4, fy, 8.4], [-2.4, fy, 8.4]]);
    for (const x of [-5.2, 5.2]) {
      p.ringV("y", [x, fy, 7.4], 2, 0.03, 0);
      p.ringV("y", [x, fy + 0.02, 7.4], lit > 0.03 ? 1.9 : 1.2, lit > 0.03 ? 1 : 0.3, 0);
    }
    p.pop();
    const spin = (go / 4) + h * t * 3;
    wheel(p, B + 6.5, spin); wheel(p, F - 6, spin);
  },
};
