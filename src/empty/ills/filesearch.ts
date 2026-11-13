// No files match: a page standing up and a magnifier gliding round in front of it, searching its lines, over and over.
import { SH, type Illustration, type Pen } from "../dots";

const P = 3.2; // seconds per loop
const X = 12, ZT = 30, F = 8, T = 2; // half width, height, folded corner, thickness

function page(p: Pen, front: number) {
  p.face([[X, -T, 0], [X, 0, 0], [X, 0, ZT - F], [X, -T, ZT - F]], SH.right, SH.edge, 0.5);
  p.face([[X - F, -T, ZT], [X - F, 0, ZT], [X, 0, ZT - F], [X, -T, ZT - F]], 0.12, SH.edge, 0.5);
  p.face([[-X, -T, ZT], [X - F, -T, ZT], [X - F, 0, ZT], [-X, 0, ZT]], 0.26, SH.edge, 0.5);
  p.face([[-X, 0, 0], [X, 0, 0], [X, 0, ZT - F], [X - F, 0, ZT], [-X, 0, ZT]], front, SH.edge, 0.6);
  p.face([[X - F, 0.08, ZT], [X, 0.08, ZT - F], [X - F, 0.08, ZT - F]], 0.12, SH.edge, 0.6);
}

export const filesearch: Illustration = {
  k: "filesearch", name: "File search", title: "No files match", body: "Try a different name or fewer filters to find the file you need.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t % P) / P, a = ph * Math.PI * 2;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 9, 0.11);
    p.rotate("z", -0.5);
    p.push();
    p.translate(-3, -2, 0);
    page(p, 0.22);
    for (let i = 0; i < 5; i++) p.line([[-X + 3, 0.06, ZT - 5 - i * 3.6], [X - (i % 2 ? 9 : 4), 0.06, ZT - 5 - i * 3.6]], SH.edge, 0.9);
    p.pop();
    // the magnifier: a dark lens with a bright rim and a thick handle, gliding round a small circle
    const [cx, cy] = p.pt([2 + Math.cos(a) * 3.5, 6, 14 + Math.sin(a) * 3.5]);
    const r = 8.2, ang = 0.85 + Math.sin(a) * 0.08;
    const hx = Math.cos(ang), hy = Math.sin(ang);
    p.screen((g) => {
      g.lineCap = "round";
      // the handle: a dark outline then a bright bar
      g.strokeStyle = "#000"; g.lineWidth = 6.4;
      g.beginPath(); g.moveTo(cx + hx * (r + 1), cy + hy * (r + 1)); g.lineTo(cx + hx * (r + 11), cy + hy * (r + 11)); g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(cx + hx * (r + 2), cy + hy * (r + 2)); g.lineTo(cx + hx * (r + 10), cy + hy * (r + 10)); g.stroke();
      // the lens: dark glass, a black outline, a bright rim, a glint
      g.beginPath(); g.arc(cx, cy, r + 1.6, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
      g.beginPath(); g.arc(cx, cy, r - 1.2, 0, Math.PI * 2); g.fillStyle = "rgb(20,20,20)"; g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 2.2;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1.4;
      g.beginPath(); g.arc(cx, cy, r - 3.2, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    });
  },
};
