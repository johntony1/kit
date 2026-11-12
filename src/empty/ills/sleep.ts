// No sleep data: a made bed with a pillow and a folded blanket. A string of Zs drifts up from the pillow and fades, over and over.
import { SH, type Illustration } from "../dots";

const P = 3.6; // seconds per loop

export const sleep: Illustration = {
  k: "sleep", name: "Sleep", title: "No sleep data", body: "Track a night of sleep and your rest will be charted here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -4);
    p.shadow(0, 0, 32, 16, 0.12);
    p.rotate("z", -0.14);
    p.translate(2, 0, 0);
    // the headboard at the far end, then the frame and the mattress
    p.box(-19, -10.5, 0, 2.4, 21, 15, { top: 0.3, left: 0.14, right: 0.065, lw: 0.7 });
    p.box(-16.6, -10, 0, 33, 20, 3.6, { top: 0.1, left: 0.1, right: 0.05, lw: 0.6 });
    p.box(-16.6, -9.4, 3.6, 32.4, 18.8, 3, { top: 0.1, left: 0.2, right: 0.09, lw: 0.6 });
    p.line([[-16.6, 10.03, 3.6], [16.4, 10.03, 3.6], [16.43, -10, 3.6]], SH.edge, 0.8);
    // the pillow
    p.box(-15, -6.5, 6.6, 7.5, 13, 2.2, { top: 0.3, left: 0.2, right: 0.12, lw: 0.6 });
    // the blanket, with its top folded back
    p.box(-4.5, -9.8, 3.9, 20.6, 19.6, 3.6, { top: 0.22, left: 0.13, right: 0.065, lw: 0.6 });
    p.box(-5.5, -9.9, 7.5, 5, 19.8, 0.9, { top: 0.3, left: 0.2, right: 0.1, lw: 0.6 });
    p.line([[-0.5, -9.8, 7.53], [-0.5, 9.8, 7.53], [-0.5, 9.83, 3.9]], SH.edge, 0.9);
    p.line([[-4.5, 9.83, 7.5], [16.1, 9.83, 7.5]], SH.edge, 0.6);
    // the Zs, drifting up from the pillow, growing and fading
    const [ox, oy] = p.pt([-11, 0, 11]);
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      for (let i = 0; i < 3; i++) {
        const u = (ph + i / 3) % 1, s = 1.5 + 2.4 * u, a = Math.sin(u * Math.PI);
        const x = ox + 3 + u * 13 + Math.sin(u * 6) * 1.2, y = oy - 3 - u * 21;
        const n = Math.round(255 * Math.min(1, a * 1.5));
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.9 + 0.5 * u;
        c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y - s); c.lineTo(x - s, y + s); c.lineTo(x + s, y + s); c.stroke();
      }
    });
  },
};
