// No doses planned: a seven day pill organiser, seven boxes in a row, each lid sitting a little proud with a dark seam. Hover and the lids flip back in a wave across the week, showing the pills, and a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const N = 7, CW = 7.4, GAP = 1.5, D = 7.5, HB = 8, LT = 2.2; // boxes, box pitch, gap between boxes, half depth, body height, lid thickness
const X0 = -(N * CW) / 2;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const back = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const pillorganizer: Illustration = {
  k: "pillorganizer", name: "Pill organiser", title: "No doses planned", body: "Add your medicines and a schedule, and each day's doses will be laid out here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -6);
    p.shadow(0, 0, 36, 14, 0.12);
    p.rotate("z", -0.7);
    for (let i = 0; i < N; i++) {
      const x = X0 + i * CW + GAP / 2, w = CW - GAP;
      // the box: a dark well inside its walls
      p.box(x, -D, 0, w, D * 2, HB, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
      p.face([[x + 0.9, -D + 0.9, HB + 0.01], [x + w - 0.9, -D + 0.9, HB + 0.01], [x + w - 0.9, D - 0.9, HB + 0.01], [x + 0.9, D - 0.9, HB + 0.01]], 0.02, 0);
      const a = cl((h - i * 0.06) / 0.5);
      if (a > 0) {
        // pills waiting in a few of the wells, lit as the lid lifts
        const pills: [number, number][] = i % 3 === 0 ? [[-1.6, -2.6], [1.4, 0.4], [-1.2, 3.4]] : i % 3 === 1 ? [[0, -1.5], [0.4, 2.6]] : [[0, 0.5]];
        for (const [px, py] of pills) p.dot([x + w / 2 + px * 0.5, py, HB + 0.5], 1.5 * Math.min(1, a * 1.6), 1);
      }
      // the lid, hinged at the back, sitting a little proud at rest so a dark seam shows under it
      const ang = 1.95 * back(a);
      p.push();
      p.rotate("x", ang, [0, -D, HB + 1.3]);
      p.box(x, -D, HB + 1.3, w, D * 2 + 0.4, LT, { top: 0.26, left: 0.18, right: 0.065, edge: 0 });
      // a tab at the front to lift it by
      p.box(x + w / 2 - 1.3, D + 0.4, HB + 1.5, 2.6, 1.2, 1.2, { top: 0.3, left: 0.2, right: 0.09, edge: 0 });
      p.pop();
    }
    const b = cl((h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? (b / 0.65) * 1.18 : 1.18 - 0.18 * ((b - 0.65) / 0.35);
      badge(p, [X0 + 1, -D - 1, HB + 16], 4.4 * pop);
    }
  },
};
