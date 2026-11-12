// Spending limit: a round limit sign on a post, a currency mark inside its ring, and a short stack of coins beside it. Hover and more coins drop onto the stack until a cap comes down and stops it.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const SR = 10.5, SZ = 25; // the sign: its radius and the height of its centre
const CX = 13, CY = -6, CR = 4.8, CH = 2.3; // the coin stack
// a currency mark as one stroke, in [u, v]
const MARK: [number, number][] = [[2.4, 2.5], [1.3, 3.6], [-1.3, 3.6], [-2.4, 2.5], [-2.4, 1.1], [-1.3, 0.1], [1.3, -0.1], [2.4, -1.1], [2.4, -2.5], [1.3, -3.6], [-1.3, -3.6], [-2.4, -2.5]];
const arc = (cx: number, cy: number, z: number, r: number, a0: number, a1: number): V3[] =>
  Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const limit: Illustration = {
  k: "limit", name: "Spending limit", title: "No limits set", body: "Set a daily or monthly limit and we will stop any spending that goes past it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-5, 4, -17);
    p.shadow(0, 0, 13, 7, 0.11);
    p.shadow(CX, CY, 10, 5.5, 0.1);
    // the post on its foot
    p.cylinder(0, 0, 0, 5.6, 1.6, { side: 0.12, top: 0.2 });
    p.box(-1, -1, 1.6, 2, 2, SZ - SR, { top: 0.2, left: 0.13, right: 0.065 });
    p.push();
    p.rotate("z", -0.5); // turned to face us
    // the sign: a thick disc facing us, a ring cut into it and the mark in the middle
    for (let i = 0; i <= 4; i++) p.ringV("y", [0, -0.6 + i * 0.4, SZ], SR, SH.right, 0);
    p.ringV("y", [0, 1.2, SZ], SR, 0.22, 0);
    const y = 1.25;
    p.ringV("y", [0, y, SZ], SR - 2.5, 0, SH.edge, 1);
    p.line(MARK.map(([u, v]) => [u, y, SZ + v * 1.05] as V3), SH.edge, 1);
    p.line([[0, y, SZ + 5.2], [0, y, SZ - 5.2]], SH.edge, 0.8);
    p.pop();
    // the coins: two at rest, two more on hover
    const coin = (z: number, a = 1) => {
      p.cylinder(CX, CY, z, CR, CH, { side: 0.12 * a, top: 0.22 * a, edge: a });
      p.line(arc(CX, CY, z, CR, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 0.5);
      p.line(arc(CX, CY, z + CH + 0.02, CR - 1.4, 0, Math.PI * 2), SH.edge, 0.55);
    };
    for (let j = 0; j < 2; j++) coin(j * CH);
    for (let j = 0; j < 2; j++) {
      const k = clamp((h - 0.05 - j * 0.2) / 0.3);
      if (k > 0) coin((2 + j) * CH + 22 * (1 - k * k), Math.min(1, k * 3));
    }
    // the cap: a bright plate that comes down on the stack and stays
    const c = clamp((h - 0.58) / 0.3);
    if (c > 0) {
      const z = 4 * CH + 0.9 + 14 * (1 - ease(c));
      p.cylinder(CX, CY, z, CR + 1.5, 1, { side: 0.2 * c, top: 0.34 * c, edge: c });
      p.line(arc(CX, CY, z, CR + 1.5, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 0.5);
    }
  },
};
