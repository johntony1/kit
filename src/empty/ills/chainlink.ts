// Chain link: two chunky chain links, one hooked through the other. Hover and they pull tight with a tug and a spark.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const DX = 2, DY = 2.3; // how far the back of each link sits, up and to the right
const S = 7, RO = 8.6, RI = 4.1; // a link: straight half length, outer and inner radius
const TH = 0.5, CT = Math.cos(TH), ST = Math.sin(TH); // the chain's slope
/** half a capsule end, centred on (cx, 0), from angle a0 to a1 */
const arc = (cx: number, r: number, a0: number, a1: number, n = 16): P2[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, Math.sin(a) * r] as P2; });
const cap = (r: number): P2[] => [...arc(S, r, -Math.PI / 2, Math.PI / 2), ...arc(-S, r, Math.PI / 2, Math.PI * 1.5)];
// the walls we can see along an outline (sg 1: an outer edge, -1: the edge of a hole)
function walls(p: Pen, pts: P2[], sg: number, closed = true) {
  // in runs of one tone, so each reads as one surface
  let run: P2[] = [], tone = 0;
  const flush = () => { if (run.length > 1) p.face([...run.map(B), ...run.slice().reverse().map(([x, y]) => B([x + DX, y + DY]))], tone, 0); run = []; };
  for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = ((y1 - y0) * sg) / L, ny = (-(x1 - x0) * sg) / L;
    if (nx * DX + ny * DY <= 0.001) { flush(); continue; }
    const tn = ny > 0.45 ? 0.11 : 0.06;
    if (run.length && tn !== tone) flush();
    if (!run.length) { run.push([x0, y0]); tone = tn; }
    run.push([x1, y1]);
  }
  flush();
}

export const chainlink: Illustration = {
  k: "chainlink", name: "Chain link", title: "No links yet", body: "Links you create or save will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // a tug: apart until they pull tight, a small shake, then held
    const k = cl(h / 0.8), d = 9.9 + 1.1 * Math.sin(cl(k / 0.6) * Math.PI * 0.5) + (k > 0.6 ? Math.sin(((k - 0.6) / 0.4) * Math.PI * 2) * 0.35 * (1 - k) * 2.5 : 0);
    p.push(); p.translate(0, 0, -21); p.shadow(0, 0, 27, 11, 0.12); p.pop();
    const at = (dx: number) => ([x, y]: P2): P2 => [(x + dx) * CT - y * ST - 1, (x + dx) * ST + y * CT - 1];
    const link = (dx: number) => {
      const o = cap(RO).map(at(dx)), i = cap(RI).map(at(dx));
      walls(p, i, -1); walls(p, o, 1);
      p.face([...o, o[0], i[0], ...i.slice().reverse()].map(B), 0.26, 0);
      p.line([...o, o[0]].map(B), SH.edge, 0.8);
      p.line([...i, i[0]].map(B), SH.edge, 0.8);
    };
    link(-d);
    link(d);
    // where the first link passes over the second: that stretch of it again, on top
    const a0 = 0.42, a1 = Math.PI / 2, f = at(-d);
    const o = [...arc(S, RO, a0, a1, 12), [S - 3.2, RO] as P2].map(f), i = [...arc(S, RI, a0, a1, 12), [S - 3.2, RI] as P2].map(f);
    walls(p, o, 1, false);
    p.face([...o, ...i.slice().reverse()].map(B), 0.26, 0);
    p.line(o.map(B), SH.edge, 0.8);
    p.line(i.map(B), SH.edge, 0.8);
    const s = cl((h - 0.62) / 0.25);
    if (s > 0) ([[-10, 15], [9, -17]] as P2[]).forEach((q, j) => p.dot(B(q), (1.3 + 0.4 * Math.sin(t * 3.4 + j * 2.1)) * s, 1));
  },
};
