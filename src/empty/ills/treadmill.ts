// No runs yet: a treadmill with its console and handrails. The belt runs and the console's bars climb, over and over.
import { type Illustration } from "../dots";

const P = 2.4; // seconds per loop
const L = 17, D = 8, HD = 4; // half length and half width of the deck, deck height
const CX = -L - 1; // where the uprights stand

export const treadmill: Illustration = {
  k: "treadmill", name: "Treadmill", title: "No runs yet", body: "Start a run and your distance, pace and time will be tracked here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(2, 0, -12);
    p.shadow(0, 0, 38, 15, 0.12);
    p.rotate("z", -0.3);
    // the uprights at the far end, then the deck
    for (const y of [-D + 0.5, D - 2.3]) p.box(CX, y, 2, 1.8, 1.8, 22, { top: 0.2, left: 0.14, right: 0.07, edge: 0 });
    p.box(-L, -D, 0, L * 2, D * 2, HD, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the belt: dark, with slats that run toward us
    const BW = D - 2;
    p.face([[-L + 1.5, -BW, HD + 0.05], [L - 1.5, -BW, HD + 0.05], [L - 1.5, BW, HD + 0.05], [-L + 1.5, BW, HD + 0.05]], 0.08, 0);
    for (let i = 0; i < 8; i++) {
      const x = -L + 1.5 + (((i + u) / 8) * (L * 2 - 3));
      p.face([[x, -BW, HD + 0.08], [x + 1.2, -BW, HD + 0.08], [x + 1.2, BW, HD + 0.08], [x, BW, HD + 0.08]], 0.24, 0);
    }
    // the side rails, lit
    for (const y of [-D, BW]) p.box(-L, y, HD, L * 2, D - BW, 1.2, { top: 0.28, left: 0.14, right: 0.07, edge: 0 });
    // the motor hood at the front of the deck
    p.box(-L - 3, -D, 0, 4.5, D * 2, HD + 2.5, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // handrails from the console out over the deck
    for (const y of [-D + 0.5, D - 2.3]) p.box(CX, y, 20, 10, 1.8, 1.8, { top: 0.3, left: 0.16, right: 0.08, edge: 0 });
    // the console: a wide block across the top, its screen toward the runner
    p.box(CX - 1.5, -D - 1, 22, 5, D * 2 + 2, 6, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    p.face([[CX + 3.55, -D + 1, 23], [CX + 3.55, D - 1, 23], [CX + 3.55, D - 1, 27], [CX + 3.55, -D + 1, 27]], 0.02, 0);
    // bars on the screen climbing in turn
    p.screen((g) => {
      g.fillStyle = "#fff";
      for (let i = 0; i < 4; i++) {
        const y = -D + 3 + i * 3.4, hgt = 0.8 + 2.6 * (0.5 + 0.5 * Math.sin(u * Math.PI * 2 - i * 0.9));
        const a = p.pt([CX + 3.6, y, 23.6]), b = p.pt([CX + 3.6, y + 2, 23.6]), c = p.pt([CX + 3.6, y + 2, 23.6 + hgt]), d = p.pt([CX + 3.6, y, 23.6 + hgt]);
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill();
      }
    });
  },
};
