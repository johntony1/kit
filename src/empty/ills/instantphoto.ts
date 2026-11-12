// Instant photo: two instant photos standing, the front one still blank. Hover and it lifts and shakes while a sun over two hills develops in its window.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10, H = 25; // half width and height of a photo

// one photo: a white card with a dark window and a deep border under it
function card(p: Pen, tone: number, dev: number) {
  p.box(-W, -0.5, 0, W * 2, 1, H, { top: 0.3, left: tone, right: 0.065, lw: 0.6 });
  const y = 0.53, x0 = -W + 1.8, x1 = W - 1.8, z0 = 7.2, z1 = H - 1.8;
  p.clear([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
  if (dev <= 0.15) return;
  // the picture comes up in steps: faint, then clear
  const f = dev < 0.45 ? 0.03 : dev < 0.75 ? 0.08 : 0.24, yy = y + 0.02;
  p.face(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [3.2 + Math.cos(a) * 2.5, yy, 18.4 + Math.sin(a) * 2.5] as V3; }), f, 0);
  p.face([[x0, yy, z0], [x0, yy, 11], [-3.6, yy, 15.6], [0.6, yy, 10.6], [3.4, yy, 13], [x1, yy, 9.4], [x1, yy, z0]], f, 0);
}

export const instantphoto: Illustration = {
  k: "instantphoto", name: "Instant photo", title: "No snapshots yet", body: "Take a snapshot and it will develop here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, -1, -15);
    p.shadow(0, 2, 28, 12, 0.1);
    p.rotate("z", -0.5);
    p.scale(1.12);
    // the photo behind, turned a little
    p.push();
    p.translate(5, -3.5, 0);
    p.rotate("x", 0.2);
    p.rotate("y", 0.2, [0, 0, 0]);
    card(p, 0.1, 0);
    p.pop();
    // the front one: lifts, shakes, develops
    const up = 3 * ease(Math.min(1, h / 0.4)), dev = Math.max(0, (h - 0.25) / 0.75);
    p.translate(-3, 2.5, up);
    p.rotate("x", 0.2);
    p.rotate("y", -0.1 + h * (1 - dev) * Math.sin(t * 14) * 0.12 * (h < 1 ? 1 : 0), [0, 0, H / 2]);
    card(p, 0.24, dev);
    p.line([[-W, 0.53, 0], [W, 0.53, 0]], SH.edge, 0.5);
  },
};
