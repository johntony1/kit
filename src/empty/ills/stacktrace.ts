// No errors logged: three code windows standing in a stack, each set up and to the right of the one in front, the front one full of code with a dark error band across it. Hover and the windows fan apart and the band flashes.
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
// a rounded rectangle in the (x, z) plane
const rr = (x0: number, z0: number, x1: number, z1: number, r: number): P2[] => {
  const o: P2[] = [];
  const arc = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (i / 5) * Math.PI / 2; o.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  arc(x1 - r, z0 + r, -Math.PI / 2); arc(x1 - r, z1 - r, 0); arc(x0 + r, z1 - r, Math.PI / 2); arc(x0 + r, z0 + r, Math.PI);
  return o;
};
// a dark bar cut into a face standing at depth y: a line of text
const bar = (p: Pen, x0: number, x1: number, z: number, hh: number, y: number) => p.clear([[x0, y, z - hh], [x1, y, z - hh], [x1, y, z + hh], [x0, y, z + hh]]);

const W = 14, H = 22; // half width, height of a window

function win(p: Pen, y: number, tone: number) {
  p.clear(at(rr(-W - 1.1, -1.1, W + 1.1, H + 1.1, 3), y));
  slab(p, rr(-W, 0, W, H, 2.2), y, 1.6, tone);
  const f = y + 0.04;
  p.line([[-W + 0.4, f, H - 4], [W - 0.4, f, H - 4]], 1, 0.7); // the title bar
  for (let i = 0; i < 3; i++) p.dot([-W + 3 + i * 2.6, f, H - 2], 0.85, 0);
}

export const stacktrace: Illustration = {
  k: "stacktrace", name: "Stack trace", title: "No errors logged", body: "When something fails, the trail of calls that led to it will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.3)), s = 6 + 2.5 * k;
    p.translate(-3, 0, -16);
    p.shadow(4, -2, 28, 12, 0.12);
    p.rotate("z", -0.6);
    p.push(); p.translate(s * 2, 0, s * 2); win(p, -8, 0.12); p.pop();
    p.push(); p.translate(s, 0, s); win(p, -4, 0.2); p.pop();
    win(p, 0, 0.3);
    // the code: short and long lines, indented, with the error band across the middle
    const f = 0.06;
    for (const [a, b, z] of [[-11, 2, 14.4], [-8, 8, 11.6], [-8, 4, 2.6]] as [number, number, number][]) bar(p, a, b, z, 0.65, f);
    p.clear([[-W + 0.6, f, 4.9], [W - 0.6, f, 4.9], [W - 0.6, f, 8.6], [-W + 0.6, f, 8.6]]);
    const on = h < 0.5 || Math.cos(t * 7) > -0.3;
    if (on) p.face([[-8.5, f + 0.02, 6.1], [8, f + 0.02, 6.1], [8, f + 0.02, 7.4], [-8.5, f + 0.02, 7.4]], 0.3, 0);
    p.face([[-12.2, f + 0.02, 5.7], [-10.4, f + 0.02, 5.7], [-10.4, f + 0.02, 7.8], [-12.2, f + 0.02, 7.8]], 0.45, 0);
  },
};
