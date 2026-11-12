// No rides booked: a chunky taxi seen from its side, a chequered band on the door and a sign on the roof. Hover and it pulls forward with a bounce and the roof sign lights up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const Y = 7.5, B0 = 3, B1 = 13.5, R1 = 22, WR = 4; // half width, underside, shoulder line, roof, wheel radius
const CABIN: P2[] = [[-11.5, B1], [-8, R1], [4.5, R1], [9.5, B1]];
const circle = (x: number, y: number, z: number, r: number): V3[] => Array.from({ length: 28 }, (_, i) => [x + Math.cos((i / 28) * Math.PI * 2) * r, y, z + Math.sin((i / 28) * Math.PI * 2) * r] as V3);

// a wheel in its dark arch: a bright tyre, a dark hub, a spoke that turns
function wheel(p: Pen, x: number, y: number, spin: number) {
  p.clear(circle(x, y, WR, WR + 1.2));
  p.face(circle(x, y + 0.02, WR, WR), 0.3, 0);
  p.dot([x, y + 0.05, WR], 1.5, 0);
  p.line([[x - Math.cos(spin) * 3, y + 0.08, WR - Math.sin(spin) * 3], [x + Math.cos(spin) * 3, y + 0.08, WR + Math.sin(spin) * 3]], SH.edge, 0.6);
}

export const taxi: Illustration = {
  k: "taxi", name: "Taxi", title: "No rides booked", body: "Book a ride and it will show here with your driver and pickup time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 32, 13, 0.12);
    p.rotate("z", -0.42);
    const go = 3 * ease(h), spin = go / WR + h * t * 3;
    p.translate(go - 1.5, 0, 0);
    p.push();
    p.translate(0, 0, h * Math.abs(Math.sin(t * 5)) * 0.7);
    // the body
    p.box(-17.5, -Y, B0, 35, Y * 2, B1 - B0, { top: 0.3, left: 0.22, right: 0.065, edge: 0 });
    const y = Y + 0.03;
    p.line([[-17.5, y, B1], [17.5, y, B1], [17.53, -Y, B1]], SH.edge, 0.8);
    p.line([[17.5, y, B0], [17.5, y, B1]], SH.edge, 0.6);
    // the chequered band on the door, between the wheels
    for (let i = 0; i < 4; i++) {
      const x = -5.6 + i * 2.8, z = i % 2 ? 9.6 : 7;
      p.clear([[x, y, z], [x + 2.8, y, z], [x + 2.8, y, z + 2.6], [x, y, z + 2.6]]);
    }
    p.dot([17.55, 4.6, 9.5], 1.4, 0); p.dot([17.55, -4.6, 9.5], 1.4, 0); // the lamps
    // the cabin: slanted glass front and back, a lit roof
    const yc = Y - 0.9;
    const wall = (a: P2, b: P2, f: number) => p.face([[a[0], -yc, a[1]], [b[0], -yc, b[1]], [b[0], yc, b[1]], [a[0], yc, a[1]]], f, 0);
    wall(CABIN[0], CABIN[1], 0.2);
    wall(CABIN[2], CABIN[3], 0.1);
    wall(CABIN[1], CABIN[2], 0.3);
    const side = CABIN.map(([x, z]) => [x, yc, z] as V3);
    p.face(side, 0.22, 0);
    p.line([...side, side[0]], SH.edge, 0.7);
    p.line([[CABIN[2][0], yc, R1], [CABIN[2][0], -yc, R1]], SH.edge, 0.6);
    // two side windows with a pillar between them, and the windscreen
    const yw = yc + 0.03, W0 = B1 + 2, W1 = R1 - 2.2;
    p.clear([[-7.8, yw, W0], [-6, yw, W1], [-2.8, yw, W1], [-2.8, yw, W0]]);
    p.clear([[0.2, yw, W0], [0.2, yw, W1], [3, yw, W1], [5.6, yw, W0]]);
    const ws = (k: number, yy: number): V3 => [CABIN[2][0] + 5 * k + 0.05, yy, R1 - 8.5 * k];
    p.clear([ws(0.16, -yc + 1.4), ws(0.16, yc - 1.4), ws(0.82, yc - 1.4), ws(0.82, -yc + 1.4)]);
    // the roof sign
    const S = R1 + 4.2;
    p.box(-5, -3.6, R1, 6.4, 7.2, 4.2, { top: 0.3, left: 0.3, right: 0.16, edge: 0 });
    p.line([[-5, 3.63, R1], [1.4, 3.63, R1], [1.43, -3.6, R1]], SH.edge, 0.8);
    p.line([[-5, 3.63, S], [1.4, 3.63, S], [1.43, -3.6, S]], SH.edge, 0.5);
    p.line([[1.4, 3.63, R1], [1.4, 3.63, S]], SH.edge, 0.5);
    // it lights up: three rays over the sign
    const l = Math.max(0, (h - 0.45) / 0.55) * (0.75 + 0.25 * Math.sin(t * 7));
    if (l > 0.02) {
      const [cx, cy] = p.pt([-1.8, 0, S - 1]);
      p.screen((g) => {
        g.strokeStyle = `rgba(255,255,255,${l})`; g.lineWidth = 1.3; g.lineCap = "round";
        for (const a of [-2.2, -1.57, -0.94]) { g.beginPath(); g.moveTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 6.5); g.lineTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 9.5); g.stroke(); }
      });
    }
    p.pop();
    wheel(p, -10.5, Y + 0.05, spin); wheel(p, 10.5, Y + 0.05, spin);
  },
};
