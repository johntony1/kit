// No itinerary yet: a sheet with three stops on a dotted line, none of them planned. Hover and the stops fill in one after another and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const circle = (cx: number, cy: number, z: number, r: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });
// a round bright badge with a dark tick, flat to the screen
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.35); g.stroke();
  });
}

export const itinerary: Illustration = {
  k: "itinerary", name: "Itinerary", title: "No itinerary yet", body: "Add your first stop and the plan for your trip will build up here day by day.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 0, -3);
    p.scale(1.5);
    p.shadow(0, 0, 24, 11, 0.12);
    // a sheet underneath, askew, then the itinerary on top
    p.push(); p.rotate("z", 0.09); p.box(-9.5, -13.5, 0, 19, 27, 0.6, { top: 0.1, left: 0.1, right: 0.06 }); p.pop();
    p.box(-9.5, -13.5, 0.6, 19, 27, 0.9, { top: 0.22, left: 0.14, right: 0.075, lw: 0.6 });
    const z = 1.53, X = -5.4, stops = [-8.4, 0, 8.4];
    // the dotted line between the stops
    for (let y = stops[0] + 2.6; y < stops[2] - 2; y += 1.5) if (Math.abs(y) > 2.2) p.line([[X, y, z], [X, y + 0.6, z]], SH.edge, 0.6);
    stops.forEach((y, i) => {
      const k = ease(Math.min(1, Math.max(0, (h - 0.08 - i * 0.24) / 0.26)));
      // the stop: a ring that fills in
      p.line(circle(X, y, z, 1.7), SH.edge, 0.7);
      if (k > 0) p.dot([X, y, z + 0.01], 1.75 * k, p.ink ? 1 : 0);
      // its two lines: a name and a time
      p.line([[-2, y - 0.9, z], [-2 + (i === 1 ? 6.5 : 8.5), y - 0.9, z]], SH.edge, 1.2);
      p.line([[-2, y + 1.3, z], [-2 + (i === 2 ? 3.4 : 5), y + 1.3, z]], SH.edge, 0.6);
    });
    // planned: a tick pops in off the corner
    const b = Math.max(0, (h - 0.74) / 0.26);
    if (b > 0) tick(p, [12.5, -11, 5], 3.2 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
