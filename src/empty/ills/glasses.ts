// No eye tests: a pair of round glasses standing on their rims. Hover and they lift a little while a glint sweeps across the lenses and a sparkle lands.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 7.8, RL = 5.9, Y = 7, ZL = R + 0.4; // rim and lens radius, the front's plane, the lens centre height
function sparkle(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#fff"; g.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.fill();
  });
}

export const glasses: Illustration = {
  k: "glasses", name: "Glasses", title: "No eye tests", body: "Add an eye test or a prescription and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h / 0.5));
    p.translate(0, -3, -9);
    p.scale(1.12);
    p.shadow(0, -2, 30 - 3 * e, 13, 0.11);
    p.rotate("z", -0.5);
    p.translate(0, 0, 3 * e + h * Math.sin(t * 2) * 0.5);
    // the temple arms: run back from the hinges and hook down
    for (const x of [-17.6, 16.6]) {
      p.box(x, -17, ZL - 3.4, 1, 2.4, 6.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
      p.box(x, -17, ZL + 1.6, 1, 23, 1.6, { top: 0.22, left: 0.12, right: 0.065, lw: 0.5 });
    }
    // the bridge
    const arc = (r: number, a0: number, a1: number): V3[] => Array.from({ length: 9 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 8; return [Math.cos(a) * r, Y, ZL - 0.4 + Math.sin(a) * r] as V3; });
    p.face([...arc(3.9, 0.55, Math.PI - 0.55), ...arc(2.5, Math.PI - 0.4, 0.4)], 0.22, SH.edge, 0.5);
    // the rims, with dark lenses
    const s = clamp((h - 0.15) / 0.6), gu = -RL * 0.62 + RL * 1.2 * ease(s);
    for (const x of [-9.4, 9.4]) {
      p.ringV("y", [x, Y - 1.3, ZL], R, 0.065, 0);
      p.ringV("y", [x, Y, ZL], R, 0.22, SH.edge, 0.6);
      p.ringV("y", [x, Y + 0.02, ZL], RL, 0.03, SH.edge, 0.5);
      // the glint: a slanted streak, and a thinner one beside it
      for (const [du, w] of [[0, 1.5], [2.5, 0.7]] as const) {
        const u = gu + du, L = Math.sqrt(Math.max(0, RL * RL - u * u * 1.25)) * 0.74;
        if (L < 1) continue;
        const q = (v: number, d: number): V3 => [x + u + d + v * 0.5, Y + 0.04, ZL + v];
        p.face([q(-L, 0), q(-L, w), q(L, w), q(L, 0)], 0.3, 0);
      }
    }
    // the hinges at the outer corners
    for (const x of [-17.8, 16.4]) p.box(x, Y - 1.4, ZL + 1.2, 1.6, 1.5, 2.4, { top: 0.24, left: 0.16, right: 0.08, lw: 0.45 });
    const b = clamp((h - 0.6) / 0.4);
    sparkle(p, [16, Y, ZL + 12], 3.6 * ease(b) * (0.8 + 0.2 * Math.sin(t * 4)));
    sparkle(p, [-19, Y, ZL + 9], 2.2 * ease(b) * (0.8 + 0.2 * Math.sin(t * 4 + 2)));
  },
};
