// Nothing running: a chunky power switch with its cord and plug. Hover and the rocker flips from off to on and the light comes on.
import { SH, type Illustration, type V3 } from "../dots";

const W = 12, D = 8.5, H = 6.5; // half width, half depth, height of the housing

export const power: Illustration = {
  k: "power", name: "Power switch", title: "Nothing is running", body: "Turn the service on to start collecting data.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-3, -2, -4);
    p.shadow(0, 0, 30, 15, 0.12);
    p.shadow(19, 9, 8, 4, 0.1);
    // the cord, from the right wall to the plug on the floor
    const cord: V3[] = Array.from({ length: 16 }, (_, i) => {
      const k = i / 15;
      return [W + k * 9, -2 + k * 10 + Math.sin(k * Math.PI) * 3, 2.2 * (1 - k) * (1 - k) + 0.9] as V3;
    });
    p.line(cord, SH.edge, 1.4);
    p.line(cord, 0.25, 0.7);
    p.box(W + 7.5, 7.5, 0, 3.6, 3.6, 2.6, { top: 0.24, left: SH.left, right: SH.right });
    p.line([[W + 11.1, 8.5, 1.3], [W + 13, 8.5, 1.3]], SH.edge, 0.6);
    p.line([[W + 11.1, 10.1, 1.3], [W + 13, 10.1, 1.3]], SH.edge, 0.6);
    // the housing
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: SH.top, left: SH.left, right: SH.right });
    // the power mark and the light on the front wall
    const fy = D + 0.04, mx = -W + 5, mz = H / 2;
    p.line(Array.from({ length: 15 }, (_, i) => { const a = -Math.PI * 0.2 - (Math.PI * 1.6 * i) / 14 + Math.PI; return [mx + Math.cos(a) * 2.2, fy, mz - 0.3 + Math.sin(a) * 2.2] as V3; }), SH.edge, 0.9);
    p.line([[mx, fy, mz - 0.1], [mx, fy, mz + 2.4]], SH.edge, 0.9);
    p.dot([W - 3, fy, mz], 1.2, h > 0.5 ? 1 : 0.02);
    // the bezel: the dark well the rocker sits in
    p.face([[-8.5, -5.5, H + 0.02], [8.5, -5.5, H + 0.02], [8.5, 5.5, H + 0.02], [-8.5, 5.5, H + 0.02]], 0.03, SH.edge, 0.6);
    // the rocker, tilting on its middle: off presses the left half down, on the right half
    const a = -0.2 + h * 0.4;
    // where it will flip to: the rocker's on position, dashed, in the line style
    if (h < 0.5) {
      p.push(); p.rotate("y", 0.2, [0, 0, H]);
      p.guide([[-7.5, 4.5, H + 2.4], [7.5, 4.5, H + 2.4], [7.5, -4.5, H + 2.4]], true);
      p.pop();
    }
    p.push();
    p.rotate("y", a, [0, 0, H]);
    p.box(-7.5, -4.5, H - 0.4, 15, 9, 2.8, { top: h > 0.5 ? 0.34 : 0.22, left: SH.left, right: SH.right });
    const z = H + 2.42;
    p.line([[0, -4.5, z], [0, 4.5, z]], SH.edge, 0.55);
    // O on the left half, I on the right
    p.line(Array.from({ length: 25 }, (_, i) => { const b = (i / 24) * Math.PI * 2; return [-3.7 + Math.cos(b) * 2, Math.sin(b) * 2, z] as V3; }), SH.edge, 0.85);
    p.line([[3.7, -2.4, z], [3.7, 2.4, z]], SH.edge, 0.85);
    p.pop();
  },
};
