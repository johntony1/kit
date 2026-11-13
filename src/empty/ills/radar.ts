// Scanning nearby: a round radar screen almost face on, three rings cut into its glass, on a small stand. The beam sweeps round and round, lighting blips as it passes.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3, R = 22, ZC = 27, G = R - 3.4; // seconds per sweep, radius of the bezel, height of the centre, radius of the glass
const BLIPS: [number, number][] = [[0.9, 12], [3.7, 8]]; // angle, distance from the centre

export const radar: Illustration = {
  k: "radar", name: "Radar", title: "Scanning nearby", body: "Looking for devices around you. They will appear here as soon as they are found.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, sweep = -u * Math.PI * 2;
    p.translate(0, 0, -22);
    p.shadow(0, 0, 22, 11, 0.12);
    p.rotate("z", -0.62);
    // the stand: a foot and a neck
    p.box(-8, -4, 0, 16, 8, 2.4, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    p.box(-2, -1.5, 2.4, 4, 3, 4, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // the body: its rim going back, then the lit bezel and the glass
    for (let d = 3; d > 0; d -= 0.4) p.ringV("y", [0, -d, ZC], R, 0.065, 0);
    p.ringV("y", [0, 0, ZC], R, 0.24, 0);
    p.ringV("y", [0, 0.03, ZC], G + 0.9, 0.02, 0);
    const y = 0.06;
    const at = (a: number, r: number): V3 => [Math.cos(a) * r, y + 0.04, ZC + Math.sin(a) * r];
    const bright = (pts: V3[], lw: number) => {
      if (p.ink) { p.line(pts, SH.edge, lw); return; }
      const q = pts.map((v) => p.pt(v));
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
        c.beginPath(); q.forEach(([x, yy], i) => (i ? c.lineTo(x, yy) : c.moveTo(x, yy))); c.stroke();
      });
    };
    p.ringV("y", [0, y, ZC], G, 0.03, 0);
    // three rings and a cross hair, bright on the dark glass
    bright(Array.from({ length: 49 }, (_, i) => at((i / 48) * Math.PI * 2, G * 0.33)), 1.1);
    bright(Array.from({ length: 49 }, (_, i) => at((i / 48) * Math.PI * 2, G * 0.66)), 1.1);
    bright([at(0, G - 0.5), at(Math.PI, G - 0.5)], 0.8);
    bright([at(Math.PI / 2, G - 0.5), at(-Math.PI / 2, G - 0.5)], 0.8);
    // the beam: a lit wedge that fades behind its leading edge
    const steps: [number, number][] = [[0.9, 0.12], [0.55, 0.22], [0.28, 0.4]];
    for (const [w, f] of steps) p.face([at(0, 0), ...Array.from({ length: 9 }, (_, k) => at(sweep + (w * k) / 8, G - 0.3))], f, 0);
    // the rings cut dark across the lit beam
    for (const r of [G * 0.33, G * 0.66]) p.line(Array.from({ length: 9 }, (_, k) => at(sweep + (0.9 * k) / 8, r)), SH.edge, 0.9);
    // the blips: a dark rim and a bright core, flaring as the beam passes, then fading until it comes round again
    for (const [a, r] of BLIPS) {
      const since = (((a - sweep) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const glow = Math.max(0, 1 - since / 4.5);
      if (glow > 0.05) { p.dot(at(a, r), 2.8 + 0.6 * glow, 0); p.dot(at(a, r), 1.4 + 0.8 * glow, 0.4 + 0.6 * glow); }
    }
    p.dot(at(0, 0), 1.5, 0);
  },
};
