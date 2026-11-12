// No sellers yet: a market stall, a counter under a striped canopy on four poles with an empty crate. Hover and fruit pops onto the counter and into the crate while the price board swings.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 12, Y = 5, C = 9, R0 = 21, R1 = 27.5, OX = X + 2, OY = Y + 2.5;
// where the fruit lands: three in a pile on the counter, three in the crate
const FRUIT: V3[] = [[-8.6, 1, C + 1.5], [-5.4, 1, C + 1.5], [-7, 1, C + 4], [4.6, 0.2, C + 2.9], [7.8, 0.2, C + 2.9], [6.2, 0.2, C + 5.2]];

export const vendor: Illustration = {
  k: "vendor", name: "Market stall", title: "No sellers yet", body: "Invite a seller to set up shop. Their stall will open here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13.5);
    p.shadow(0, 1, 30, 14, 0.11);
    // the back poles
    p.line([[-X, -Y, C], [-X, -Y, R0]], 0.6, 0.6);
    p.line([[X, -Y, C], [X, -Y, R0]], 0.6, 0.6);
    // the counter: planks on the front under a lip
    p.box(-X, -Y, 0, X * 2, Y * 2, C, { lw: 0.6 });
    p.line([[-X, Y + 0.03, C - 1.6], [X, Y + 0.03, C - 1.6]], SH.edge, 0.5);
    for (const x of [-6, 0, 6]) p.line([[x, Y + 0.03, 0.5], [x, Y + 0.03, C - 1.6]], 0.45, 0.4);
    // the crate, empty at rest
    p.box(2.4, -3, C, 7.6, 6, 2.8, { open: true });
    // the fruit pops in, piece by piece
    FRUIT.forEach((f, i) => {
      const b = clamp((h - 0.08 - 0.1 * i) / 0.3);
      if (b <= 0) return;
      const pop = b < 0.65 ? ease(b / 0.65) * 1.2 : 1.2 - 0.2 * ease((b - 0.65) / 0.35);
      p.dot(f, 1.6 * pop, 0.8);
      p.dot([f[0] - 0.5, f[1], f[2] + 0.5], 0.45 * pop, 0.02);
    });
    if (h > 0.4) p.face([[2.4, 3, C], [10, 3, C], [10, 3, C + 2.8], [2.4, 3, C + 2.8]], SH.left, SH.edge, 0.55); // the crate's front, over the fruit in it
    // the front poles
    p.line([[-X, Y, C], [-X, Y, R0]], SH.edge, 0.8);
    p.line([[X, Y, C], [X, Y, R0]], SH.edge, 0.8);
    // the canopy: the far slope just showing over the ridge, then the striped near slope
    p.face([[-OX, -OY, R0], [OX, -OY, R0], [OX, 0, R1], [-OX, 0, R1]], 0.1, 0);
    const N = 7, w = (OX * 2) / N;
    for (let i = 0; i < N; i++) {
      const a = -OX + i * w, b = a + w, lit = i % 2 === 0;
      p.face([[a, OY, R0], [b, OY, R0], [b, 0, R1], [a, 0, R1]], lit ? 0.32 : 0.04, 0);
      const hem: V3[] = [[a, OY, R0], [b, OY, R0], ...Array.from({ length: 9 }, (_, j) => { const u = (Math.PI * j) / 8; return [a + w / 2 + (Math.cos(u) * w) / 2, OY, R0 - 1.2 - Math.sin(u) * 1.5] as V3; })];
      p.face(hem, lit ? 0.26 : 0.035, 0);
    }
    p.face([[OX, -OY, R0], [OX, OY, R0], [OX, 0, R1]], SH.right, SH.edge, 0.55); // the gable end
    p.line([[-OX, 0, R1], [OX, 0, R1]], SH.edge, 0.7);
    p.line([[-OX, OY, R0], [OX, OY, R0]], SH.edge, 0.6);
    p.line([[-OX, OY, R0], [-OX, 0, R1]], SH.edge, 0.6);
    // the price board hanging under the canopy, swinging while hovered
    p.push();
    p.rotate("y", Math.sin(t * 3.2) * 0.16 * h, [-6, OY, R0 - 1.5]);
    p.line([[-8, OY, R0 - 1.5], [-8, OY, R0 - 4]], SH.edge, 0.45);
    p.line([[-4, OY, R0 - 1.5], [-4, OY, R0 - 4]], SH.edge, 0.45);
    p.face([[-9.4, OY, R0 - 4], [-2.6, OY, R0 - 4], [-2.6, OY, R0 - 8.4], [-9.4, OY, R0 - 8.4]], 0.3, SH.edge, 0.5);
    p.line([[-8, OY + 0.03, R0 - 6.2], [-4, OY + 0.03, R0 - 6.2]], 0.02, 0.8);
    p.pop();
  },
};
