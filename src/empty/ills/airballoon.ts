// Hot air balloon: a balloon in bold stripes with a basket hanging on ropes, floating over its shadow. It rises and sinks gently and the burner flares on the way up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6, N = 12, R = 14, ZC = 32; // loop seconds, gores round the balloon, its radius, height of its widest ring
const glow = (p: Pen, pts: V3[], lw = 1.2, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 1.2, v = 1) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw, v); };
// the envelope's profile from the crown down to the mouth: a dome over a longer taper
const PROF: [number, number][] = Array.from({ length: 19 }, (_, i) => {
  const f = (i / 18) * (Math.PI - 0.2);
  return [R * Math.sin(f), ZC + R * Math.cos(f) * (f > Math.PI / 2 ? 1.35 : 1)] as [number, number];
});

export const airballoon: Illustration = {
  k: "airballoon", name: "Hot air balloon", title: "No adventures yet", body: "Book an adventure and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, bob = Math.sin(u * Math.PI * 2) * 1.4, rise = Math.max(0, Math.cos(u * Math.PI * 2));
    p.translate(0, 0, -24);
    p.shadow(0, 0, 13 - bob, 6 - bob * 0.4, 0.12);
    p.translate(0, 0, 4 + bob);
    p.scale(0.92);
    // the gores, far ones first, in strong alternating tone
    const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => Math.cos(((a + 0.5) / N) * Math.PI * 2 - Math.PI / 4 - Math.PI / N) - Math.cos(((b + 0.5) / N) * Math.PI * 2 - Math.PI / 4 - Math.PI / N));
    for (const i of order) {
      const a0 = (i / N) * Math.PI * 2 + Math.PI / 4 - Math.PI / N, a1 = a0 + (Math.PI * 2) / N;
      const l: V3[] = PROF.map(([r, z]) => [Math.cos(a0) * r, Math.sin(a0) * r, z]);
      const rr: V3[] = PROF.map(([r, z]) => [Math.cos(a1) * r, Math.sin(a1) * r, z]);
      p.face([...l, ...rr.slice().reverse()], i % 2 ? 0.045 : 0.3, 0);
    }
    // bright seams between the gores that face us, so the dark ones keep their shape
    if (!p.ink) for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + Math.PI / 4 - Math.PI / N;
      if (Math.cos(a - Math.PI / 4) > -0.05) glow(p, PROF.map(([r, z]) => [Math.cos(a) * r, Math.sin(a) * r, z] as V3), 0.9);
    }
    // the mouth, the ropes and the basket
    const mz = PROF[PROF.length - 1][1], mr = PROF[PROF.length - 1][0];
    p.cylinder(0, 0, mz - 1.6, mr, 1.6, { side: 0.3, top: 0.3, edge: 0 });
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rod(p, [[sx * 4.2, sy * 4.2, 6.4], [sx * mr * 0.7, sy * mr * 0.7, mz - 1.6]], 1.2, sy < 0 && sx < 0 ? 0.6 : 1);
    if (rise > 0.05) p.dot([0, 0, mz - 3.4], 1 + rise * 1.3, 1);
    p.box(-4.6, -4.6, 0, 9.2, 9.2, 6.4, { top: 0.05, left: 0.3, right: 0.12, edge: 0 });
    for (const z of [2.1, 4.2]) p.line([[-4.6, 4.63, z], [4.63, 4.63, z], [4.63, -4.6, z]], SH.edge, 0.8);
  },
};
