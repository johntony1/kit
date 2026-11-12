// Pill bottle: a bottle tipped on its side with its cap off, a couple of tablets spilled in front of it. Hover and more tablets hop out of the neck and land on the floor.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 8, X0 = -17, X1 = 7; // the bottle's radius and its two ends along x
const clamp = (x: number) => Math.max(0, Math.min(1, x));
/** a point on a cylinder lying along x, resting on the floor */
const surf = (x: number, a: number, r = R): V3 => [x, Math.cos(a) * r, R + Math.sin(a) * r];
const arc = (x: number, a0: number, a1: number, r = R, n = 14): V3[] => Array.from({ length: n + 1 }, (_, i) => surf(x, a0 + ((a1 - a0) * i) / n, r));
/** a band of the lying cylinder's wall between two angles */
const band = (p: Pen, x0: number, x1: number, a0: number, a1: number, fill: number, r = R) => p.face([...arc(x0, a0, a1, r), ...arc(x1, a1, a0, r)], fill, 0);
const A0 = -0.46, A1 = 2.68; // the part of the wall that faces us

function tablet(p: Pen, x: number, y: number, z: number) {
  p.cylinder(x, y, z, 3.5, 1.7, { side: 0.14, top: 0.4, lw: 0.5 });
}

export const pillbottle: Illustration = {
  k: "pillbottle", name: "Pill bottle", title: "No medication yet", body: "Add a medication and its doses and refills will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3, -3, -9);
    p.shadow(-2, 2, 30, 14, 0.12);
    // the cap, lying flat behind the neck
    p.cylinder(18, -11, 0, 6.8, 4, { side: 0.1, top: 0.24 });
    // the bottle, rocking a little while hovered
    p.push();
    p.rotate("x", h * Math.sin(t * 5) * 0.035, [0, 0, 0]);
    band(p, X0, X1, A0, 0.75, 0.11);
    band(p, X0, X1, 0.75, A1, 0.2);
    // the label: a pale wrap with a cross
    band(p, -12, 1, A0, A1, 0.34, R + 0.04);
    p.line(arc(-12, A0, A1, R + 0.06), SH.edge, 0.5);
    p.line(arc(1, A0, A1, R + 0.06), SH.edge, 0.5);
    p.line([surf(-8.4, 0.55, R + 0.1), surf(-2.6, 0.55, R + 0.1)], 0, 1.3);
    p.line(arc(-5.5, 0.18, 0.92, R + 0.1, 6), 0, 1.3);
    // the shoulder and the neck, then the open mouth
    p.ringV("x", [X1, 0, R], R, 0.065, 0);
    band(p, X1, X1 + 3.4, A0, 0.75, 0.13, 5.6);
    band(p, X1, X1 + 3.4, 0.75, A1, 0.24, 5.6);
    p.ringV("x", [X1 + 3.4, 0, R], 5.6, 0.3, 0);
    p.ringV("x", [X1 + 3.42, 0, R], 4.2, 0.02, 0);
    p.pop();
    // two tablets already on the floor
    tablet(p, 19, 6, 0);
    tablet(p, 8, 14, 0);
    // three more hop out of the neck in turn
    ([[27, 0, 0], [17, 13, 0], [26, 12, 0]] as const).forEach(([ex, ey, ez], i) => {
      const q = clamp((h - i * 0.2) / 0.55);
      if (q <= 0) return;
      const land = Math.min(1, q / 0.8), hop = q < 0.8 ? 0 : Math.sin(((q - 0.8) / 0.2) * Math.PI) * 1.2;
      const sx = X1 + 4;
      tablet(p, sx + (ex - sx) * land, ey * land, (R - 2) * (1 - land) + ez * land + 9 * 4 * land * (1 - land) * (1 - land * 0.6) + hop);
    });
  },
};
