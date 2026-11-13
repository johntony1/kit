// No tunes yet: an accordion seen face on, a solid end box either side (buttons on the left, piano keys on the right) and big zig zag pleats between. The bellows squeeze in and pull out, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const PER = 2.8, H = 26, D = 5, EW = 9, N = 5; // seconds per loop, height, half depth, end width, folds

export const accordion: Illustration = {
  k: "accordion", name: "Accordion", title: "No tunes yet", body: "Play or upload your first tune and it will show up here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    const B = 9.5 + 3.5 * Math.sin(u * Math.PI * 2); // half length of the bellows
    p.translate(0, 0, -14);
    p.shadow(0, 0, 32, 11, 0.12);
    p.rotate("z", -Math.PI / 4 + 0.32); // face on, turned a little so the right ends show
    // the left end: a solid box with dark round buttons on its face
    const L = -B - EW;
    p.box(L, -D, 0, EW, D * 2, H, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    const y = D + 0.05;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) p.dot([L + 3 + c * 3.4, y, 5 + r * 5 + c * 2.4], 1.35, 0);
    // the bellows: big pleats, a lit strip and a dark strip per fold, a lit zig zag top
    const f = 2.6, z0 = 2.2, z1 = H - 2.2, w = (2 * B) / N;
    const front = (i: number) => (i % 2 === 0 ? D - 0.6 : D - 0.6 - f); // peaks and valleys along the front
    const zig: V3[] = Array.from({ length: N * 2 + 1 }, (_, i) => [-B + (i * w) / 2, front(i), z1]);
    p.face([[-B, -D + 0.6, z1], [B, -D + 0.6, z1], ...zig.slice().reverse()], 0.2, 0);
    for (let i = 0; i < N * 2; i++) {
      const xa = -B + (i * w) / 2, xb = xa + w / 2, ya = front(i), yb = front(i + 1);
      p.face([[xa, ya, z0], [xb, yb, z0], [xb, yb, z1], [xa, ya, z1]], i % 2 === 0 ? 0.26 : 0.03, 0);
    }
    // the right end: a solid box with bright piano keys on its face
    p.box(B, -D, 0, EW, D * 2, H, { top: 0.22, left: 0.03, right: 0.065, edge: 0 });
    for (let k = 0; k < 6; k++) {
      const za = 1.6 + k * 3.9;
      p.face([[B + 1, y, za], [B + EW - 1, y, za], [B + EW - 1, y, za + 3], [B + 1, y, za + 3]], 0.3, 0);
    }
    p.line([[B, D + 0.05, H], [B + EW, D + 0.05, H]], SH.edge, 0.6);
    p.line([[L, D + 0.05, H], [L + EW, D + 0.05, H]], SH.edge, 0.6);
  },
};
