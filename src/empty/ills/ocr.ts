// No text found: a page of text standing inside four bright corner brackets, a scan line across it. The line sweeps down the page, every line of text it passes turns bold, then it sweeps back up and they fade again.
import { type Illustration, type Pen, type V3 } from "../dots";

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

const P = 3.2; // loop seconds
const lines: [number, number][] = [[28, 8], [24.5, 4], [21, 9], [17.5, 6], [14, 9], [10.5, 3], [7, 7]];

export const ocr: Illustration = {
  k: "ocr", name: "Text scan", title: "No text found", body: "Upload a photo or a scan and any text in it will be picked out here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, s = 0.5 - 0.5 * Math.cos(u * Math.PI * 2), zs = 33 - 30 * s;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", -0.6);
    // the page
    slab(p, rr(-12, 2, 12, 32, 1.6), 0, 1.4, 0.24);
    for (const [z, e] of lines) {
      if (z > zs) bar(p, -8.5, e, z, 0.95, 0.05);
      else p.line([[-8.5, 0.05, z], [e, 0.05, z]], 1, 0.45);
    }
    // the four corner brackets, out in front of the page
    const X = 16.5, Z0 = -2, Z1 = 36, L = 7.5, T = 2.3, y = 3;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const cx = sx < 0 ? -X : X, cz = sz < 0 ? Z0 : Z1;
      const o: P2[] = [[cx, cz], [cx - sx * L, cz], [cx - sx * L, cz - sz * T], [cx - sx * T, cz - sz * T], [cx - sx * T, cz - sz * L], [cx, cz - sz * L]];
      slab(p, o, y, 2, 0.3);
    }
    // the scan line: a bright stroke across, with a bead at each end
    const a = p.pt([-X + 1, y + 0.3, zs]), b = p.pt([X - 1, y + 0.3, zs]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.7; g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.fillStyle = "#fff";
      for (const q of [a, b]) { g.beginPath(); g.arc(q[0], q[1], 1.6, 0, Math.PI * 2); g.fill(); }
    });
  },
};
