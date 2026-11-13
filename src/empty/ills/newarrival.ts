// No new arrivals: a fresh product box with a big dark starburst sticker on its side, a bright sparkle at its heart. The sticker turns slowly and a glint flashes across the lid, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const W = 11, D = 7.5, H = 17; // half width, half depth, height
const SN = 12; // points on the starburst

// a four point glint flat to the screen
function glint(p: Pen, at: V3, r: number) {
  if (r < 0.1) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#fff"; g.beginPath();
    g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r);
    g.fill();
  });
}

export const newarrival: Illustration = {
  k: "newarrival", name: "New arrival", title: "No new arrivals", body: "New products will land here first. Check back soon or turn on alerts.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -12.5);
    p.shadow(0, 0, 28, 13, 0.12);
    // the box and its lid, a seam where they meet
    p.box(-W, -D, 0, W * 2, D * 2, H - 3.5, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    p.box(-W - 0.5, -D - 0.5, H - 3.5, W * 2 + 1, D * 2 + 1, 3.5, { top: 0.22, left: 0.16, right: 0.08, edge: 0 });
    p.line([[-W - 0.5, D + 0.53, H - 3.5], [W + 0.5, D + 0.53, H - 3.5], [W + 0.53, -D - 0.5, H - 3.5]], 1, 0.6);
    // the starburst on the near side, turning by one point each loop so it repeats
    const cx = -2, cz = 6.8, y = D + 0.05, rot = u * ((Math.PI * 2) / SN);
    const burst: V3[] = Array.from({ length: SN * 2 }, (_, i) => {
      const a = rot + (i * Math.PI) / SN, r = i % 2 ? 4.6 : 6.2;
      return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3;
    });
    p.face(burst, 0.03, 0);
        // a small sparkle mark in its middle
    glint(p, [cx, y + 0.05, cz], 3.4);
    // a glint sweeping across the lid
    const g = Math.max(0, Math.sin(((u - 0.3) / 0.35) * Math.PI));
    if (u > 0.3 && u < 0.65) glint(p, [-W + 3 + ((u - 0.3) / 0.35) * (2 * W - 6), -1, H + 0.1], 3.2 * g);
  },
};
