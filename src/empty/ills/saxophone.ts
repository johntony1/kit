// No songs yet: a saxophone standing upright, its neck and mouthpiece curling off the top and its bell turned up beside the body. Hover and the keys press down one after another and notes rise out of the bell.
import { type Illustration, type V3 } from "../dots";

type Pt = [number, number, number]; // across, up, radius
// the centre line of the horn, from the mouthpiece to the bell, with the radius at each point
const KEY: Pt[] = [[-10, 31, 0.9], [-6.5, 32.6, 1.1], [-2.6, 31.6, 1.4], [-0.6, 28.5, 1.9], [0, 22, 2.5], [0.8, 13, 3.1], [1.8, 7, 3.6], [4, 2.6, 3.9], [7.6, 1.6, 4], [10.6, 3.8, 4], [12, 8.5, 4.2], [12.6, 13, 4.8], [13, 16.5, 6.4]];
/** catmull rom through the key points: a smooth path, finely sampled */
const PATH: Pt[] = (() => {
  const out: Pt[] = [];
  for (let i = 0; i < KEY.length - 1; i++) {
    const p0 = KEY[Math.max(0, i - 1)], p1 = KEY[i], p2 = KEY[i + 1], p3 = KEY[Math.min(KEY.length - 1, i + 2)];
    for (let j = 0; j < 16; j++) {
      const s = j / 16, s2 = s * s, s3 = s2 * s;
      out.push([0, 1, 2].map((e) => 0.5 * (2 * p1[e] + (-p0[e] + p2[e]) * s + (2 * p0[e] - 5 * p1[e] + 4 * p2[e] - p3[e]) * s2 + (-p0[e] + 3 * p1[e] - 3 * p2[e] + p3[e]) * s3)) as Pt);
    }
  }
  out.push(KEY[KEY.length - 1]);
  return out;
})();
const KEYS: [number, number][] = [[0.2, 25], [0.35, 21], [0.55, 17], [0.8, 13], [1.2, 9.5]]; // pads down the body's front

export const saxophone: Illustration = {
  k: "saxophone", name: "Saxophone", title: "No songs yet", body: "Record or upload your first song and it will be waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 9, 0.12);
    p.rotate("z", -0.62);
    p.translate(-2, 0, 0);
    const disc = (a: number, v: number, r: number, y: number): V3[] => Array.from({ length: 20 }, (_, i) => { const q = (i / 20) * Math.PI * 2; return [a + Math.cos(q) * r, y, v + Math.sin(q) * r] as V3; });
    // the horn as a strip of small quads between two offsets of the centre line (o0, o1 across, -1 to 1)
    const N = PATH.length;
    const side = PATH.map(([a, v], i) => {
      const [a0, v0] = PATH[Math.max(0, i - 1)], [a1, v1] = PATH[Math.min(N - 1, i + 1)], l = Math.hypot(a1 - a0, v1 - v0) || 1;
      return [-(v1 - v0) / l, (a1 - a0) / l] as [number, number];
    });
    const strip = (o0: (i: number) => number, o1: (i: number) => number, y: number, f: number, da = 0, dv = 0) => {
      const at = (i: number, o: number): V3 => [PATH[i][0] + side[i][0] * PATH[i][2] * o + da, y, PATH[i][1] + side[i][1] * PATH[i][2] * o + dv];
      for (let i = 0; i < N - 1; i++) {
        const q = [at(i, o0(i)), at(i + 1, o0(i + 1)), at(i + 1, o1(i + 1)), at(i, o1(i))];
        const m = q.reduce((s, v) => [s[0] + v[0] / 4, s[1] + v[1] / 4, s[2] + v[2] / 4] as V3, [0, 0, 0] as V3);
        p.face(q.map((v) => v.map((x, e) => m[e] + (x - m[e]) * 1.25) as V3), f, 0); // a little overlap so no seams show
      }
    };
    // which way is the lit side (up and to the left) at each point
    const lit = side.map(([x, z]) => (-x + 0.5 * z >= 0 ? 1 : -1));
    strip(() => -1, () => 1, -1.6, 0.065, 0.5, -0.3); // its depth
    strip(() => -1, () => 1, 0, 0.12); // the dense body
    strip((i) => lit[i] * 0.12, (i) => lit[i] * 0.72, 0.03, 0.26); // a lit band down its upper side
    // the mouthpiece: a dark tip
    p.face(disc(-10.3, 31, 1.1, 0.06), 0.015, 0);
    // the bell's mouth: a bright rim round a dark opening, tipped toward us
    const [ba, bv, br] = PATH[PATH.length - 1];
    const mouth = (r: number, y: number): V3[] => Array.from({ length: 32 }, (_, i) => { const q = (i / 32) * Math.PI * 2; return [ba + Math.cos(q) * r, y + Math.sin(q) * r * 0.35, bv + 0.4 + Math.sin(q) * r * 0.26] as V3; });
    p.face(mouth(br + 0.4, 0.1), 0.34, 0);
    p.face(mouth(br - 1.1, 0.12), 0.015, 0);
    // the keys: bright pads with dark rims, pressing in turn while hovered
    KEYS.forEach(([a, v], i) => {
      const k = h > 0 ? Math.max(0, Math.sin(Math.max(0, h * 2.2 - i * 0.28) * Math.PI * 1.5)) * (h < 1 ? 1 : 0.5 + 0.5 * Math.sin(t * 6 + i)) : 0;
      const [x, y] = p.pt([a, 0.2, v]);
      p.screen((c) => {
        c.fillStyle = "#000"; c.beginPath(); c.arc(x, y, 2.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, 1.45 - 0.7 * Math.min(1, k), 0, Math.PI * 2); c.fill();
      });
    });
    // notes rising out of the bell
    const n = Math.max(0, (h - 0.5) / 0.5);
    if (n > 0) {
      const [nx, ny] = p.pt([ba, 0, bv + 2]);
      p.screen((c) => {
        for (let i = 0; i < 3; i++) {
          const u = (t * 0.4 + i / 3) % 1, a = n * Math.sin(u * Math.PI);
          if (a < 0.05) continue;
          const g = Math.round(255 * Math.min(1, a * 1.4));
          c.fillStyle = c.strokeStyle = `rgb(${g},${g},${g})`;
          const x = nx - 4 + i * 4.5 + Math.sin(u * 6 + i) * 1.5, y = ny - 4 - u * 14;
          c.beginPath(); c.ellipse(x, y, 1.7, 1.2, -0.4, 0, Math.PI * 2); c.fill();
          c.lineWidth = 0.9; c.beginPath(); c.moveTo(x + 1.4, y - 0.3); c.lineTo(x + 1.4, y - 5.8); c.lineTo(x + 3.5, y - 4.6); c.stroke();
        }
      });
    }
  },
};
