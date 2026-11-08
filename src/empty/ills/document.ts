// Write a new document: a pen writes line after line across a sheet, then the lines fade and it starts again.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3, X0 = -10;
const LINES: [number, number][] = [[-7, 10], [-3, 9], [1, 10], [5, 3]]; // y and end x of each line
const W0 = 0.04, WD = 0.72; // writing starts, writing span

export const document: Illustration = {
  k: "document", name: "Document", title: "Write a new document", body: "Start with a blank page. Your documents will be listed here.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(-4, 4, -6);
    p.shadow(0, 0, 28, 13, 0.1);
    // the sheet, with a folded corner at the far right
    p.box(-14, -12, 0, 28, 24, 0.8);
    p.face([[10, -12, 0.82], [14, -12, 0.82], [14, -8, 0.82]], 0.04, 0);
    p.face([[10, -12, 0.85], [14, -8, 0.85], [10, -8, 0.85]], 0.32, SH.edge, 0.5);
    const Z = 0.9;
    const fade = u < 0.82 ? 1 : u > 0.94 ? 0 : 1 - easeInOut((u - 0.82) / 0.12);
    // where the nib is: writing a line, travelling to the next, or going home
    const k = Math.max(0, Math.min(4, ((u - W0) / WD) * 4));
    let nib: V3, lift = 0;
    const slot = Math.min(3, Math.floor(k)), fr = k - slot;
    if (u >= W0 + WD) {
      const g = easeInOut(Math.min(1, (u - W0 - WD) / (1 - W0 - WD)));
      const [y, x1] = LINES[3];
      nib = [x1 + (X0 - x1) * g, y + (LINES[0][0] - y) * g, Z]; lift = Math.sin(g * Math.PI) * 4;
    } else if (u < W0) {
      nib = [X0, LINES[0][0], Z];
    } else {
      const [y, x1] = LINES[slot];
      if (fr < 0.8) nib = [X0 + (x1 - X0) * (fr / 0.8), y, Z];
      else {
        const g = easeInOut((fr - 0.8) / 0.2), n = LINES[slot + 1] ?? LINES[slot];
        nib = [x1 + (X0 - x1) * g, y + (n[0] - y) * g, Z]; lift = Math.sin(g * Math.PI) * 2.5;
      }
    }
    // the lines written so far
    LINES.forEach(([y, x1], i) => {
      const done = u >= W0 + WD ? 1 : i < slot ? 1 : i === slot ? Math.min(1, fr / 0.8) : 0;
      if (done <= 0) return;
      p.line([[X0, y, Z], [X0 + (x1 - X0) * done, y, Z]], SH.edge * fade, 1.05);
    });
    // the pen, leaning away from us
    const tip: V3 = [nib[0], nib[1], nib[2] + lift];
    const top: V3 = [tip[0] + 6, tip[1] - 1.5, tip[2] + 13];
    const neck: V3 = [tip[0] + 1.3, tip[1] - 0.3, tip[2] + 2.8];
    p.line([neck, top], SH.edge, 4.2);
    p.line([neck, top], 0.02, 2.6);
    p.line([tip, neck], SH.edge, 1.1);
    const band = (s: number): V3 => [neck[0] + (top[0] - neck[0]) * s, neck[1] + (top[1] - neck[1]) * s, neck[2] + (top[2] - neck[2]) * s];
    p.line([band(0.68), band(0.76)], 0.9, 3);
    p.dot(tip, 0.55, 1);
  },
};
