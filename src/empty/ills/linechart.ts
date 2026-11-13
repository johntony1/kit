// No trend yet: a line chart on a standing board, a bright line climbing across its dark face. Over and over the line draws itself point by point, holds, and wipes away.
import { type Illustration, type V3 } from "../dots";

const P = 3.8; // seconds per loop
const PTS: [number, number][] = [[-12.5, 7], [-5.5, 15], [1, 11], [7, 19], [12.5, 24.5]]; // (x, z) on the face

export const linechart: Illustration = {
  k: "linechart", name: "Line chart", title: "No trend yet", body: "Once you have a few days of data, the trend will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    // shifted so the first frame shows the whole line
    const u = ((t / P) + 0.6) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 1, 28, 12, 0.12);
    p.rotate("z", -0.42);
    const W = 17, Z = 30;
    // a foot, and the board: a lit rim round a dark face
    p.box(-W - 2, -5, 0, (W + 2) * 2, 10, 2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(-W, -2.5, 2, W * 2, 3, Z, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    const y = 0.53;
    p.face([[-W + 1.6, y, 3.6], [W - 1.6, y, 3.6], [W - 1.6, y, Z + 0.4], [-W + 1.6, y, Z + 0.4]] as V3[], 0.03, 0);
    // how much of the line shows: drawn on from the left, held, then wiped from the left
    const n = PTS.length - 1;
    const head = Math.min(1, u / 0.42) * n, tail = u < 0.86 ? 0 : ((u - 0.86) / 0.14) * n;
    const at = (s: number): [number, number] => {
      const i = Math.min(n - 1, Math.floor(s)), f = s - i;
      return [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * f, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * f];
    };
    const pt = ([x, z]: [number, number]) => p.pt([x, y + 0.02, z]);
    p.screen((g) => {
      // the axes: bright, along the left and the bottom of the face
      const o = pt([-W + 3.6, 4.8]), top = pt([-W + 3.6, Z - 1.4]), right = pt([W - 3, 4.8]);
      g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(o[0], o[1]); g.lineTo(right[0], right[1]); g.stroke();
      if (head - tail < 0.02) return;
      // the line
      const seq: [number, number][] = [at(tail)];
      for (let i = Math.ceil(tail); i < head; i++) if (i > tail) seq.push(PTS[i]);
      seq.push(at(head));
      g.lineWidth = 2.6;
      g.beginPath(); seq.map(pt).forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
      // its points, and a bigger one at the head
      PTS.forEach((q, i) => {
        if (i < tail || i > head) return;
        const [a, b] = pt(q); g.beginPath(); g.arc(a, b, 1.9, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      });
      const [a, b] = pt(at(head)); g.beginPath(); g.arc(a, b, 2.8, 0, Math.PI * 2); g.fill();
    });
  },
};
