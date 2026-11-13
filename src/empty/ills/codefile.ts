// No code files: a code file standing up with angle brackets at its head. Lines of code type themselves in under a blinking cursor, then clear and start again.
import { SH, type Illustration } from "../dots";

const W = 12, H = 30, T = 0.6, F = 6; // half width, height, half thickness, folded corner
const P = 3.2;
const LINES: [number, number][] = [[-8.5, 1], [-6, 6], [-6, -1], [-8.5, 3.5]]; // start and end of each line of code

export const codefile: Illustration = {
  k: "codefile", name: "Code file", title: "No code files", body: "Add a source file or start a new one and it will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 2, 25, 10, 0.12);
    p.rotate("z", -0.42);
    p.face([[W, -T, 0], [W, T, 0], [W, T, H - F], [W, -T, H - F]], SH.right, SH.edge, 0.5);
    p.face([[-W, -T, H], [W - F, -T, H], [W - F, T, H], [-W, T, H]], SH.top, SH.edge, 0.5);
    p.face([[-W, T, 0], [W, T, 0], [W, T, H - F], [W - F, T, H], [-W, T, H]], 0.24, SH.edge, 0.55);
    p.face([[W - F, T + 0.03, H], [W, T + 0.03, H - F], [W - F, T + 0.03, H - F]], 0.4, SH.edge, 0.5);
    const y = T + 0.04;
    // the brackets and slash at the head, cut bold
    const zc = 20.5;
    p.line([[-4.5, y, zc + 3.2], [-8, y, zc], [-4.5, y, zc - 3.2]], SH.edge, 1.3);
    p.line([[1.5, y, zc + 3.2], [5, y, zc], [1.5, y, zc - 3.2]], SH.edge, 1.3);
    p.line([[-0.6, y, zc - 3.6], [-2.4, y, zc + 3.6]], SH.edge, 1.3);
    // the lines typing in: each grows in turn, all hold, then clear
    const type = Math.min(1, u / 0.7) * LINES.length;
    let cx = LINES[0][0], cz = 12;
    LINES.forEach(([x0, x1], i) => {
      const k = Math.min(1, Math.max(0, type - i));
      if (k <= 0 || u > 0.92) return;
      const z = 12 - i * 2.8;
      cx = x0 + (x1 - x0) * k; cz = z;
      p.line([[x0, y, z], [cx, y, z]], SH.edge, 1.2);
    });
    if (u > 0.92) { cx = LINES[0][0]; cz = 12; }
    // the cursor: a dark block after the last letter, blinking while it waits
    const on = type >= LINES.length && u <= 0.92 ? Math.floor(u * 10) % 2 === 0 : true;
    if (on) p.face([[cx + 0.6, y + 0.02, cz - 1.1], [cx + 1.8, y + 0.02, cz - 1.1], [cx + 1.8, y + 0.02, cz + 1.1], [cx + 0.6, y + 0.02, cz + 1.1]], 0.02, 0);
  },
};
