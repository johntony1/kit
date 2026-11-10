// No stations: a retro radio with a speaker grille and a lit tuning dial. Hover and the knob turns, the needle sweeps, the antenna rises and sound comes out.
import { type Illustration, type Pen, type V3 } from "../dots";

const X0 = -13, X1 = 13, Y0 = -5, Y1 = 4, Z1 = 14; // the body
const KX = 7.8, KZ = 4.2; // the tuning knob, on the front

/** a thin rod between two points: a flat strip facing the viewer, solid in every style */
function rod(p: Pen, a: V3, b: V3, w: number, fill: number) {
  const k = w * 0.5 * Math.SQRT1_2;
  p.face([[a[0] - k, a[1] + k, a[2]], [a[0] + k, a[1] - k, a[2]], [b[0] + k, b[1] - k, b[2]], [b[0] - k, b[1] + k, b[2]]], fill, 0);
}

export const radio: Illustration = {
  k: "radio", name: "Radio", title: "No stations yet", body: "Tune in to a station and save it to listen again later.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 32, 16, 0.12);
    const fy = Y1 + 0.02;
    // the antenna, hinged at the back right corner: folded down at rest, it rises and extends on hover
    const L = 7 + h * 9;
    const lean = 1.25 - h * 0.85;
    const base: V3 = [X1 - 2, Y0 + 1.2, Z1];
    const dir: V3 = [-Math.sin(lean) * 0.94, -0.34 * Math.sin(lean), Math.cos(lean)];
    // where it reaches when fully up
    const full = 1.25 - 0.85, fd: V3 = [-Math.sin(full) * 0.94, -0.34 * Math.sin(full), Math.cos(full)];
    p.guide([base, [base[0] + fd[0] * 16, base[1] + fd[1] * 16, base[2] + fd[2] * 16]]);
    // feet and the body
    p.box(X0 + 1.5, Y0 + 1, 0, 3, Y1 - Y0 - 2, 1, { top: 0.2, left: 0.14, right: 0.08 });
    p.box(X1 - 4.5, Y0 + 1, 0, 3, Y1 - Y0 - 2, 1, { top: 0.2, left: 0.14, right: 0.08 });
    p.box(X0, Y0, 1, X1 - X0, Y1 - Y0, Z1 - 1, { top: 0.14, left: 0.12, right: 0.065 });
    // a seam round the top
    p.line([[X0 + 1, Y1 - 1, Z1 + 0.02], [X1 - 1, Y1 - 1, Z1 + 0.02], [X1 - 1, Y0 + 1, Z1 + 0.02]], 1, 0.55);
    // the handle: two posts and a grip over the top
    p.box(-8, -1.2, Z1, 1.6, 1.6, 3.6, { top: 0.24, left: 0.24, right: 0.1 });
    p.box(-8, -1.2, Z1 + 3.6, 16, 1.6, 1.6, { top: 0.26, left: 0.24, right: 0.1 });
    p.box(6.4, -1.2, Z1, 1.6, 1.6, 3.6, { top: 0.24, left: 0.24, right: 0.1 });
    // the antenna: a chain of beads, a bright tip
    rod(p, base, [base[0] + dir[0] * L * 0.45, base[1] + dir[1] * L * 0.45, base[2] + dir[2] * L * 0.45], 1.5, 0.24);
    rod(p, base, [base[0] + dir[0] * L, base[1] + dir[1] * L, base[2] + dir[2] * L], 0.9, 0.24);
    p.dot([base[0] + dir[0] * L, base[1] + dir[1] * L, base[2] + dir[2] * L], 0.85, 1);

    // the speaker: a lit panel with slots cut across
    p.face([[X0 + 1.6, fy, 2.4], [-1.4, fy, 2.4], [-1.4, fy, Z1 - 1.6], [X0 + 1.6, fy, Z1 - 1.6]], 0.22, 1);
    for (let i = 0; i < 7; i++) {
      const z = 3.6 + i * 1.32;
      p.line([[X0 + 2.8, fy + 0.03, z], [-2.6, fy + 0.03, z]], 1, 0.6);
    }
    // the dial: a lit window with stations marked and a needle
    const dz0 = 7.6, dz1 = Z1 - 1.8, dx0 = 0.6, dx1 = X1 - 1.6;
    p.face([[dx0, fy, dz0], [dx1, fy, dz0], [dx1, fy, dz1], [dx0, fy, dz1]], 0.34, 1);
    for (let i = 0; i <= 10; i++) {
      const x = dx0 + 1 + i * ((dx1 - dx0 - 2) / 10);
      p.line([[x, fy + 0.03, dz1 - 0.6], [x, fy + 0.03, dz1 - (i % 2 ? 1.3 : 2)]], 1, 0.4);
    }
    p.line([[dx0 + 1, fy + 0.03, dz0 + 1.2], [dx1 - 1, fy + 0.03, dz0 + 1.2]], 1, 0.4);
    const nx = dx0 + 2.4 + (dx1 - dx0 - 4.8) * (h * 0.7 + h * 0.05 * Math.sin(t * 2));
    p.line([[nx, fy + 0.04, dz0 + 0.5], [nx, fy + 0.04, dz1 - 0.4]], 1, 0.75);
    // two knobs: volume, and the tuner that turns with the needle
    for (const [x, a] of [[2.8, -0.9 + h * 1.2], [KX, -2.2 + h * 4.4]] as [number, number][]) {
      p.ringV("y", [x, fy, KZ], 2, 0.24, 1, 0.5);
      p.ringV("y", [x, fy + 0.03, KZ], 1.1, 0.14, 1, 0.45);
      p.line([[x, fy + 0.05, KZ], [x + Math.cos(a) * 1.7, fy + 0.05, KZ + Math.sin(a) * 1.7]], 1, 0.6);
    }

    // sound off the speaker once it is tuned in
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0.05) {
      const [cx, cy] = p.pt([X0 + 1.6, fy, 8]);
      p.screen((g) => {
        g.lineCap = "round"; g.lineWidth = 0.9;
        for (let i = 0; i < 3; i++) {
          const a = k * (1 - i * 0.25) * (0.8 + 0.2 * Math.sin(t * 6 - i));
          if (a < 0.12) continue;
          const n = Math.round(255 * Math.min(1, a));
          g.strokeStyle = `rgb(${n},${n},${n})`;
          g.beginPath(); g.arc(cx + 1, cy, 4 + i * 3, Math.PI - 0.6, Math.PI + 0.6); g.stroke();
        }
      });
    }
  },
};
