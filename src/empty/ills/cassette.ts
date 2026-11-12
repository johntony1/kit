// Cassette tape: a cassette standing on its edge, two reels in its window. The reels turn and a couple of notes drift up from it, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const PER = 3, W = 16, T = 1.8, H = 21; // seconds per loop, half width, half thickness, height

export const cassette: Illustration = {
  k: "cassette", name: "Cassette tape", title: "No mixtapes yet", body: "Put a few tracks together and your first mixtape will show up here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -13);
    p.shadow(0, 1, 26, 9, 0.11);
    p.rotate("z", -0.5);
    p.box(-W, -T, 0, W * 2, T * 2, H, { top: 0.3, left: 0.22, right: 0.065, lw: 0.6 });
    const y = T + 0.03;
    const rect = (x0: number, z0: number, x1: number, z1: number, dy = 0): V3[] => [[x0, y + dy, z0], [x1, y + dy, z0], [x1, y + dy, z1], [x0, y + dy, z1]];
    // the label: a cut frame with a title line
    p.line([...rect(-W + 2.4, 7, W - 2.4, H - 2), [-W + 2.4, y, 7]], SH.edge, 0.6);
    p.line([[-W + 5, y, H - 4.2], [3, y, H - 4.2]], SH.edge, 0.9);
    // the window, and the two reels in it
    p.clear(rect(-10.5, 8.6, 10.5, 15.2, 0.01));
    for (const s of [-1, 1]) {
      const cx = s * 6, cz = 11.9, a0 = u * Math.PI * 2 * (2 / 3);
      p.ringV("y", [cx, y + 0.02, cz], 2.9, 0.9, 0);
      // three teeth round the hub, turning
      for (let i = 0; i < 3; i++) { const a = a0 + (i * Math.PI * 2) / 3; p.dot([cx + Math.cos(a) * 1.65, y + 0.04, cz + Math.sin(a) * 1.65], 0.85, 0); }
    }
    p.face(rect(-2.2, 10.2, 2.2, 13.6, 0.02), 0.3, 0); // the tape between them
    // the foot: a raised lip with the drive holes
    p.line([[-9.5, y, 0.2], [-8, y, 5.4], [8, y, 5.4], [9.5, y, 0.2]], SH.edge, 0.7);
    for (const x of [-5, -1.7, 1.7, 5]) p.dot([x, y, 2.6], 0.85, 0);
    // two notes that rise and fade, one after the other
    for (let i = 0; i < 2; i++) {
      const v = (u + i * 0.5) % 1, k = Math.sin(v * Math.PI);
      const [x, yy] = p.pt([i ? 9 : -7, 0, H + 3 + v * 10]);
      const sx = x + Math.sin(v * Math.PI * 2 + i) * 1.6, r = 1.5 * (0.5 + 0.5 * k);
      if (k < 0.08) continue;
      p.screen((g) => {
        g.globalAlpha = Math.min(1, k * 1.6); g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineWidth = 1.1; g.lineCap = "round";
        g.beginPath(); g.ellipse(sx, yy, r * 1.15, r * 0.85, -0.4, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(sx + r, yy - 0.3); g.lineTo(sx + r, yy - r * 4.2); g.lineTo(sx + r * 2.6, yy - r * 3.2); g.stroke();
      });
    }
  },
};
