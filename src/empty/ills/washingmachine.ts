// No loads running: a front loading washing machine with a dial and a soap drawer, its round door glass showing the drum. The washing tumbles round and round in sudsy water.
import { type Illustration, type V3 } from "../dots";

const P = 3; // seconds per turn of the drum
const W = 12.5, D = 11, H = 29, DZ = 12, DR = 10; // half width, half depth, height, door centre height and rim radius
const ring = (c: V3, r: number, n = 40, a0 = 0, a1 = Math.PI * 2): V3[] => Array.from({ length: n }, (_, i) => { const a = a0 + ((a1 - a0) * i) / (n - 1); return [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r] as V3; });

export const washingmachine: Illustration = {
  k: "washingmachine", name: "Washing machine", title: "No loads running", body: "Start a job and you can watch its progress here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, a = u * Math.PI * 2;
    p.translate(0, 0, -14);
    p.shadow(0, 0, 27, 13, 0.11);
    p.rotate("z", -0.5); // turned so its front faces us
    p.translate(Math.sin(a * 6) * 0.2, 0, 0); // a little shake
    // the body: a lit top, a bright front, a side in shade
    p.box(-W, -D, 1, 2 * W, 2 * D, H - 1, { top: 0.24, left: 0.2, right: 0.06, edge: 0 });
    for (const x of [-W + 1, W - 3]) p.box(x, D - 2.5, 0, 2, 2, 1, { top: 0.2, left: 0.06, right: 0.05, edge: 0 });
    const F = D + 0.04;
    p.line([[-W, F, H - 6.5], [W, F, H - 6.5], [W + 0.03, -D, H - 6.5]], 1, 0.9);
    // the soap drawer, the lights and the dial
    p.face([[-W + 2, F, H - 5], [-W + 8.5, F, H - 5], [-W + 8.5, F, H - 1.5], [-W + 2, F, H - 1.5]], 0.04, 0);
    p.face([[-W + 2.6, F + 0.02, H - 4.3], [-W + 7.9, F + 0.02, H - 4.3], [-W + 7.9, F + 0.02, H - 3.2], [-W + 2.6, F + 0.02, H - 3.2]], 0.3, 0);
    for (const x of [-1, 1.6]) p.dot([x, F, H - 3.2], 0.8, 0);
    p.face(ring([W - 4.5, F, H - 3.2], 2.5), 0.04, 0);
    p.face(ring([W - 4.5, F + 0.02, H - 3.2], 1.4), 0.3, 0);
    // the door: a bright rim round dark glass
    p.face(ring([0, F, DZ], DR), 0.3, 0);
    p.line([...ring([0, F + 0.02, DZ], DR, 41)], 1, 0.8);
    const C: V3 = [0, F + 0.04, DZ], RG = 7.6;
    p.face(ring(C, RG), 0.035, 0);
    // the water in the drum, its surface rocking
    const wl = -2.2 + Math.sin(a * 2) * 0.6, aw = Math.asin(Math.max(-1, Math.min(1, wl / RG)));
    p.face(ring(C, RG, 30, Math.PI - aw, Math.PI * 2 + aw), 0.1, 0);
    // the washing: three bright pieces tumbling round
    for (let i = 0; i < 3; i++) {
      const g = -a + (i / 3) * Math.PI * 2, rr = 3.9, cx = Math.cos(g) * rr, cz = DZ + Math.sin(g) * rr, tw = g * 1.7;
      p.face(Array.from({ length: 14 }, (_, j) => { const b = (j / 14) * Math.PI * 2, x = Math.cos(b) * 2.6, z = Math.sin(b) * 1.5; return [cx + x * Math.cos(tw) - z * Math.sin(tw), C[1] + 0.02, cz + x * Math.sin(tw) + z * Math.cos(tw)] as V3; }), 0.3, 0);
    }
    // a glare across the glass
    const gl = ring(C, RG - 1.2, 10, 2.1, 2.9).map((v) => p.pt(v));
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.lineCap = "round"; g.beginPath(); gl.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
  },
};
