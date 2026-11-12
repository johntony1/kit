// Curly braces: a pair of solid curly braces with three dots between them. The dots light one after another and the braces breathe apart, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 2.8;
// the centre line of a left brace, in [u, v]: v runs from -12 to 12
const SPINE: [number, number][] = [[3.4, 12], [1.9, 11.8], [0.9, 11], [0.5, 9.6], [0.5, 3.6], [0.1, 1.8], [-0.9, 0.6], [-2.4, 0], [-0.9, -0.6], [0.1, -1.8], [0.5, -3.6], [0.5, -9.6], [0.9, -11], [1.9, -11.8], [3.4, -12]];
// a stroke of half width w along the spine, as one outline
function ribbon(w: number): [number, number][] {
  const L: [number, number][] = [], R: [number, number][] = [];
  SPINE.forEach(([u, v], i) => {
    const a = SPINE[Math.max(0, i - 1)], b = SPINE[Math.min(SPINE.length - 1, i + 1)];
    const du = b[0] - a[0], dv = b[1] - a[1], n = Math.hypot(du, dv) || 1;
    // the tip is a sharp turn: push its outer corner out, keep the inner one shallow
    const k = i === 7 ? 1.5 : 1;
    L.push([u - (dv / n) * w * k, v + (du / n) * w * k]); R.push([u + (dv / n) * w * (i === 7 ? 0.2 : 1), v - (du / n) * w * (i === 7 ? 0.2 : 1)]);
  });
  return [...L, ...R.reverse()];
}
const OUT = ribbon(1.5);

function brace(p: Pen, cx: number, flip: 1 | -1, zc: number) {
  const at = (y: number): V3[] => OUT.map(([u, v]) => [cx + flip * u, y, zc + v] as V3);
  p.face(at(-2.6), SH.right, 0); // its depth: the same shape a step back
  p.face(at(-1.3), 0.1, 0);
  p.face(at(0), 0.3, SH.edge, 0.6);
}

export const braces: Illustration = {
  k: "braces", name: "Curly braces", title: "No snippets yet", body: "Save a piece of code you use often and it will be kept here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 26, 9, 0.1);
    p.rotate("z", -0.5);
    p.scale(1.12, [0, 0, 13]);
    const zc = 13.5, gap = 10.5 + 1.1 * (0.5 - 0.5 * Math.cos(u * Math.PI * 2));
    brace(p, -gap, 1, zc);
    // three dots: each one swells and lights in turn
    for (let i = 0; i < 3; i++) {
      const d = Math.abs(((u - 0.2 - i * 0.2 + 1.5) % 1) - 0.5), k = Math.max(0, 1 - d / 0.16);
      const x = (i - 1) * 5.2, r = 1.25 + 0.75 * k;
      p.ringV("y", [x, -1.2, zc - 5 + 1.6 * k], r, SH.right, 0);
      p.ringV("y", [x, 0, zc - 5 + 1.6 * k], r, 0.16 + 0.84 * k, 0);
    }
    brace(p, gap, -1, zc);
  },
};
