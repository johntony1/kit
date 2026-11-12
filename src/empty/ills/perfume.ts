// No samples yet: a square glass perfume bottle with a round pump cap. Hover and the cap presses down and a fine mist drifts out to the side.
import { SH, type Illustration } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 8, D = 4.2, H = 15.5, F = D + 0.03;

export const perfume: Illustration = {
  k: "perfume", name: "Perfume bottle", title: "No samples yet", body: "Ask for a sample and it will show up here for you to try.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(4, -4, -12.5);
    p.shadow(0, 0, 22, 11, 0.12);
    p.scale(1.18);
    // the glass: thick walls, so the liquid sits inside an outline
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.06, right: 0.035, lw: 0.7 });
    p.face([[-W + 1.4, F, 1.4], [W - 1.4, F, 1.4], [W - 1.4, F, 10.6], [-W + 1.4, F, 10.6]], 0.22, 0); // the perfume
    p.line([[-W + 1.4, F, 10.6], [W - 1.4, F, 10.6]], SH.edge, 0.6);
    p.line([[-W + 1.4, F, 13.9], [W - 1.4, F, 13.9]], 0.5, 0.45);
    p.face([[W + 0.03, -D + 1.2, 1.4], [W + 0.03, D - 1.2, 1.4], [W + 0.03, D - 1.2, 10.6], [W + 0.03, -D + 1.2, 10.6]], 0.1, 0);
    // the label: a dark plate with one bright line
    p.clear([[-4, F + 0.01, 3.4], [4, F + 0.01, 3.4], [4, F + 0.01, 8.2], [-4, F + 0.01, 8.2]]);
    p.line([[-2.2, F + 0.03, 5.8], [2.2, F + 0.03, 5.8]], SH.edge, 0.8);
    // the neck and the pump cap, which presses down on hover
    const press = 1.3 * ease(clamp(h / 0.3));
    p.cylinder(0, 0, H, 2.3, 2.4, { side: 0.1, top: 0.16 });
    p.cylinder(0, 0, H + 2.4 - press, 3.3, 5.4, { side: 0.26, top: 0.34, lw: 0.6 });
    const nz = H + 6 - press;
    p.dot([-2.4, 2.4, nz], 0.7, 0.02); // the nozzle, facing left
    // the mist: a widening drift of dots, straight out to the left
    const k = clamp((h - 0.2) / 0.5);
    if (k > 0) for (let i = 0; i < 16; i++) {
      const v = (i * 0.618 + t * 0.45) % 1, d = 2.5 + v * 14 * k;
      const s1 = Math.sin(i * 2.4) * 0.22 * d, s2 = Math.cos(i * 1.7) * 0.3 * d;
      p.dot([-2.4 - d * 0.707 + s1, 2.4 + d * 0.707 + s1, nz + s2 + 0.6], 0.5 + 0.45 * v, k * (1 - v * v));
    }
  },
};
