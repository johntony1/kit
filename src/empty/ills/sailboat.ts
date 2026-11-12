// Sailboat: a small sailing boat under a mainsail and a jib. It bobs and rocks on the swell, wave crests slide past and the pennant flutters.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const P = 3.2; // seconds per loop
const Y = 4.4, ZD = 4.6; // half the beam, deck height

// a row of wave crests along x at depth y, drifting with the phase
function waves(p: Pen, y: number, drift: number) {
  for (let i = -4; i <= 4; i++) {
    const x = i * 7 + drift * 7, f = Math.max(0, 1 - Math.pow(Math.abs(x) / 22, 3));
    if (f > 0.05) glow(p, [[x - 2.2, y, 0], [x - 1, y, 0.9], [x + 1, y, 0.9], [x + 2.2, y, 0]], 1, f * 0.95);
  }
}

export const sailboat: Illustration = {
  k: "sailboat", name: "Sailboat", title: "No voyages planned", body: "Plan a voyage and its route and dates will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(-1.5, 0, -20);
    p.scale(1.22);
    p.shadow(1, 0, 26, 11, 0.1);
    waves(p, -8.5, u);
    p.push();
    p.translate(0, 0, 0.8 * Math.sin(w));
    p.rotate("y", 0.05 * Math.sin(w + 1.2), [0, 0, 3]);
    // the hull: a near side, a raked bow and a bright deck
    p.face([[-12, Y - 0.8, 0], [7, Y - 0.8, 0], [9, Y, ZD], [-14, Y, ZD]], 0.2, SH.edge, 0.6);
    p.face([[7, Y - 0.8, 0], [12, 0, 0], [17, 0, ZD], [9, Y, ZD]], 0.08, SH.edge, 0.6);
    p.face([[-14, -Y, ZD], [9, -Y, ZD], [17, 0, ZD], [9, Y, ZD], [-14, Y, ZD]], 0.24, SH.edge, 0.6);
    p.line([[-13.4, Y + 0.03, 3], [8.4, Y + 0.03, 3]], SH.edge, 0.7);
    // a low cabin aft of the mast
    p.box(-10, -2.3, ZD, 7, 4.6, 2.2, { top: 0.22, left: 0.14, right: 0.07, lw: 0.5 });
    // the mast, then the two sails standing along the keel
    const ZT = ZD + 28;
    p.box(-0.5, -0.5, ZD, 1, 1, 28, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    const belly = 0.5 * Math.sin(w + 0.6);
    p.face([[-1.2, 0, ZD + 3], [-13.5, belly, ZD + 3], [-1.2, 0, ZT - 1]], 0.3, SH.edge, 0.6);
    for (const k of [0.27, 0.54]) p.line([[-1.2, 0.03, ZD + 3 + 24 * k], [-13.5 + 12.3 * k, 0.03 + belly * (1 - k), ZD + 3 + 24 * k]], SH.edge, 0.55);
    p.face([[1.4, 0, ZD + 2], [15.5, belly, ZD + 1.2], [1.4, 0, ZT - 4]], 0.2, SH.edge, 0.6);
    // the pennant at the masthead
    p.face([[0, 0, ZT + 2], [-4.4, 0, ZT + 1 + 0.5 * Math.sin(w * 2)], [0, 0, ZT]], 0.3, SH.edge, 0.4);
    p.pop();
    // the swell in front of the hull
    waves(p, Y + 3, -u + 0.5);
    waves(p, Y + 7.5, -u);
  },
};
