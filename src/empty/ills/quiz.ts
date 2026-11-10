// No quizzes: a quiz card with three answers, A B and C. Hover and answer B lifts, lights up and gets a tick.
import { type Illustration, type Pen, type V3 } from "../dots";

const W = 13, D = 11; // half width (x), half depth (y)
const ZC = 2.4; // top of the card

/** a capital letter cut into a flat tile: u runs along x, v runs up the tile (towards -y) */
function letter(p: Pen, ch: "A" | "B" | "C", x0: number, y0: number, z: number, s: number) {
  const at = (u: number, v: number): V3 => [x0 + u * s, y0 - v * s, z];
  const L = (pts: [number, number][]) => p.line(pts.map(([u, v]) => at(u, v)), 1, 0.6);
  if (ch === "A") { L([[0, 0], [0.45, 1], [0.9, 0]]); L([[0.2, 0.42], [0.7, 0.42]]); }
  if (ch === "B") {
    L([[0, 0], [0, 1], [0.55, 1], [0.78, 0.88], [0.78, 0.62], [0.55, 0.52], [0, 0.52]]);
    L([[0.55, 0.52], [0.84, 0.4], [0.84, 0.12], [0.6, 0], [0, 0]]);
  }
  if (ch === "C") L(Array.from({ length: 13 }, (_, i) => { const a = 0.75 + (i / 12) * (Math.PI * 2 - 1.5); return [0.5 + Math.cos(a) * 0.45, 0.5 + Math.sin(a) * 0.5] as [number, number]; }));
}

export const quiz: Illustration = {
  k: "quiz", name: "Quiz card", title: "No quizzes yet", body: "Create a quiz to check what your learners know.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -4);
    p.shadow(0, 0, 28, 14, 0.12);
    // the card
    p.box(-W, -D, 0, W * 2, D * 2, ZC, { top: 0.14, left: 0.12, right: 0.065 });
    // the question: a mark and two lines at the back
    p.face([[-W + 2, -D + 1.8, ZC + 0.02], [-W + 4.6, -D + 1.8, ZC + 0.02], [-W + 4.6, -D + 4.4, ZC + 0.02], [-W + 2, -D + 4.4, ZC + 0.02]], 0.13, 1);
    p.line([[-W + 6, -D + 2.5, ZC + 0.02], [W - 3, -D + 2.5, ZC + 0.02]], 1, 0.8);
    p.line([[-W + 6, -D + 4, ZC + 0.02], [W - 9, -D + 4, ZC + 0.02]], 1, 0.6);

    // the answers: three keys in rows, B is the one that lights
    const rows: ["A" | "B" | "C", number][] = [["A", -5.6], ["B", -0.6], ["C", 4.4]];
    const up = h * (2.6 + Math.sin(t * 3) * 0.3);
    for (const [ch, y] of rows) {
      const pick = ch === "B", z = ZC + (pick ? up : 0), lit = pick && h > 0.4;
      if (pick && h > 0.05) {
        // its empty slot and the lines it rose along
        p.face([[-W + 2, y, ZC + 0.02], [W - 2, y, ZC + 0.02], [W - 2, y + 4.4, ZC + 0.02], [-W + 2, y + 4.4, ZC + 0.02]], 0.04, 1);
        p.guide([[-W + 2, y + 4.4, ZC], [-W + 2, y + 4.4, z]], true);
        p.guide([[W - 2, y + 4.4, ZC], [W - 2, y + 4.4, z]], true);
        p.guide([[W - 2, y, ZC], [W - 2, y, z]], true);
      }
      p.box(-W + 2, y, z, W * 2 - 4, 4.4, 1, { top: lit ? 0.34 : 0.22, left: lit ? 0.3 : 0.14, right: 0.08 });
      const zt = z + 1.02;
      // the letter tile and the answer line
      p.face([[-W + 2.8, y + 0.5, zt], [-W + 6.6, y + 0.5, zt], [-W + 6.6, y + 3.9, zt], [-W + 2.8, y + 3.9, zt]], lit ? 0.5 : 0.13, 1);
      letter(p, ch, -W + 3.5, y + 3.35, zt + 0.01, 2.5);
      p.line([[-W + 8, y + 2.2, zt], [ch === "A" ? 4 : ch === "B" ? 6 : 2, y + 2.2, zt]], 1, 0.7);
      // the tick on the picked answer
      if (lit) p.line([[W - 6, y + 2.2, zt], [W - 4.8, y + 3.3, zt], [W - 3, y + 0.9, zt]], 1, 0.8);
    }
    // a little burst over the right answer
    const k = Math.max(0, (h - 0.6) / 0.4);
    if (k > 0.2) {
      const [sx, sy] = p.pt([W - 4.5, 1.6, ZC + up + 2]);
      const v = (t * 1.2) % 1;
      p.screen((g) => {
        g.strokeStyle = "rgb(255,255,255)"; g.lineWidth = 0.8; g.lineCap = "round";
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.55, r0 = 3 + v * 2, r1 = r0 + 2 * (1 - v) + 0.5;
          g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); g.stroke();
        }
      });
    }
  },
};
