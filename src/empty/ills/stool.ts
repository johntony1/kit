// Take a seat: a tall bar stool, a thick round seat on four splayed legs joined by a foot ring. Hover and a plump cushion drops onto the seat, squashes and settles.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ZS = 30, RS = 10, TS = 3.2; // seat height, seat radius, seat thickness
const RT = 5.6, RB = 13, ZR = 10; // leg spread at the top and at the floor, foot ring height
const ring = (r: number, z: number, n = 44): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

// height above the seat: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 9;
  if (k < 0.45) return 9 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 2 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 0.6 * 4 * v * (1 - v); }
  return 0;
}

// a splayed leg at angle a: a bar from under the seat out to the floor, a bright stroke flat to the screen, thinner when further back
function leg(p: Pen, a: number, w: number) {
  const c = Math.cos(a), s = Math.sin(a);
  const [x0, y0] = p.pt([c * RT, s * RT, ZS]), [x1, y1] = p.pt([c * RB, s * RB, 0]);
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round";
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  });
}
// the foot ring as a bright stroke, only the part on one side (front or back)
function footRing(p: Pen, front: boolean) {
  const r = RT + (RB - RT) * (1 - ZR / ZS);
  const pts = ring(r, ZR, 60).filter(([x, y]) => (x + y > 0) === front).map((v) => p.pt(v));
  pts.sort((m, n) => m[0] - n[0]);
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}

export const stool: Illustration = {
  k: "stool", name: "Stool", title: "Take a seat", body: "Save a spot and it will be held for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -22);
    p.shadow(0, 0, 24, 11, 0.12);
    const Q = Math.PI / 4 + 0.42, R = Math.PI / 2;
    // the back leg, the far half of the ring, then the side and front legs
    leg(p, Q + R * 2, 1.4);
    footRing(p, false);
    leg(p, Q - R, 1.7);
    leg(p, Q + R, 2);
    footRing(p, true);
    leg(p, Q, 2.2);
    // the seat: a thick round top, its rim dense, its top lit, a stitched ring cut into it
    p.cylinder(0, 0, ZS, RS, TS, { side: 0.12, top: 0.24, edge: 0 });
    p.line(ring(RS + 0.02, ZS + TS * 0.45).filter(([x, y]) => x + y > -2), SH.edge, 0.5);
    p.line([...ring(RS * 0.68, ZS + TS + 0.03)], SH.edge, 0.6);
    // the cushion drops on, squashes as it lands and settles
    const k = Math.min(1, h * 1.25);
    if (k > 0.01) {
      const z = ZS + TS + drop(k), land = k > 0.42 && k < 0.62 ? Math.sin(((k - 0.42) / 0.2) * Math.PI) : 0;
      const sq = 1 - 0.3 * land, rc = (RS - 1.2) * (1 + 0.1 * land);
      p.push();
      p.translate(0, 0, z);
      p.cylinder(0, 0, 0, rc, 3 * sq, { side: 0.14, top: 0.3, edge: 0 });
      p.line(ring(rc + 0.03, 0.02).filter(([x, y]) => x + y > -2), SH.edge, 0.7);
      p.dot([0, 0, 3 * sq + 0.1], 1, 0);
      p.pop();
    }
  },
};
