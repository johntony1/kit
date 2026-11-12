// No items to compare: two product cards standing side by side. Hover and a line runs down both, row by row, then the better one steps up with a tick.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ROWS = [11.5, 8, 4.5]; // heights of the three rows on a card
const PW = 11, PH = 26; // a card's width and height

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.52, y - r * 0.36); g.stroke();
  });
}

/** one card: a thin slab with a picture and three rows; `marks` says which rows it wins */
function card(p: Pen, x0: number, z0: number, round: boolean, scan: number, marks: boolean[]) {
  p.box(x0, -0.9, z0, PW, 1.8, PH, { top: 0.3, left: 0.1, right: 0.07 });
  const Y = 0.93, q = (x: number, z: number): V3 => [x0 + x, Y, z0 + z];
  // the picture: a dark window with a simple shape in it
  p.face([q(1.6, 14.4), q(PW - 1.6, 14.4), q(PW - 1.6, PH - 1.8), q(1.6, PH - 1.8)], 0.03, SH.edge, 0.5);
  if (round) p.ringV("y", q(PW / 2, 19.3), 2.7, 0.5, SH.edge, 0.5);
  else p.face([q(PW / 2 - 3, 16.6), q(PW / 2 + 3, 16.6), q(PW / 2, 22.4)], 0.5, SH.edge, 0.5);
  ROWS.forEach((z, i) => {
    const on = scan > i + 0.5;
    p.line([q(1.8, z), q(on && !marks[i] ? 5 : 6.4, z)], on ? 1 : 0.6, on ? 0.8 : 0.6);
    if (on && marks[i]) p.dot(q(PW - 2.6, z), 1, 1);
    else p.dot(q(PW - 2.6, z), 0.55, 0.45);
  });
}

export const compare: Illustration = {
  k: "compare", name: "Compare items", title: "No items to compare", body: "Pick two or more items to see them side by side.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const scan = cl(h / 0.66) * 3.4; // which row the line has reached
    const win = ease(cl((h - 0.66) / 0.3));
    p.translate(0, 0, -14);
    p.shadow(0, 0, 26, 10, 0.11);
    p.rotate("z", -0.6); // turned to face us
    const gap = 2 + 1.2 * ease(cl(h * 2));
    card(p, -gap - PW, 0, true, scan, [true, false, false]);
    card(p, gap, win * 3.4, false, scan, [false, true, true]);
    // the scanning line: across both cards, stepping down the rows
    if (h > 0.02 && scan < 3.2) {
      const i = Math.min(2, Math.floor(scan)), f = scan - Math.floor(scan), z = ROWS[i] + (scan < 3 ? 1.7 * (1 - ease(Math.min(1, f * 1.6))) : 0);
      p.line([[-gap - PW - 1.6, 1, z - 1.7], [gap + PW + 1.6, 1, z - 1.7]], 1, 0.9);
    }
    // the two arrows between them, at rest
    if (h < 0.5) {
      const a = 1 - h * 2, z = 19;
      p.line([[-1.6, 1, z + 1.4], [1.6, 1, z + 1.4]], a, 0.7); p.line([[0.5, 1, z + 2.5], [1.6, 1, z + 1.4], [0.5, 1, z + 0.3]], a, 0.7);
      p.line([[-1.6, 1, z - 1.6], [1.6, 1, z - 1.6]], a, 0.7); p.line([[-0.5, 1, z - 0.5], [-1.6, 1, z - 1.6], [-0.5, 1, z - 2.7]], a, 0.7);
    }
    if (win > 0) badge(p, [gap + PW - 0.5, 1, PH + 4 + win * 3.4 + 0.5 * Math.sin(t * 2.4)], 4.4 * (win < 0.7 ? (win / 0.7) * 1.15 : 1.15 - 0.15 * ((win - 0.7) / 0.3)));
  },
};
