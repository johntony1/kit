// Nothing compiled: a page of code with a bold </> on it, a bright arrow, and a solid block. Bits of code fly along the arrow into the block, which bumps as each one lands, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const PY = 0.9; // the page's front face

export const compile: Illustration = {
  k: "compile", name: "Compiler", title: "Nothing compiled", body: "Run a build and its output will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -10);
    p.shadow(-2, 0, 40, 12, 0.11);
    p.rotate("z", -0.42);
    // the page: an upright sheet with a folded corner
    const F = 4.5;
    p.box(-25, -0.9, 0, 17, 1.8, 22, { top: 0.3, left: 0.24, right: 0.065, edge: 0 });
    const y = PY + 0.03;
    p.clear([[-8 - F, y, 22], [-7.9, y, 22], [-7.9, y, 22 - F]]);
    p.face([[-8 - F, y + 0.05, 22], [-8, y + 0.05, 22 - F], [-8 - F, y + 0.05, 22 - F]], 0.12, 0);
    p.line([[-8 - F, y + 0.06, 22], [-8 - F, y + 0.06, 22 - F], [-8, y + 0.06, 22 - F]], SH.edge, 0.6);
    // the </> glyph, cut bold
    const gl = (q: [number, number][]) => p.line(q.map(([x, z]) => [x, y, z] as V3), SH.edge, 1.5);
    gl([[-18.5, 14.5], [-22, 10.5], [-18.5, 6.5]]);
    gl([[-17.6, 5.8], [-15.4, 15.2]]);
    gl([[-14.5, 14.5], [-11, 10.5], [-14.5, 6.5]]);
    // the block, which bumps as each bit lands
    let bump = 0;
    for (let i = 0; i < 3; i++) { const v = (u - 0.18 - i * 0.22) / 0.14; if (v > 0 && v < 1) bump = Math.max(bump, Math.sin(v * Math.PI)); }
    const s = 1 + 0.06 * bump;
    p.push();
    p.scale(s, [16, 0, 0]);
    p.box(8, -8, 0, 16, 16, 15, { top: 0.22 + 0.1 * bump, left: 0.12, right: 0.065, edge: 0 });
    p.line([[8.3, 0, 15.03], [23.7, 0, 15.03]], SH.edge, 0.9);
    p.line([[24.03, 8.03, 0], [24.03, 8.03, 15]], SH.edge, 0.55);
    p.pop();
    // the arrow between them, bright
    const a0 = p.pt([-4, 0, 10]), a1 = p.pt([5.5, 0, 10]), hd = p.pt([2.5, 0, 13]), hd2 = p.pt([2.5, 0, 7]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 2.6; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.moveTo(hd[0], hd[1]); g.lineTo(a1[0], a1[1]); g.lineTo(hd2[0], hd2[1]); g.stroke();
    });
    // bits of code: small bright dots that leave the page, ride over the arrow and drop into the block
    for (let i = 0; i < 3; i++) {
      const v = (u - i * 0.22) / 0.32;
      if (v <= 0 || v >= 1) continue;
      const x = -8 + v * 24, z = 10 + 7 * Math.sin(v * Math.PI) - (v > 0.7 ? (v - 0.7) * 8 : 0);
      p.dot([x, 0, z], 1.5, 1);
    }
  },
};
