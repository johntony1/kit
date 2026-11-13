// No clips made yet: an old film camera, two reels on its top and a lens out front, a sparkle beside it. The reels turn and the sparkle twinkles, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop
type Q = [number, number][];
const circ = (ca: number, cv: number, r: number, n = 30): Q => Array.from({ length: n }, (_, i) => { const s = (i / n) * Math.PI * 2; return [ca + Math.cos(s) * r, cv + Math.sin(s) * r]; });
const star = (ca: number, cv: number, R: number, r: number): Q =>
  Array.from({ length: 8 }, (_, i) => { const s = Math.PI / 2 + (i * Math.PI) / 4, q = i % 2 ? r : R; return [ca + Math.cos(s) * q, cv + Math.sin(s) * q]; });

export const aivideo: Illustration = {
  k: "aivideo", name: "Video generation", title: "No clips made yet", body: "Describe a scene and your generated clips will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", -0.55);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v] as V3);
    // two reels standing on the top, each turning: a rim, a lit face, three dark windows round a hub
    const reel = (ca: number, cv: number, r: number, spin: number) => {
      for (let y = -1.6; y < 1; y += 0.5) p.face(put(circ(ca, cv, r), y), 0.065, 0);
      p.face(put(circ(ca, cv, r), 1), 0.24, 0);
      for (let i = 0; i < 3; i++) {
        const a = spin + (i * Math.PI * 2) / 3;
        p.face(put(circ(ca + Math.cos(a) * r * 0.52, cv + Math.sin(a) * r * 0.52, r * 0.27, 16), 1.05), 0.03, 0);
      }
      p.face(put(circ(ca, cv, r * 0.15, 12), 1.05), 0.03, 0);
    };
    reel(-7, 20.5, 6.6, -u * Math.PI * 2 / 3);
    reel(5, 19.5, 5.4, -u * Math.PI * 2 / 3 + 0.5);
    // the body
    p.box(-12, -4.5, 0, 18, 9, 13.5, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.line([[-12, 4.53, 13.5], [6, 4.53, 13.5], [6.03, -4.5, 13.5]], 1, 0.5);
    p.face([[-9.5, 4.55, 4], [-3, 4.55, 4], [-3, 4.55, 9], [-9.5, 4.55, 9]], 0.03, 0);
    // the lens: a barrel stepping out to a wide hood, the dark glass with a glint
    for (let x = 6; x < 9; x += 0.4) p.ringV("x", [x, 0, 6.8], 3.3, 0.1, 0);
    for (let x = 9; x < 12; x += 0.4) p.ringV("x", [x, 0, 6.8], 4.6, 0.065, 0);
    p.ringV("x", [12, 0, 6.8], 4.6, 0.3, 0);
    p.ringV("x", [12.05, 0, 6.8], 3.6, 0.03, 0);
    p.dot([12.1, 1.2, 8.2], 0.8, 1);
    // the sparkle, twinkling
    const s = 0.85 + 0.2 * Math.sin(u * Math.PI * 2);
    p.face(put(star(-14.5, 27.5, 6 * s, 1.7 * s), 0.4), 0.03, 0);
    p.face(put(star(-14.5, 27.5, 5 * s, 1.2 * s), 0.6), 0.42, 0);
  },
};
