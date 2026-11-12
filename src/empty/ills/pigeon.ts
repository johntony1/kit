// No news yet: a plump carrier pigeon standing side on, a letter in its beak. It bobs its head and the letter sways, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 2.4, T = 2.4; // loop seconds, half thickness of the bird
const glow = (p: Pen, pts: V3[], lw = 1.2) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 1.2) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
// a flat outline in the xz plane, y0 to y1 thick: the rim that shows, then the front
function slab(p: Pen, o: P2[], y0: number, y1: number, front: number) {
  const f: V3[] = o.map(([x, z]) => [x, y1, z]), b: V3[] = o.map(([x, z]) => [x, y0, z]), s = area(p, f);
  for (let i = 0; i < o.length; i++) {
    const j = (i + 1) % o.length, q = [f[i], f[j], b[j], b[i]];
    if (area(p, q) * s < 0) p.face(q, 0.1, 0);
  }
  p.face(f, front, 0);
}
const oval = (cx: number, cz: number, rx: number, rz: number, tilt: number, n = 28): P2[] => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, u = Math.cos(a) * rx, v = Math.sin(a) * rz;
  return [cx + u * Math.cos(tilt) - v * Math.sin(tilt), cz + u * Math.sin(tilt) + v * Math.cos(tilt)] as P2;
});

export const pigeon: Illustration = {
  k: "pigeon", name: "Carrier pigeon", title: "No news yet", body: "Nothing has come in so far. News and updates will land here as they arrive.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, nod = Math.sin(u * Math.PI * 4) * 0.9, sway = Math.sin(u * Math.PI * 2) * 0.12;
    const Y = T + 0.03;
    p.translate(0, 0, -17);
    p.shadow(-1, 1, 22, 9, 0.12);
    p.rotate("z", -0.62);
    p.translate(-4, 0, 0);
    p.scale(0.95);
    // the legs and feet
    for (const x of [-2.6, 2.4]) rod(p, [[x, 0.5, 9], [x, 0.5, 1], [x + 3.4, 0.5, 0.6]], 1.8);
    // the tail, the plump body, the neck and the head
    slab(p, [[-9, 12], [-20, 6.4], [-19.4, 11], [-10, 19]], -T * 0.6, T * 0.6, 0.3);
    slab(p, oval(-2, 16, 12.5, 9.6, 0.3), -T, T, 0.3);
    slab(p, [[2, 18], [12, 17], [14.4, 28 + nod * 0.3], [5.4, 29.5 + nod * 0.3]], -T * 0.8, T * 0.8, 0.3);
    p.push();
    p.translate(nod, 0, 0);
    slab(p, oval(10, 29.6, 6.2, 5.8, 0), -T * 0.8, T * 0.8, 0.3);
    // the beak and the eye
    const beak: V3[] = [[15.4, Y, 31.4], [20.6, Y, 28.6], [15.4, Y, 27.4]];
    p.face(beak, 0.3, 0);
    p.line([beak[0], [15.9, Y, 29.4], beak[2]], SH.edge, 0.9);
    p.dot([11.4, Y, 31], 1.4, 0);
    // the letter, held by a corner
    p.push();
    p.rotate("y", 0.5 + sway, [19.6, 0, 28.4]);
    const e = (a: number, b: number): V3 => [18.2 + a, Y, 29 - b];
    p.face([e(0, 0), e(10.5, 0), e(10.5, 7.4), e(0, 7.4)], 0.3, 0);
    p.line([e(0, 0), e(10.5, 0), e(10.5, 7.4), e(0, 7.4), e(0, 0)], SH.edge, 0.8);
    p.line([e(0, 0), e(5.25, 4), e(10.5, 0)], SH.edge, 0.9);
    p.pop();
    p.pop();
    // the collar and the folded wing, as cuts and a darker tone
    p.line([[4, Y, 23], [8, Y, 21.4], [12.6, Y, 22]], SH.edge, 0.9);
    const wing: V3[] = ([[4, 20.6], [1.6, 12.4], [-6, 9.4], [-16, 9.6], [-10, 16], [-3, 21.4]] as P2[]).map(([x, z]) => [x, Y, z] as V3);
    p.face(wing, 0.05, 0);
    p.line([...wing, wing[0]], SH.edge, 0.9);
    p.line([[1, Y, 15.6], [-6, Y, 12.6], [-13, Y, 12]], SH.edge, 0.8);
  },
};
