// Webcam: a webcam on its stand, the lens shut. Hover and the lens opens, the head tips up a little and its light comes on.
import { SH, type Illustration } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 12, D = 4.4, Z0 = 11, HH = 12.5; // the head: half width, half depth, underside, height

export const webcam: Illustration = {
  k: "webcam", name: "Webcam", title: "No camera found", body: "Connect a camera and allow access to see yourself here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 1, 22, 11, 0.11);
    p.rotate("z", -0.5);
    // the foot and the neck
    p.box(-8, -6, 0, 16, 12, 2);
    p.box(-1.8, -1.8, 2, 3.6, 3.6, Z0 - 2, { top: 0.2, left: 0.16, right: 0.08 });
    // the head: tips up a touch on hover
    const k = ease(clamp(h / 0.6));
    p.push();
    p.rotate("x", -0.12 * k, [0, 0, Z0]);
    p.box(-W, -D, Z0, W * 2, D * 2, HH, { top: 0.22, left: 0.2, right: 0.065, lw: 0.6 });
    const y = D + 0.03, zc = Z0 + HH / 2;
    // the lens: a dark barrel, a lit ring, and the glass that opens
    p.ringV("y", [0, y, zc], 5.6, 0.02, SH.edge, 0.6);
    p.ringV("y", [0, y + 0.02, zc], 4.3, 0.3 + 0.2 * k, 0);
    p.ringV("y", [0, y + 0.04, zc], 0.9 + 2.2 * k, 0.02, 0);
    if (k > 0.5) p.dot([-1, y + 0.06, zc + 1], 0.7, (k - 0.5) * 2);
    // the shutter: a bar across the lens that slides away
    if (k < 0.98) p.face([[-4.3 + 8.6 * k, y + 0.05, zc - 0.9], [4.3, y + 0.05, zc - 0.9], [4.3, y + 0.05, zc + 0.9], [-4.3 + 8.6 * k, y + 0.05, zc + 0.9]], 0.02, 0);
    // the light
    const on = clamp((h - 0.55) / 0.2);
    p.dot([W - 2.6, y, Z0 + HH - 2.6], 1 + 0.25 * on * Math.sin(t * 5), on > 0 ? on : 0);
    p.dot([-W + 2.6, y, Z0 + HH - 2.6], 0.6, 0);
    p.pop();
  },
};
