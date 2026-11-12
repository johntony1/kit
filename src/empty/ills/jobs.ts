// Job listing: a briefcase with a handle, two straps and a clasp. Hover and it hops, and a bookmark badge pops in at its corner.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35));
// a round bright badge with a dark bookmark, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.fillStyle = "#000";
    g.beginPath(); g.moveTo(x - r * 0.34, y - r * 0.5); g.lineTo(x + r * 0.34, y - r * 0.5); g.lineTo(x + r * 0.34, y + r * 0.55); g.lineTo(x, y + r * 0.22); g.lineTo(x - r * 0.34, y + r * 0.55); g.closePath(); g.fill();
  });
}
const W = 15, D = 5, HB = 20; // half width, half depth, height

export const jobs: Illustration = {
  k: "jobs", name: "Job listing", title: "No jobs saved", body: "Save a job you like and it will be kept here for when you are ready to apply.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const hop = Math.sin(Math.PI * clamp(h / 0.6)) * 5;
    p.translate(0, 0, -14);
    p.shadow(0, 1, 26 - hop, 12 - hop * 0.4, 0.11);
    p.rotate("z", -0.5);
    p.translate(0, 0, hop);
    // the case: the body, then the lid over it, a seam between them
    p.box(-W, -D, 0, W * 2, D * 2, HB, { top: 0.22, left: 0.11, right: 0.06, lw: 0.6 });
    const Y = D + 0.03, seam = 12.5;
    p.face([[-W, Y, seam], [W, Y, seam], [W, Y, HB], [-W, Y, HB]], 0.2, 0);
    p.line([[-W, Y, seam], [W, Y, seam], [W + 0.03, -D, seam]], SH.edge, 0.8);
    // two straps down the front, and the clasp on the seam
    for (const x of [-9.5, 9.5]) p.face([[x - 1.3, Y, 0], [x + 1.3, Y, 0], [x + 1.3, Y, HB], [x - 1.3, Y, HB]], 0.4, 0);
    p.face([[-2.6, Y + 0.03, seam - 2.6], [2.6, Y + 0.03, seam - 2.6], [2.6, Y + 0.03, seam + 1.6], [-2.6, Y + 0.03, seam + 1.6]], 0.6, SH.edge, 0.5);
    p.dot([0, Y + 0.06, seam - 0.6], 0.7, 0);
    // the handle on the lid: two posts and a grip
    p.box(-6, -1.3, HB, 2, 2.6, 4.4, { top: 0.2, left: 0.34, right: 0.18, edge: 0 });
    p.box(4, -1.3, HB, 2, 2.6, 4.4, { top: 0.2, left: 0.34, right: 0.18, edge: 0 });
    p.box(-6, -1.3, HB + 4.4, 12, 2.6, 2, { top: 0.36, left: 0.34, right: 0.18, lw: 0.5 });
    const b = clamp((h - 0.62) / 0.38);
    if (b > 0) badge(p, [W + 1, Y, HB + 3], 5 * pop(b));
  },
};
