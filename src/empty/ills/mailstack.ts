// No mail yet: three envelopes standing in a staggered stack, the front one with its flap seams cut in. Hover and the two behind fan up out of the stack.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 15, Z = 20, T = 1.2; // half width, height, thickness

// one envelope standing in the x-z plane, its front at y = 0
function envelope(p: Pen, front: number, seams: boolean) {
  p.box(-X, -T, 0, X * 2, T, Z, { top: 0.26, left: front, right: SH.right, edge: SH.edge, lw: 0.55 });
  const y = 0.05;
  if (seams) {
    // the top flap, a V from the top corners, and the two lower seams
    p.line([[-X + 0.4, y, Z - 0.4], [0, y, Z * 0.42], [X - 0.4, y, Z - 0.4]], SH.edge, 0.9);
    p.line([[-X + 0.4, y, 0.4], [-4.5, y, Z * 0.36]], SH.edge, 0.7);
    p.line([[X - 0.4, y, 0.4], [4.5, y, Z * 0.36]], SH.edge, 0.7);
  }
}

export const mailstack: Illustration = {
  k: "mailstack", name: "Mail stack", title: "No mail yet", body: "Letters and messages sent to you will pile up here as they arrive.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.2));
    const bob = h > 0.9 ? Math.sin(t * 2.4) * 0.4 : 0;
    p.translate(-1, 0, -15);
    p.shadow(0, 0, 28, 11, 0.11);
    p.rotate("z", -0.5);
    // back to front: each envelope behind sits higher and further right, and fans up on hover
    const spots: [number, number, number, number][] = [[-8, 7 + 5 * k, 6 + 2 * k, 0.065], [-4, 3.5 + 2.5 * k, 3 + 1 * k, 0.12], [0, 0, 0, 0.24]];
    spots.forEach(([y, z, x, f], i) => {
      p.push();
      p.translate(x, y, z + (i < 2 ? bob * (2 - i) : 0));
      p.rotate("y", -0.1 * k * (2 - i), [0, 0, 0]);
      envelope(p, f, i === 2);
      p.pop();
    });
  },
};
