// No deliveries today: a delivery van, side on, with a sliding side door. Hover and the door slides back on an empty, dark cargo bay; the van settles on its springs.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const Y = 6.5, WR = 4.2; // half width, wheel radius
// the body's outline in x, z: a tall cargo box, a sloped windscreen, a short bonnet
const BODY: [number, number][] = [[-17, 3.5], [16, 3.5], [16, 9.5], [14, 11], [8.5, 19], [7, 20], [-17, 20]];

const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

function wheel(p: Pen, x: number) {
  const y = Y + 0.3;
  p.ringV("y", [x, y, WR], WR, 0.2, 0);
  p.ringV("y", [x, y + 0.03, WR], WR * 0.62, 0.03, 0);
  p.ringV("y", [x, y + 0.05, WR], WR * 0.36, 0.26, 0);
  p.dot([x, y + 0.06, WR], 0.55, 0.02);
}

export const deliveryvan: Illustration = {
  k: "deliveryvan", name: "Delivery van", title: "No deliveries today", body: "Deliveries scheduled for today will appear here with their drivers and routes.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11.5);
    p.shadow(0, 0, 32, 13, 0.12);
    const e = easeInOut(Math.min(1, h * 1.4));
    p.push();
    p.translate(0, 0, -0.4 * e + 0.12 * h * Math.sin(t * 5));
    // the body: the faces we see round the outline, then the near side
    const n = BODY.length;
    for (let i = 0; i < n; i++) {
      const [ax, az] = BODY[i], [bx, bz] = BODY[(i + 1) % n];
      const q: V3[] = [[ax, Y, az], [bx, Y, bz], [bx, -Y, bz], [ax, -Y, az]];
      if (facing(p, q) > 0) p.face(q, bz === az ? 0.2 : bx < ax && bz > az ? 0.24 : 0.065, 0);
    }
    p.face(BODY.map(([x, z]) => [x, Y, z] as V3), 0.12, 0);
    // the windscreen: a dark pane on the slope
    const ws = (k: number, s: number): V3 => [14 - 5.5 * k - 0.05, s * (Y - 1), 11 + 8 * k + 0.05];
    p.face([ws(0.12, -1), ws(0.12, 1), ws(0.88, 1), ws(0.88, -1)], 0.035, 0);
    // the cab's side window and its door line
    const sy = Y + 0.03;
    p.face([[7.5, sy, 12.5], [12.6, sy, 12.5], [8.6, sy, 18], [7.5, sy, 18]], 0.035, 0);
    p.line([[6.5, sy + 0.02, 4.5], [6.5, sy + 0.02, 18.6]], SH.edge, 0.6);
    p.line([[9, sy + 0.02, 10.6], [11, sy + 0.02, 10.6]], SH.edge, 0.7);
    // a lit headlamp on the nose
    p.face([[16.03, Y - 3.2, 7], [16.03, Y - 0.8, 7], [16.03, Y - 0.8, 8.8], [16.03, Y - 3.2, 8.8]], 0.32, 0);
    // the sliding door: an opening behind the cab, the panel slides back over the body
    const D0 = -4.5, D1 = 5, DZ0 = 4.5, DZ1 = 18.4;
    const s = e * 8.5;
    if (s > 0.05) p.clear([[D1 - s, sy, DZ0], [D1, sy, DZ0], [D1, sy, DZ1], [D1 - s, sy, DZ1]]);
    const dy = Y + 0.03 + 0.5 * Math.min(1, e * 4);
    p.face([[D0 - s, dy, DZ0], [D1 - s, dy, DZ0], [D1 - s, dy, DZ1], [D0 - s, dy, DZ1]], 0.14, 0);
    p.line([[D0 - s, dy + 0.02, DZ0], [D0 - s, dy + 0.02, DZ1], [D1 - s, dy + 0.02, DZ1], [D1 - s, dy + 0.02, DZ0]], SH.edge, 0.7);
    p.line([[D0 + 1 - s, dy + 0.02, 11], [D0 + 1 - s, dy + 0.02, 13.5]], SH.edge, 0.8);
    // a band along the side, the mark of a delivery van
    p.face([[-17, sy, 9], [D0 - s - 0.4, sy, 9], [D0 - s - 0.4, sy, 11.2], [-17, sy, 11.2]], 0.26, 0);
    // wheel arches
    for (const x of [-11, 10.5]) p.clear(Array.from({ length: 13 }, (_, i) => { const a = (Math.PI * i) / 12; return [x + Math.cos(a) * (WR + 0.9), sy + 0.01, 3.5 + Math.sin(a) * (WR + 0.4)] as V3; }));
    p.pop();
    wheel(p, -11); wheel(p, 10.5);
  },
};
