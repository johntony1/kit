// No sights saved: a triumphal arch on its steps. Hover and a heart pops in over it with a few sparkles, the mark of a saved sight.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const YF = 4; // the front of the arch

// a round bright badge with a dark heart, flat to the screen
function heart(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    const s = r * 0.5;
    g.fillStyle = "#000"; g.beginPath();
    g.moveTo(x, y + s * 0.95);
    g.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.9, y - s * 1.2, x, y - s * 0.45);
    g.bezierCurveTo(x + s * 0.9, y - s * 1.2, x + s * 1.5, y - s * 0.1, x, y + s * 0.95);
    g.fill();
  });
}

export const landmark: Illustration = {
  k: "landmark", name: "Landmark", title: "No sights saved", body: "Save the places you want to see and they will be collected here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.scale(1.05);
    p.shadow(0, 0, 28, 13, 0.11);
    // two steps
    p.box(-16, -7, 0, 32, 14, 1.2, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(-14.5, -5.5, 1.2, 29, 11, 1.2, { top: 0.22, left: 0.14, right: 0.07 });
    // the block, with the archway cut through its front
    const Z0 = 2.4, ZS = 13, RA = 5; // floor, where the arch springs, its radius
    p.box(-13, -YF, Z0, 26, YF * 2, 19, { top: 0.22, left: 0.22, right: 0.075, lw: 0.6 });
    const hole: V3[] = [[-RA, YF + 0.03, Z0], [RA, YF + 0.03, Z0], ...Array.from({ length: 15 }, (_, i) => { const a = (i / 14) * Math.PI; return [Math.cos(a) * RA, YF + 0.03, ZS + Math.sin(a) * RA] as V3; })];
    p.clear(hole);
    // the inner wall of the archway, seen through the opening
    p.face([[-RA, YF, Z0], [-RA, -YF, Z0], [-RA, -YF, ZS + 2.2], [-RA, YF, ZS]], 0.1, SH.edge, 0.5);
    p.face([[-RA, -YF, Z0], [-RA + 3.2, -YF, Z0], [-RA + 3.2, YF, Z0], [-RA, YF, Z0]], 0.2, 0);
    // a band where the arch springs, a panel on each pier
    p.line([[-13, YF + 0.04, ZS], [-RA, YF + 0.04, ZS]], SH.edge, 0.7); p.line([[RA, YF + 0.04, ZS], [13, YF + 0.04, ZS]], SH.edge, 0.7);
    for (const x of [-9, 9]) p.clear([[x - 1.6, YF + 0.04, 5], [x + 1.6, YF + 0.04, 5], [x + 1.6, YF + 0.04, 10.6], [x - 1.6, YF + 0.04, 10.6]]);
    // the cornice and the attic above it
    p.line([[-13, YF + 0.03, 21.4], [13, YF + 0.03, 21.4]], SH.edge, 0.6);
    p.box(-14, -YF - 1, 21.4, 28, YF * 2 + 2, 1.6, { top: 0.24, left: 0.22, right: 0.09, lw: 0.6 });
    p.line([[-14, YF + 1.03, 23], [14, YF + 1.03, 23], [14.03, -YF - 1, 23]], SH.edge, 0.6);
    p.box(-12, -YF + 0.6, 23, 24, YF * 2 - 1.2, 4.2, { top: 0.24, left: 0.22, right: 0.075, lw: 0.6 });
    p.line([[-12, YF - 0.57, 27.2], [12, YF - 0.57, 27.2], [12.03, -YF + 0.6, 27.2]], SH.edge, 0.6);
    p.line([[-8, YF - 0.56, 25.1], [8, YF - 0.56, 25.1]], SH.edge, 0.9);
    // saved: a heart pops in above, with sparkles
    const b = Math.max(0, (h - 0.25) / 0.75);
    if (b > 0) {
      const pop = b < 0.6 ? ease(b / 0.6) * 1.18 : 1.18 - 0.18 * ease((b - 0.6) / 0.4);
      heart(p, [0, 0, 35 + 0.5 * Math.sin(t * 2.6)], 4.6 * pop);
      if (b > 0.5) ([[-9, 0, 33], [9.5, 0, 36], [7, 0, 30.5]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.3 * Math.sin(t * 3.4 + i * 2), (b - 0.5) * 2));
    }
  },
};
