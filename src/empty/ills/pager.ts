// No pages received: a chunky pager seen front on, a wide bright screen strip, a long key and two round ones, a belt clip on top. Hover and it buzzes, a number comes up on the screen and a dot pops on its corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const K = 1 / 1.2247; // it faces us square on, so x is drawn a little short to keep round things round
const W = 20, H = 28, D = 3.6, F = D + 0.03; // half width, height, half depth
const v = (x: number, z: number, y = F): V3 => [x * K, y, z];
// a rounded rectangle on the front
const rr = (x0: number, z0: number, x1: number, z1: number, r: number, y = F): V3[] => {
  const out: V3[] = [], c: [number, number, number][] = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 0.5], [x0 + r, z0 + r, 1], [x1 - r, z0 + r, 1.5]];
  for (const [cx, cz, q] of c) for (let i = 0; i <= 5; i++) { const a = (q + i / 10) * Math.PI; out.push(v(cx + Math.cos(a) * r, cz + Math.sin(a) * r, y)); }
  return out;
};
// seven segment digits, cut dark into the bright screen
const SEG: Record<string, string> = { "0": "abcdef", "7": "abc", "-": "g" };
function digit(p: Pen, ch: string, x: number, z: number) {
  const w = 7.6, hh = 8.8, s = 2, y = F + 0.06;
  const r = (x0: number, z0: number, x1: number, z1: number) => p.clear([v(x + x0, z + z0, y), v(x + x1, z + z0, y), v(x + x1, z + z1, y), v(x + x0, z + z1, y)]);
  for (const g of SEG[ch]) {
    if (g === "a") r(0, hh - s, w, hh);
    if (g === "b") r(w - s, hh / 2, w, hh);
    if (g === "c") r(w - s, 0, w, hh / 2);
    if (g === "d") r(0, 0, w, s);
    if (g === "e") r(0, 0, s, hh / 2);
    if (g === "f") r(0, hh / 2, s, hh);
    if (g === "g") r(0, hh / 2 - s / 2, w, hh / 2 + s / 2);
  }
}

export const pager: Illustration = {
  k: "pager", name: "Pager", title: "No pages received", body: "Pages sent to you will show here. Share your number so people can reach you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const on = h > 0.3, buzz = h > 0.05 && h < 0.98 ? Math.sin(t * 46) * 0.6 * Math.sin(h * Math.PI) : 0;
    p.translate(0, 0, -15);
    p.shadow(0, 3, 26, 9, 0.12);
    p.rotate("z", -Math.PI / 4);
    p.translate(buzz, 0, 0);
    // the belt clip, a lit lip standing up behind the body
    p.box(-10 * K, -D - 1.6, H - 6, 20 * K, 1.6, 8, { top: 0.14, left: 0.3, right: 0.07, edge: 0 });
    // the body: a rounded brick, lit on top, its face in half tone
    if (p.ink) p.face(rr(-W, 0, W, H, 4, -D), 0.2, 0);
    else for (let y = -D; y < D; y += 0.5) p.face(rr(-W, 0, W, H, 4, y), 0.3, 0);
    const body = rr(-W, 0, W, H, 4, D);
    p.face(body, 0.12, 0);
    p.line([...body, body[0]], SH.edge, 0.6);
    // the screen: a dark bezel, then the bright strip
    p.clear(rr(-17.2, 11.4, 17.2, 25.4, 1.8));
    p.face(rr(-15.8, 12.8, 15.8, 24, 0.8, F + 0.03), 0.3, 0);
    const msg = on ? "707" : "---";
    for (let i = 0; i < 3; i++) digit(p, msg[i], -14 + i * 10.2, 14);
    // a long key and two round ones, each bright in a dark well
    p.clear(rr(-17.2, 2.4, -2, 9, 3.2));
    p.face(rr(-15.8, 3.8, -3.4, 7.6, 1.9, F + 0.03), 0.3, 0);
    for (const x of [4.2, 12.8]) {
      p.clear(rr(x - 3.6, 2.1, x + 3.6, 9.3, 3.55));
      p.face(rr(x - 2.3, 3.4, x + 2.3, 8, 2.25, F + 0.03), 0.3, 0);
    }
    // a new page: a bright dot pops on the corner
    const b = clamp((h - 0.6) / 0.4);
    if (b > 0) {
      const s = b < 0.6 ? (b / 0.6) * 1.2 : 1.2 - 0.2 * ((b - 0.6) / 0.4);
      p.dot(v(W - 2.4, H - 1.6, F + 0.1), 4.6 * s, 0);
      p.dot(v(W - 2.4, H - 1.6, F + 0.1), 3.3 * s, 1);
    }
  },
};
