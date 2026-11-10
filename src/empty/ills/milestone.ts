// No milestones reached: a snowy peak with a flag at the summit. Hover and the flag runs up its pole and waves.
import { SH, type Illustration, type V3 } from "../dots";

const B = 13, HT = 24; // half size of the base, height of the summit
const A: V3 = [0, 0, HT];
const lerp = (a: V3, b: V3, f: number): V3 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];

export const milestone: Illustration = {
  k: "milestone", name: "Summit flag", title: "No milestones reached", body: "Milestones you reach will be celebrated here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, 3, -6);
    p.shadow(0, -3, 38, 18, 0.11);
    // a smaller peak behind, to the right
    {
      const a: V3 = [3, -13, 17], L: V3 = [-6, -4, 0], M: V3 = [12, -4, 0], R: V3 = [12, -22, 0];
      p.face([L, M, a], 0.12, SH.edge, 0.55);
      p.face([M, R, a], SH.right, SH.edge, 0.55);
      p.face([lerp(L, a, 0.6), lerp(M, a, 0.6), a], 0.24, SH.edge, 0.5);
      p.face([lerp(M, a, 0.6), lerp(R, a, 0.6), a], 0.16, SH.edge, 0.5);
    }
    // the main peak: two walls, each with a snow cap whose lower edge is jagged
    const L: V3 = [-B, B, 0], M: V3 = [B, B, 0], R: V3 = [B, -B, 0];
    p.face([L, M, A], 0.12, SH.edge, 0.6);
    p.face([M, R, A], SH.right, SH.edge, 0.6);
    const cap = (a: V3, b: V3, fill: number) => {
      const pts: V3[] = [];
      for (let i = 0; i <= 6; i++) {
        const e = lerp(lerp(a, A, 0.56), lerp(b, A, 0.56), i / 6);
        pts.push(i % 2 ? lerp(e, A, -0.22) : e);
      }
      p.face([...pts, A], fill, SH.edge, 0.5);
    };
    cap(L, M, 0.24);
    cap(M, R, 0.16);
    // a trail zigzagging up the near wall
    const w = (x: number, z: number): V3 => [x * (1 - z / HT), B * (1 - z / HT) + 0.05, z];
    p.line([w(0.55, 0.6), w(-0.35, 3.6), w(0.4, 6.8), w(-0.3, 9.6), w(0.25, 12.2)], SH.edge, 0.6);
    // the pole, and a dashed mark where the flag flies at the top
    p.box(-0.4, -0.4, HT - 0.6, 0.8, 0.8, 12.6, { top: 0.22, left: 0.16 });
    p.dot([0, 0, HT + 12.3], 0.9, 1);
    if (h < 0.95) p.guide([[0.5, 0, HT + 11.6], [7.8, 0, HT + 9.6], [0.5, 0, HT + 7]], true);
    // the flag: low on the pole at rest, run up and waving on hover
    const fz = HT + 6.4 + h * 5.2;
    const wave = (k: number) => Math.sin(t * 6 - k * 2.4) * 0.9 * h * k;
    const top: V3[] = [], bot: V3[] = [];
    for (let i = 0; i <= 6; i++) {
      const k = i / 6, x = 0.5 + k * 7.4;
      top.push([x, wave(k), fz - k * 1.6 + wave(k) * 0.4]);
      bot.push([x, wave(k), fz - 4.6 + k * 1.6 + wave(k) * 0.4]);
    }
    p.face([...top, ...bot.reverse()], 0.32, SH.edge, 0.5);
    // sparkles at the summit once it is up
    const k = Math.max(0, (h - 0.7) / 0.3);
    if (k > 0) for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + t * 0.6, r = 9 + Math.sin(t * 3 + i) * 1.2;
      p.dot([Math.cos(a) * r * 0.6, -Math.cos(a) * r * 0.6, HT + 8 + Math.sin(a) * r * 0.55], 0.7, k);
    }
  },
};
