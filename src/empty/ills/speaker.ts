// Nothing connected to play: a tall speaker, silent. Hover and its cone starts to pump and sound rings spread out from it.
import { SH, type Illustration } from "../dots";

export const speaker: Illustration = {
  k: "speaker", name: "Speaker", title: "Nothing connected to play", body: "Connect a speaker or a pair of headphones to hear your audio.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(2, -2, -16);
    p.shadow(0, 0, 22, 11, 0.11);
    p.rotate("z", -0.32);
    const X = 9.5, Y = 7, Z = 32;
    for (const [x, y] of [[-X + 1, -Y + 1], [X - 3, -Y + 1], [-X + 1, Y - 3], [X - 3, Y - 3]]) p.box(x, y, 0, 2, 2, 1.2, { edge: 0 });
    p.box(-X, -Y, 1.2, X * 2, Y * 2, Z - 1.2, { top: 0.22, left: 0.13, right: 0.065, lw: 0.65 });
    const y = Y + 0.03, pump = h * (0.5 + 0.5 * Math.sin(t * 11));
    // the woofer: a dark cone in a ring, its cap pumping
    p.ringV("y", [0, y, 11.5], 7.4, 0.2, SH.edge, 0.6);
    p.ringV("y", [0, y + 0.02, 11.5], 6.3, 0.03, SH.edge, 0.5);
    p.ringV("y", [0, y + 0.04, 11.5], 4.2 + 0.5 * pump, 0, SH.edge, 0.4);
    p.ringV("y", [0, y + 0.06 + 0.8 * pump, 11.5], 2.2 + 0.5 * pump, 0.5, SH.edge, 0.5);
    // the tweeter and a port
    p.ringV("y", [0, y, 24.5], 3.6, 0.2, SH.edge, 0.55);
    p.ringV("y", [0, y + 0.02, 24.5], 2.7, 0.03, SH.edge, 0.45);
    p.ringV("y", [0, y + 0.04, 24.5], 1, 0.5, 0);
    p.clear([[-3, y, 2.8], [3, y, 2.8], [3, y, 3.8], [-3, y, 3.8]]);
    p.dot([6.6, y, 29.2], 0.55, 0.25 + 0.75 * h);
    // sound: arcs spreading out in front of the cone, only while it plays
    if (h > 0.02) {
      const c = p.pt([0, y, 11.5]), d = Math.atan2(0.5, -0.866) + 0.18;
      p.screen((g) => {
        g.lineWidth = 0.9; g.lineCap = "round";
        for (let i = 0; i < 3; i++) {
          const u = (t * 0.7 + i / 3) % 1, a = Math.sin(u * Math.PI) * h;
          g.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
          g.beginPath(); g.arc(c[0] + 2, c[1], 11 + u * 13, d - 0.5, d + 0.5); g.stroke();
        }
      });
    }
  },
};
