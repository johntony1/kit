// Ambulance: an ambulance with a cross on its side and two beacons on the roof. The beacons flash in turn, throwing short rays, and the wheels turn.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const WR = 3.1, Y = 5.8; // wheel radius, the near side

function wheel(p: Pen, x: number, a: number) {
  const y = Y + 0.5;
  p.ringV("y", [x, y, WR], WR, 0.1);
  p.ringV("y", [x, y + 0.02, WR], WR - 0.2, 0, SH.edge, 0.7);
  p.ringV("y", [x, y + 0.04, WR], 1.8, 0.28);
  for (let i = 0; i < 2; i++) { const u = a + (i * Math.PI) / 2; p.line([[x + Math.cos(u) * 1.7, y + 0.06, WR + Math.sin(u) * 1.7], [x - Math.cos(u) * 1.7, y + 0.06, WR - Math.sin(u) * 1.7]], SH.edge, 0.5); }
}
const arch = (p: Pen, x: number) => p.clear(Array.from({ length: 13 }, (_, i) => { const u = (Math.PI * i) / 12; return [x + Math.cos(u) * (WR + 0.8), Y + 0.03, WR + Math.sin(u) * (WR + 0.5)] as V3; }));
const rect = (x0: number, x1: number, z0: number, z1: number): V3[] => [[x0, Y + 0.03, z0], [x1, Y + 0.03, z0], [x1, Y + 0.03, z1], [x0, Y + 0.03, z1]];
const plus = (cx: number, y: number, cz: number, a: number, b: number): V3[] =>
  ([[-b, a], [b, a], [b, b], [a, b], [a, -b], [b, -b], [b, -a], [-b, -a], [-b, -b], [-a, -b], [-a, b], [-b, b]] as [number, number][]).map(([u, v]) => [cx + u, y, cz + v] as V3);

export const ambulance: Illustration = {
  k: "ambulance", name: "Ambulance", title: "No emergencies", body: "All clear. Any emergency calls will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2, on = (u * 2) % 1 < 0.5;
    p.translate(0.5, 0, -14);
    p.scale(1.16);
    p.shadow(0, 0, 30, 12, 0.12);
    p.push();
    p.translate(0, 0, 0.25 * Math.sin(w * 2));
    const ZB = 2.6, ZT = 19.4, ZK = 13.4; // floor, box roof, cab roof
    // the box body, then the lower cab in front of it
    p.box(-16, -Y, ZB, 21, 2 * Y, ZT - ZB, { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 });
    p.box(5, -Y, ZB, 10.5, 2 * Y, ZK - ZB, { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 });
    p.line([[-16, Y + 0.03, ZT], [5, Y + 0.03, ZT], [5.03, -Y, ZT]], SH.edge, 0.6);
    // the cab: windscreen, side window, headlights
    p.clear([[15.53, -Y + 0.9, 8.6], [15.53, Y - 0.9, 8.6], [15.53, Y - 0.9, 12.6], [15.53, -Y + 0.9, 12.6]]);
    p.clear(rect(6.6, 13.6, 8.6, 12.6));
    p.dot([15.55, Y - 1.5, 5.4], 0.95, 1); p.dot([15.55, -Y + 1.5, 5.4], 0.95, 1);
    // the side: a stripe and a bright cross on a dark disc
    p.line([[-16, Y + 0.04, 7], [15.5, Y + 0.04, 7]], SH.edge, 0.9);
    p.ringV("y", [-5.6, Y + 0.03, 13.2], 4.7, 0.03, SH.soft, 0.45);
    p.face(plus(-5.6, Y + 0.05, 13.2, 3.3, 1.15), 0.38, SH.edge, 0.5);
    arch(p, -9.5); arch(p, 9.6);
    wheel(p, -9.5, -w / 2); wheel(p, 9.6, -w / 2);
    // the beacons on the roof, flashing in turn
    const lamp = (xc: number, lit: boolean) => {
      const yc = -3.6;
      p.box(xc - 1.8, yc - 1.9, ZT, 3.6, 3.8, 2.8, lit ? { top: 1, left: 1, right: 0.7, lw: 0.5 } : { top: 0.14, left: 0.1, right: 0.06, lw: 0.5 });
      if (!lit) return;
      const [x, y] = p.pt([xc, yc, ZT + 2.2]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.1; g.lineCap = "round";
        for (const a of [-2.5, -1.95, -1.57, -1.2, -0.65]) { g.beginPath(); g.moveTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); g.lineTo(x + Math.cos(a) * 9.5, y + Math.sin(a) * 9.5); g.stroke(); }
      });
    };
    lamp(-10, !on); lamp(1.5, on);
    p.pop();
  },
};
