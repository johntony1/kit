// No notes on the wall: three big square sticky notes standing up, overlapping, each turned a little, the front one with its lower corner curled. Hover and the notes fan apart, the curl lifts and a plus badge pops in.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
const at = (o: P2[], y: number): V3[] => o.map(([x, z]) => [x, y, z]);
// a slab standing up and facing us: the outline (x, z) at depth y, pushed back by T; the rim that shows, then the front
function slab(p: Pen, o: P2[], y: number, T: number, front: number) {
  const F = at(o, y), B = at(o, y - T), s = area(p, F);
  for (let i = 0; i < o.length; i++) {
    const j = (i + 1) % o.length, q = [F[i], F[j], B[j], B[i]];
    if (area(p, q) * s < 0) p.face(q, Math.abs(o[j][0] - o[i][0]) > Math.abs(o[j][1] - o[i][1]) ? 0.12 : 0.05, 0);
  }
  p.face(F, front, 0);
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
// a round bright badge with a dark mark: a plus, or a cross
function badge(p: Pen, c: V3, r: number, cross = false) {
  const [x, y] = p.pt(c);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    const d = r * (cross ? 0.4 : 0.5);
    g.beginPath();
    if (cross) { g.moveTo(x - d, y - d); g.lineTo(x + d, y + d); g.moveTo(x + d, y - d); g.lineTo(x - d, y + d); }
    else { g.moveTo(x - d, y); g.lineTo(x + d, y); g.moveTo(x, y - d); g.lineTo(x, y + d); }
    g.stroke();
  });
}

const S = 10.5; // half size of a note

export const stickynotes: Illustration = {
  k: "stickynotes", name: "Sticky notes", title: "No notes on the wall", body: "Put up your first note and the wall will start to fill in.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = easeInOut(Math.min(1, h * 1.3));
    p.translate(0, 0, -17);
    p.shadow(0, 2, 26, 11, 0.12);
    p.rotate("z", -0.6);
    const notes = [
      { x: -8.5 - 1.5 * k, z: 21 + 1 * k, a: 0.2 + 0.08 * k, y: -4, tone: 0.12 },
      { x: 8.5 + 1.5 * k, z: 23 + 1 * k, a: -0.16 - 0.08 * k, y: -2, tone: 0.2 },
      { x: 0.5, z: 10 - 0.6 * k, a: 0.04, y: 0, tone: 0.42 },
    ];
    notes.forEach((n, i) => {
      p.push();
      p.translate(n.x, 0, n.z);
      p.rotate("y", n.a);
      const front = i === 2;
      const c = front ? 6.5 + 2.5 * k : 0; // how far the curl reaches up each edge from the lower right corner
      const o: P2[] = front ? [[-S, -S], [S - c, -S], [S, -S + c], [S, S], [-S, S]] : [[-S, -S], [S, -S], [S, S], [-S, S]];
      // a dark border first, so each note stands apart from the one behind it
      const g = 1.1;
      p.clear(at(front ? [[-S - g, -S - g], [S - c + 0.4, -S - g], [S + g, -S + c - 0.4], [S + g, S + g], [-S - g, S + g]] : [[-S - g, -S - g], [S + g, -S - g], [S + g, S + g], [-S - g, S + g]], n.y));
      slab(p, o, n.y, 0.9, n.tone);
      // the sticky strip along the top, and a line or two written on it
      const f = n.y + 0.04;
      if (front) {
        p.line([[-S + 3.5, f, 4], [S - 4, f, 4]], 1, 1.4);
        p.line([[-S + 3.5, f, -1], [S - 9, f, -1]], 1, 1.4);
        // the curl: the corner folded up off the note, its back showing
        const A: V3 = [S - c, f, -S], B: V3 = [S, f, -S + c], tip: V3 = [S - c + 0.6, f + 1.5 + 3 * k, -S + c - 0.6];
        p.clear([A, B, [S - c - 0.6, f, -S + c + 0.6]]);
        p.face([A, B, tip], 0.12, 0);
        p.line([A, tip, B], 1, 0.6);
      }
      p.pop();
    });
    const b = Math.max(0, (h - 0.62) / 0.38);
    if (b > 0) badge(p, [14, -2, 34], 4.4 * pop(b));
  },
};
