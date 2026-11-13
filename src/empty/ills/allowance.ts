// No allowance set: a pocket money envelope standing upright with its flap open. A bright coin drops in, the envelope gives a little hop, and the next coin appears above it, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const W = 18, H = 22, FT = 34; // envelope half width, pocket height, flap tip height
const CR = 6.2; // coin radius

export const allowance: Illustration = {
  k: "allowance", name: "Allowance", title: "No allowance set", body: "Set up a regular allowance and every top up will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // the coin: grows in above the slot, hangs, drops into the pocket
    const grow = Math.min(1, u / 0.18), g = 1 - Math.pow(1 - grow, 3);
    const fall = u < 0.4 ? 0 : Math.min(1, (u - 0.4) / 0.2);
    const cz = H + 15 - 20 * fall * fall;
    // the envelope hops once the coin lands
    const hv = u < 0.6 ? 0 : Math.min(1, (u - 0.6) / 0.22);
    const hop = Math.sin(hv * Math.PI) * 2.2 * (1 - hv * 0.3);
    p.translate(0, 0, -18);
    p.shadow(0, 0, 22, 8, 0.12 - hop * 0.01);
    p.rotate("z", -0.62); // turned to face us
    p.translate(0, 0, hop);
    // the back: a sparse panel with the open flap pointing up
    p.face([[-W, -0.6, 0], [W, -0.6, 0], [W, -0.6, H], [0, -0.6, FT], [-W, -0.6, H]], SH.right, 0);
    p.face([[-W + 1.6, -0.5, H], [W - 1.6, -0.5, H], [0, -0.5, FT - 2.4]], 0.12, 0);
    // the coin, behind the front of the pocket
    if (u < 0.62) {
      const r = CR * g;
      for (let i = 0; i < 4; i++) p.ringV("y", [0, -0.4 + i * 0.12, cz], r, SH.right, 0);
      p.ringV("y", [0, 0.1, cz], r, 0.45, 0);
      p.ringV("y", [0, 0.12, cz], r * 0.7, 0.2, 0);
      p.line([[0, 0.15, cz - r * 0.38], [0, 0.15, cz + r * 0.38]], SH.edge, 1);
    }
    // the front pocket: a lit face, the folds cut in as a wide V, its edge a dark slot
    const F = 0.5;
    p.face([[-W, F, 0], [W, F, 0], [W, F, H], [-W, F, H]], 0.24, 0);
    p.face([[-W, F + 0.02, H], [W, F + 0.02, H], [W, F + 0.02, H - 1.2], [-W, F + 0.02, H - 1.2]], 0.065, 0);
    p.line([[-W + 0.5, F + 0.04, H - 1.4], [0, F + 0.04, 8], [W - 0.5, F + 0.04, H - 1.4]], SH.edge, 0.9);
    p.line([[-W + 0.5, F + 0.04, 0.6], [-5.5, F + 0.04, 9.8]], SH.edge, 0.8);
    p.line([[W - 0.5, F + 0.04, 0.6], [5.5, F + 0.04, 9.8]], SH.edge, 0.8);
    // a thickness down the right side
    p.face([[W, -0.6, 0], [W, F, 0], [W, F, H], [W, -0.6, H]], SH.right, 0);
  },
};
