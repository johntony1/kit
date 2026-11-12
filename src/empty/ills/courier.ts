// No couriers nearby: a delivery scooter seen side on, a box on the back. It rides on the spot: the wheels turn, the body bobs and speed lines trail behind.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 2.4; // seconds per loop
const R = 6, D = 2.4; // wheel radius, half depth of the body
const RX = -11.5, FX = 14; // where the wheels are
const at = (pts: P2[], y: number): V3[] => pts.map(([x, z]) => [x, y, z]);
const circle = (cx: number, cz: number, r: number, y: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
// the body in one piece: the cowl over the rear wheel, the low foot board, the leg shield rising to the bars
const BODY: P2[] = [[-19.5, 10], [-19.5, 15.5], [-16.5, 18.5], [-3.5, 18.5], [-0.5, 9.8], [6.4, 9.8], [9.8, 24.5], [13.4, 24.5], [12.8, 12], [10.4, 6.4], [-2.5, 6.4], [-4.5, 10]];

// a wheel: a bright tyre round a dark hub, two notches in the tyre so it is seen to turn
function wheel(p: Pen, cx: number, spin: number) {
  p.face(circle(cx, R, R, D + 0.06), 0.3, 0);
  p.clear(circle(cx, R, R * 0.42, D + 0.08));
  p.dot([cx, D + 0.1, R], 0.9, 1);
  for (const o of [0, Math.PI]) p.dot([cx + Math.cos(spin + o) * R * 0.72, D + 0.1, R + Math.sin(spin + o) * R * 0.72], 0.8, 0);
}

function streak(p: Pen, a: V3, b: V3, alpha: number) {
  const [x0, y0] = p.pt(a), [x1, y1] = p.pt(b);
  p.screen((g) => { g.strokeStyle = `rgba(255,255,255,${alpha})`; g.lineWidth = 1.3; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
}

export const courier: Illustration = {
  k: "courier", name: "Courier scooter", title: "No couriers nearby", body: "We will show riders here as soon as one is close to you.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const side = p.ink ? 0.065 : 0.045;
    const spin = -u * Math.PI * 4, bob = 0.5 * Math.sin(u * Math.PI * 4);
    p.translate(0, 0, -16);
    p.shadow(0, 0, 29, 10, 0.12);
    p.rotate("z", -0.45); // turned so its side faces us
    p.translate(2.5, 0, 0);
    p.push();
    p.translate(0, 0, bob);
    // the body: its depth, then the lit side
    const step = p.ink ? D * 2 : 0.4;
    for (let y = -D; y < D - 0.05; y += step) p.face(at(BODY, y), side, 0);
    p.face(at(BODY, D), 0.2, 0);
        // the seat, and the bars across the top of the shield
    p.box(-13, -D, 18.5, 10, D * 2, 2.2, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.line([[-13, D + 0.03, 18.5], [-3, D + 0.03, 18.5]], SH.edge, 0.9);
    p.box(9.4, -5.6, 24.5, 3, 11.2, 2, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.line([[9.4, 5.63, 24.5], [12.4, 5.63, 24.5]], SH.edge, 0.8);
    // the delivery box on the back: bright, a lid seam cut round it and a dark label
    p.box(-23, -4.6, 20.7, 10, 9.2, 9.6, { top: 0.3, left: 0.22, right: 0.065, edge: 0 });
    p.line([[-23, 4.63, 27.9], [-13, 4.63, 27.9], [-12.97, -4.6, 27.9]], SH.edge, 0.8);
    p.clear([[-20, 4.64, 22.7], [-16, 4.64, 22.7], [-16, 4.64, 25.7], [-20, 4.64, 25.7]]);
    p.pop();
    // the wheels in front, each in a dark arch cut out of the body
    for (const cx of [RX, FX]) {
      p.clear(circle(cx, R, R + 1, D + 0.04));
      wheel(p, cx, spin);
    }
    // speed lines trailing behind
    for (let i = 0; i < 3; i++) {
      const v = (u * 2 + i / 3) % 1, x = -26 - v * 5, z = 4 + i * 6;
      streak(p, [x, 0, z], [x - 4.5, 0, z], Math.sin(v * Math.PI));
    }
  },
};
