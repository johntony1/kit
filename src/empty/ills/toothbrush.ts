// Toothbrush: a toothbrush on its own, side on, with a blob of paste on the bristles. Hover and it gives a little scrub while sparkles twinkle.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
// a flat outline in the xz plane, y0 to y1 thick: the rim that shows, then the front
function slab(p: Pen, o: P2[], y0: number, y1: number, front: number) {
  const f: V3[] = o.map(([x, z]) => [x, y1, z]), b: V3[] = o.map(([x, z]) => [x, y0, z]), s = area(p, f);
  for (let i = 0; i < o.length; i++) {
    const j = (i + 1) % o.length, q = [f[i], f[j], b[j], b[i]];
    if (area(p, q) * s < 0) p.face(q, Math.abs(o[j][0] - o[i][0]) > Math.abs(o[j][1] - o[i][1]) ? 0.12 : 0.05, 0);
  }
  p.face(f, front, 0);
}
const BODY: P2[] = [[-21, -2.8], [4, -2.4], [8.5, -1.5], [10.5, -2.4], [21, -2.4], [22.4, -1.2], [22.4, 1], [21.4, 2], [10, 2], [8.5, 1.5], [4, 2.5], [-21, 2.9], [-23, 1.6], [-23, -1.5]];
const PASTE: P2[] = [[11, 10.5], [21, 10.5], [22.2, 12.4], [20.8, 14.4], [18.2, 14.6], [15.8, 13.8], [13.6, 15.8], [11.6, 15.2], [10.2, 12.8]];
function spark(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1; g.lineCap = "round"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); });
}

export const toothbrush: Illustration = {
  k: "toothbrush", name: "Toothbrush", title: "No daily routines yet", body: "Set up a routine and your morning and evening steps will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const Y = 2.03, scrub = h * Math.sin(t * 9) * 1.4 * Math.sin(clamp(h) * Math.PI * 0.5);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 9, 0.11);
    p.rotate("z", -0.62);
    p.translate(-2, 0, 10);
    p.rotate("y", -0.6);
    p.scale(1.1);
    p.translate(scrub, 0, 0);
    // the handle, neck and head in one piece
    slab(p, BODY, -2, 2, 0.3);
    for (const x of [-16, -13.5, -11]) p.line([[x - 1, Y, -1.8], [x + 1, Y, 1.9]], SH.edge, 0.9);
    // the bristles: a tall block with cuts between the tufts
    slab(p, [[10.6, 2], [21.4, 2], [21.4, 10.5], [10.6, 10.5]], -1.8, 1.8, 0.14);
    p.line([[10.6, Y, 2], [21.4, Y, 2]], SH.edge, 0.8);
    for (const x of [13.3, 16, 18.7]) p.line([[x, Y, 2], [x, Y, 10.5]], SH.edge, 0.8);
    // the paste: a soft swirl on top
    slab(p, PASTE, -1.5, 1.5, 0.3);
    p.line([[10.6, Y, 10.5], [21.4, Y, 10.5]], SH.edge, 0.9);
    p.line([[13, Y, 12.6], [15.8, Y, 12.1], [19.4, Y, 12.8]], SH.edge, 0.7);
    const k = clamp((h - 0.3) / 0.5);
    if (k > 0) {
      const tw = 0.75 + 0.25 * Math.sin(t * 6);
      spark(p, [7, 0, 15], 2.8 * k * tw);
      spark(p, [24, 0, 6], 2 * k * (1.75 - tw));
      spark(p, [18, 0, 20], 1.6 * k * tw);
    }
  },
};
