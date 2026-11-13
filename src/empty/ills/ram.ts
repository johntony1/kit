// No memory used: a long RAM stick standing on its edge, four dark chips on its face, a bright comb of gold contacts along the bottom and a notch. The chips light up one by one and go dark again, over and over.
import { SH, type Illustration } from "../dots";

const P = 3.2; // seconds per loop
const L = 22, H = 19, T = 1.6; // half length, height, board thickness
const NX = 5; // the notch, along the bottom edge

export const ram: Illustration = {
  k: "ram", name: "RAM", title: "No memory used", body: "Start a process and the memory it uses will be tracked here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -9);
    p.shadow(0, 0, 32, 10, 0.11);
    p.rotate("z", -0.3);
    // the board: a lit face toward us, its thin top edge bright, the far end in shade
    p.box(-L, -T / 2, 0, 2 * L, T, H, { top: 0.3, left: 0.2, right: 0.065, edge: 0 });
    const y = T / 2 + 0.03;
    // the contacts: a dark band, then a bright comb of teeth along it
    p.clear([[-L + 1, y, 0], [L - 1, y, 0], [L - 1, y, 4.4], [-L + 1, y, 4.4]]);
    for (let x = -L + 1.6; x < L - 2.4; x += 2) if (Math.abs(x + 0.6 - NX) > 2) p.face([[x, y, 0], [x + 1.2, y, 0], [x + 1.2, y, 3.9], [x, y, 3.9]], 0.5, 0);
    // the notch, cut up into the board
    p.clear([[NX - 1.1, y, 0], [NX + 1.1, y, 0], [NX + 1.1, y, 5.8], [NX - 1.1, y, 5.8]]);
    // four dark chips; a light on each comes on in turn, holds, then all go out together
    for (let i = 0; i < 4; i++) {
      const x0 = -L + 2.6 + i * 10.4;
      const on = u < 0.7 ? Math.min(1, Math.max(0, (u - i * 0.13) / 0.1)) : Math.max(0, 1 - (u - 0.8) / 0.1);
      p.box(x0, y - 0.02, 6.4, 8.2, 1.3, 9.8, { top: 0.3, left: 0.035, right: 0.065, edge: 0 });
      p.line([[x0 + 8.2, y + 1.3, 6.4], [x0 + 8.2, y + 1.3, 16.2]], SH.edge, 0.55);
      if (on > 0) p.dot([x0 + 4.1, y + 1.35, 11.3], 2.2 * on, 1);
    }
  },
};
