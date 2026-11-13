// No bugs caught: a butterfly net, a big round hoop on a long diagonal handle and a deep mesh bag hanging behind it. Hover and the net swings, and a small bug flutters inside the mouth.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HC: V3 = [6, 0, 33]; // the hoop's centre
const R = 12.5; // hoop radius
const V: V3 = [0, 1, 0.12]; // the hoop's second axis: the hoop lies nearly flat, its mouth open to the sky

export const bugnet: Illustration = {
  k: "bugnet", name: "Bug net", title: "No bugs caught", body: "When a test fails or an error is reported, the bug will land here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(-2, 2, 26, 10, 0.11);
    p.rotate("z", -0.42);
    const k = ease(Math.min(1, h / 0.7));
    p.rotate("y", Math.sin(k * Math.PI) * 0.18 + h * Math.sin(t * 2.4) * 0.025, [-22, 2, 2]);
    const on = (a: number, r: number): V3 => [HC[0] + Math.cos(a) * r, HC[1] + Math.sin(a) * r * V[1], HC[2] + Math.sin(a) * r * V[2]];
    const ring = (r: number, n = 48) => Array.from({ length: n + 1 }, (_, i) => on((i / n) * Math.PI * 2, r));
    // the bag: a deep rounded sack hanging from the hoop, solid with a few mesh cuts across its front
    const sway = -Math.sin(k * Math.PI) * 3;
    const lvl = (f: number, a: number): V3 => {
      const r = (R - 0.6) * Math.pow(Math.cos((f * Math.PI) / 2), 0.6);
      return [HC[0] + (1 + sway) * f + Math.cos(a) * r, HC[1] + 2 * f + Math.sin(a) * r * V[1], HC[2] - 24 * f + Math.sin(a) * r * V[2]];
    };
    const F = 10, A = 32;
    for (let j = 0; j < F; j++) for (let i = 0; i < A; i++) {
      const a0 = (i / A) * Math.PI * 2, a1 = ((i + 1) / A) * Math.PI * 2, f0 = j / F, f1 = (j + 1) / F;
      p.face([lvl(f0, a0), lvl(f0, a1), lvl(f1, a1), lvl(f1, a0)], 0.2, 0);
    }
    const mid = Math.PI / 4 + 0.42, span = (i: number, n: number) => mid - 1.25 + (2.5 * i) / n;
    for (let i = 0; i <= 5; i++) p.line(Array.from({ length: 11 }, (_, j) => lvl(j / 10.5, span(i, 5))), SH.edge, 0.6);
    for (const f of [0.38, 0.68]) p.line(Array.from({ length: 17 }, (_, i) => lvl(f, span(i, 16) - 0.25 + 0.5 * (i / 16))), SH.edge, 0.6);
    // the open mouth, dark inside
    p.face(ring(R - 0.6), 0.035, 0);
    // a bug flutters in the mouth on hover
    const b = Math.max(0, (h - 0.45) / 0.55);
    if (b > 0) {
      const s = Math.min(1, b * 1.6);
      const c = on(0.4 + Math.sin(t * 1.7) * 0.25, 3 + Math.sin(t * 2.3) * 1.2);
      const [x, y] = p.pt(c);
      const flap = 0.55 + 0.45 * Math.abs(Math.sin(t * 14));
      p.screen((g) => {
        g.fillStyle = "#fff";
        for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * 2.3 * s, y - 1 * s, 2.1 * s, 1.5 * s * flap, d * 0.5, 0, Math.PI * 2); g.fill(); }
        g.beginPath(); g.ellipse(x, y + 0.4 * s, 1 * s, 2.2 * s, 0, 0, Math.PI * 2); g.fill();
      });
    }
    // the hoop: a thick bright band
    const outer = ring(R + 1.3), inner = ring(R - 0.6);
    p.face([...outer, ...inner.slice().reverse()], 0.42, 0);
    // the handle: a long bright rod down to the floor, a thicker grip at its end
    const h0 = p.pt(on(Math.PI, R + 0.5)), h1 = p.pt([-22, 2, 1.5]), g0 = p.pt([-16.5, 0.8, 7.5]);
    p.screen((g) => {
      g.lineCap = "round";
      g.strokeStyle = "#000"; g.lineWidth = 3.4; g.beginPath(); g.moveTo(h0[0], h0[1]); g.lineTo(h1[0], h1[1]); g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.moveTo(h0[0], h0[1]); g.lineTo(h1[0], h1[1]); g.stroke();
      g.lineWidth = 3.6; g.beginPath(); g.moveTo(g0[0], g0[1]); g.lineTo(h1[0], h1[1]); g.stroke();
    });
  },
};
