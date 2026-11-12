// Nothing brewing: a round teapot with a spout, a handle and a knob on its lid. Steam curls out of the spout and the lid lifts a little as it simmers, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
const arc = (r: number, z: number, a0: number, a1: number, n = 22): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
/** a point in the plane that faces us: u across the screen, v up */
const flat = (u: number, v: number): V3 => [u * S2, -u * S2, v];
type Prof = [number, number][];

/** a turned shape on the origin: a dense side toward +y, a sparse side toward +x, bright outlines */
function lathe(p: Pen, prof: Prof, fl: number = SH.left, fr: number = SH.right) {
  const L = prof.map(([r, z]) => [-r * S2, r * S2, z] as V3), R = prof.map(([r, z]) => [r * S2, -r * S2, z] as V3);
  const [r0, z0] = prof[0], [r1, z1] = prof[prof.length - 1];
  if (p.ink) p.face([...arc(r0, z0, 3 * Q, -Q), ...R, ...arc(r1, z1, -Q, 3 * Q), ...L.slice().reverse()], fl, 0);
  else for (let i = 0; i < prof.length - 1; i++) {
    const [ra, za] = prof[i], [rb, zb] = prof[i + 1];
    p.face([...arc(ra, za, -Q, SPLIT), ...arc(rb, zb, -Q, SPLIT).reverse()], fr, 0);
    p.face([...arc(ra, za, SPLIT, 3 * Q), ...arc(rb, zb, SPLIT, 3 * Q).reverse()], fl, 0);
  }
  p.line(L, SH.edge, 0.6); p.line(R, SH.edge, 0.6); p.line(arc(r0, z0, -Q, 3 * Q), SH.edge, 0.6);
}
const BODY: Prof = [[6, 0], [6.4, 1], [9.4, 3], [11, 6.5], [11, 9.5], [9.6, 13], [7, 15.4], [5.6, 16]];
const SPOUT: [number, number][] = [[8, 3.5], [12.5, 4.5], [15.5, 9], [18.6, 14.4], [16.2, 15.4], [13.6, 11], [11, 10], [8.5, 11]];

export const teapot: Illustration = {
  k: "teapot", name: "Teapot", title: "Nothing brewing", body: "Orders being prepared will show up here. It is quiet for now.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(-1, 1, -11);
    p.shadow(0, 0, 27, 13, 0.12);
    // the handle: a thick loop on the left, in the plane that faces us
    const loop = (ru: number, rv: number, back: boolean): V3[] => Array.from({ length: 19 }, (_, i) => { const a = Math.PI / 2 + ((back ? 18 - i : i) / 18) * Math.PI; return flat(-8.6 + Math.cos(a) * ru, 9 + Math.sin(a) * rv); });
    p.face([...loop(7.6, 5.6, false), ...loop(5, 3.2, true)], 0.16, 0);
    p.line(loop(7.6, 5.6, false), SH.edge, 0.7);
    p.line(loop(5, 3.2, false), SH.edge, 0.6);
    // the spout, on the right
    p.face(SPOUT.map(([a, b]) => flat(a, b)), 0.1, SH.edge, 0.65);
    // the body, with a band around its widest part
    lathe(p, BODY);
    p.line(arc(11.03, 8, -Q, 3 * Q), SH.edge, 0.5);
    p.face(arc(5.6, 16, 0, Math.PI * 2, 40), SH.top, SH.edge, 0.55);
    // the lid: it lifts and settles twice a loop
    const lift = Math.max(0, Math.sin(u * Math.PI * 4)) * 0.9;
    p.push();
    p.translate(0, 0, lift);
    lathe(p, [[5, 16], [4.4, 17.6], [2, 18.6], [1, 18.8]], 0.2, 0.12);
    lathe(p, [[0.9, 18.8], [1.9, 19.8], [1.9, 20.8], [0.8, 21.6]], 0.3, 0.2);
    p.pop();
    // steam from the spout: three wisps that rise, curl and fade
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      for (let i = 0; i < 3; i++) {
        const k = (u + i / 3) % 1, a = Math.sin(k * Math.PI);
        if (a < 0.05) continue;
        const pts = Array.from({ length: 13 }, (_, j) => { const s = j / 12; return p.pt(flat(18 + (i - 1) * 1.6 + Math.sin(s * 4.6 + k * 6 + i * 1.9) * (0.8 + s * 1.4), 16.5 + k * 9 + s * 7)); });
        const n = Math.round(255 * Math.min(1, a * 1.2));
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.1;
        c.beginPath(); pts.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    });
  },
};
