// No repositories yet: a thick book standing upright, a label and a bookmark on its cover. Hover and the cover swings open on a first page of code, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const X = 9.5, H = 26; // half width and height of the book

function badge(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const repo: Illustration = {
  k: "repo", name: "Repository", title: "No repositories yet", body: "Create a repository to keep your code and its history in one place.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 1, 22, 11, 0.12);
    p.rotate("z", -0.4);
    // the back board and the page block: pages show lit on the top and the fore edge
    p.box(-X, -3, 0, X * 2, 5, H, { top: 0.3, left: 0.3, right: 0.26, lw: 0.6 });
    for (const y of [-1.4, 0.3]) {
      p.line([[X + 0.03, y, 0.6], [X + 0.03, y, H - 0.4]], SH.edge, 0.45);
      p.line([[-X + 0.6, y, H + 0.03], [X, y, H + 0.03]], SH.edge, 0.45);
    }
    // the first page: lines of code, indented
    const py = 2.03;
    ([[-6, 4, 21], [-4, 3, 18], [-4, 5.5, 15], [-6, 1, 12], [-6, 3.5, 8]] as [number, number, number][]).forEach(([x0, x1, z]) => p.line([[x0, py, z], [x1, py, z]], 0.6, 0.6));
    // the cover, hinged at the spine
    const open = ease(cl(h / 0.7)) * 0.95;
    p.push();
    p.rotate("z", open, [-X, 2, 0]);
    p.box(-X, 2, 0, X * 2 + 0.5, 0.9, H + 0.4, { top: 0.2, left: 0.13, right: 0.065, lw: 0.6 });
    const fy = 2.93;
    p.line([[-X + 2.4, fy, 0], [-X + 2.4, fy, H + 0.4]], SH.edge, 0.55);
    p.face([[-4.4, fy, 15.5], [6.6, fy, 15.5], [6.6, fy, 21.5], [-4.4, fy, 21.5]], 0.3, SH.edge, 0.5);
    p.line([[-2.4, fy + 0.02, 18.5], [4.6, fy + 0.02, 18.5]], SH.edge, 0.7);
    // the bookmark at the foot of the cover
    p.face([[-4.4, fy, 9], [-0.4, fy, 9], [-0.4, fy, 2.4], [-2.4, fy, 4.4], [-4.4, fy, 2.4]], 0.3, SH.edge, 0.5);
    p.pop();
    const b = cl((h - 0.66) / 0.34);
    if (b > 0) badge(p, [X + 3, -3, H + 2], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
