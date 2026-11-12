// No scenes yet: a clapperboard with its stick raised. Hover and the stick snaps shut with a spark.
import { SH, type Illustration, type Pen } from "../dots";

const X = 15.5, Y = 1.1, BH = 17, SB = 3.8; // half width, half thickness, slate height, stripe bar height
/** the slanted stripes on a bar's face */
function stripes(p: Pen, z0: number, lean: number) {
  for (let i = 0; i < 5; i++) {
    const x = -X + 1.6 + i * 6 + (lean < 0 ? 2.4 : 0);
    p.face([[x, Y + 0.03, z0], [x + 3.1, Y + 0.03, z0], [x + 3.1 + lean, Y + 0.03, z0 + SB], [x + lean, Y + 0.03, z0 + SB]], 0.3, 0);
  }
}

export const clapper: Illustration = {
  k: "clapper", name: "Clapperboard", title: "No scenes yet", body: "Add your first scene to start building the film.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 1, -14);
    p.shadow(0, 0, 26, 12, 0.1);
    p.rotate("z", -0.38);
    // the slate, ruled into its boxes
    p.box(-X, -Y, 0, X * 2, Y * 2, BH, { top: 0.2, left: 0.13, right: 0.07, lw: 0.65 });
    const y = Y + 0.03;
    for (const z of [5.6, 11.3]) p.line([[-X + 1.5, y, z], [X - 1.5, y, z]], SH.edge, 0.6);
    p.line([[-3, y, 1.4], [-3, y, 11.3]], SH.edge, 0.6); p.line([[6, y, 1.4], [6, y, 5.6]], SH.edge, 0.6);
    p.line([[-X + 3, y, 14], [-2, y, 14]], SH.edge, 0.9);
    // the fixed bar
    p.box(-X, -Y, BH, X * 2, Y * 2, SB, { top: 0.2, left: 0.03, right: 0.07, lw: 0.6 });
    stripes(p, BH, 2.4);
    // the stick: up at rest, snapping down fast, a small bounce at the end
    const k = Math.min(1, h / 0.5);
    const open = k < 0.7 ? 1 - Math.pow(k / 0.7, 3) : 0.1 * Math.sin(((k - 0.7) / 0.3) * Math.PI) * (1 - (k - 0.7) / 0.3);
    p.push();
    p.rotate("y", -0.44 * open, [-X + 1.2, 0, BH + SB + 0.2]);
    p.box(-X, -Y, BH + SB + 0.2, X * 2, Y * 2, SB, { top: 0.24, left: 0.03, right: 0.07, lw: 0.6 });
    stripes(p, BH + SB + 0.2, -2.4);
    p.pop();
    p.dot([-X + 1.4, Y + 0.3, BH + SB + 0.1], 1, 1);
    // the spark where it lands
    const s = Math.max(0, (h - 0.34) / 0.66), a = s > 0 ? Math.sin(Math.min(1, s * 1.15) * Math.PI) : 0;
    if (a > 0.02) {
      const c = p.pt([X + 1.5, Y, BH + SB + 0.2]);
      p.screen((g) => {
        g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 0.9; g.lineCap = "round";
        for (const [dx, dy] of [[1, -0.1], [0.75, -0.75], [0.85, 0.6], [0.2, -1]]) {
          g.beginPath(); g.moveTo(c[0] + dx * (2 + 3 * s), c[1] + dy * (2 + 3 * s)); g.lineTo(c[0] + dx * (4.5 + 6 * s), c[1] + dy * (4.5 + 6 * s)); g.stroke();
        }
      });
    }
  },
};
