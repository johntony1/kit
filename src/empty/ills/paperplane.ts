// Nothing sent yet: a folded paper plane gliding up to the right, a dashed trail looping out behind it. It bobs and banks as it flies.
import { type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
// the plane, nose toward -y (up and to the right on screen)
const N: V3 = [0, -17, 2], T: V3 = [0, 11, 0], WL: V3 = [-13, 13, 5], WR: V3 = [13, 13, 5], KB: V3 = [0, 11, -6];

export const paperplane: Illustration = {
  k: "paperplane", name: "Paper plane", title: "Nothing sent yet", body: "Messages you send will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(2, -2, 2);
    p.push(); p.translate(-6, 4, -20); p.shadow(0, 0, 20, 7, 0.1); p.pop();
    const bob = Math.sin(w) * 1.6;
    p.translate(0, 0, bob);
    p.rotate("z", 0.15);
    p.scale(1.2);
    p.rotate("x", -0.22); // nose up a little
    p.rotate("y", Math.sin(w + 0.6) * 0.14); // banking
    // the trail: dashes looping out behind the tail, flowing back
    const trail = Array.from({ length: 60 }, (_, i) => {
      const s = i / 59, a = s * Math.PI * 2;
      return p.pt([Math.sin(a) * 4 * s, 13 + s * 17 - Math.sin(a) * 3, -1 - s * 2 + (1 - Math.cos(a)) * 3.4 - bob * s]);
    });
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
      g.setLineDash([3.2, 3.2]); g.lineDashOffset = -u * 6.4 * 3;
      g.beginPath(); trail.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    });
    // the far wing, the keel under the fold, then the near wing over it
    p.face([N, T, WL], 0.3, 0);
    p.face([N, T, KB], 0.07, 0);
    p.face([N, T, WR], 0.13, 0);
    // the fold along the near wing
    p.line([N, [6.5, 12, 2.5]], 1, 0.7);
  },
};
