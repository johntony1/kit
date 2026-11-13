// No salary added: a pay envelope standing up with a banknote tucked in it. The note slides up out of the envelope, shows its currency mark, and slips back in, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const smooth = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
const W = 13, H = 17, D = 1.6; // envelope half width, height, half thickness
const NW = 11.4, NH = 15; // note half width and height

export const salary: Illustration = {
  k: "salary", name: "Salary", title: "No salary added", body: "Add your salary and each payday will be tracked here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const rise = smooth((u - 0.1) / 0.3) - smooth((u - 0.68) / 0.25);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.45);
    // the back of the envelope with its open flap folded back
    p.face([[-W, -D, 0], [W, -D, 0], [W, -D, H], [-W, -D, H]], 0.08, 0);
    p.face([[-W, -D, H], [W, -D, H], [W, -D - 3, H + 5], [-W, -D - 3, H + 5]], 0.2, 0);
    p.line([[-W, -D, H + 0.03], [W, -D, H + 0.03]], SH.edge, 0.6);
    // the note, rising out of the envelope: lit with a cut border, an oval and the mark
    const zb = 3 + rise * 12;
    p.push();
    p.translate(0, 0, zb);
    p.face([[-NW, 0, 0], [NW, 0, 0], [NW, 0, NH], [-NW, 0, NH]], 0.24, 0);
    p.face([[NW, -0.4, 0], [NW, 0, 0], [NW, 0, NH], [NW, -0.4, NH]], SH.right, 0);
    p.line([[-NW + 1.4, 0.03, 1.4], [NW - 1.4, 0.03, 1.4], [NW - 1.4, 0.03, NH - 1.4], [-NW + 1.4, 0.03, NH - 1.4], [-NW + 1.4, 0.03, 1.4]], SH.edge, 0.6);
    const oc: V3 = [0, 0.05, NH - 6.5];
    p.line(Array.from({ length: 29 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [oc[0] + Math.cos(a) * 4.2, oc[1], oc[2] + Math.sin(a) * 4.2] as V3; }), SH.edge, 0.9);
    const S: [number, number][] = [[1.2, 1.6], [0.5, 2], [-0.6, 2], [-1.2, 1.4], [-0.8, 0.5], [0.8, -0.3], [1.2, -1.1], [0.7, -1.9], [-0.5, -2], [-1.2, -1.5]];
    p.line(S.map(([a, b]) => [-a, 0.06, oc[2] + b] as V3), SH.edge, 0.9);
    p.line([[0, 0.06, oc[2] + 2.9], [0, 0.06, oc[2] - 2.9]], SH.edge, 0.9);
    p.pop();
    // the front of the envelope: its pocket with the fold as a cut, and its sparse end
    p.face([[W, -D, 0], [W, D, 0], [W, D, H - 2], [W, -D, H - 2]], SH.right, 0);
    p.face([[-W, D, 0], [W, D, 0], [W, D, H - 2], [0, D, H - 6], [-W, D, H - 2]], 0.2, 0);
    p.line([[-W, D + 0.03, H - 2], [0, D + 0.03, H - 6], [W, D + 0.03, H - 2]], SH.edge, 0.8);
  },
};
