// No entries yet: a thick account book standing up, bright corner guards and a label on its cover, grooved bands on its spine and a ribbon bookmark hanging out of its pages. Hover and a coin drops beside it with a bounce and a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// height of the coin above the floor: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 22;
  if (k < 0.45) return 22 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 3.5 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 1 * 4 * v * (1 - v); }
  return 0;
}

const W = 11, T = 4, H = 30; // half width, half thickness, height

export const ledger: Illustration = {
  k: "ledger", name: "Ledger", title: "No entries yet", body: "Record your first transaction and the ledger will keep every entry in order.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(2, 2, 26, 11, 0.12);
    p.rotate("z", -0.45);
    // the book: the cover facing us sparse so its guards stand out, the spine dense, the pages lit on top
    p.box(-W, -T, 0, W * 2, T * 2, H, { top: 0.26, left: 0.065, right: 0.12, edge: 0 });
    // the page block between the boards: two cuts along the top
    p.line([[-W, -T + 0.8, H + 0.02], [W, -T + 0.8, H + 0.02]], 1, 0.6);
    p.line([[-W, T - 0.8, H + 0.02], [W, T - 0.8, H + 0.02]], 1, 0.6);
    const y = T + 0.03;
    // bright corner guards on the cover
    for (const [x, z, dx, dz] of [[-W, 0, 1, 1], [W, 0, -1, 1], [-W, H, 1, -1], [W, H, -1, -1]]) p.face([[x, y, z], [x + dx * 6, y, z], [x, y, z + dz * 6]], 0.32, 0);
    // the label: a lit plate with two ruled lines cut in
    p.face([[-6, y, 16], [6, y, 16], [6, y, 24], [-6, y, 24]], 0.3, 0);
    p.line([[-4.2, y + 0.02, 21.4], [4.2, y + 0.02, 21.4]], 1, 0.7);
    p.line([[-4.2, y + 0.02, 18.6], [2, y + 0.02, 18.6]], 1, 0.7);
    // dark grooves across the spine
    for (const z of [5, 25]) p.face([[W + 0.03, -T, z], [W + 0.03, T, z], [W + 0.03, T, z + 1.8], [W + 0.03, -T, z + 1.8]], 0.03, 0);
    // the ribbon: out of the pages at the top and down over the spine, a notched end
    p.face([[W - 1, -0.9, H + 0.03], [W, -0.9, H + 0.03], [W, 0.9, H + 0.03], [W - 1, 0.9, H + 0.03]], 0.4, 0);
    p.face([[W + 0.05, -0.9, H], [W + 0.05, 0.9, H], [W + 0.05, 0.9, 12], [W + 0.05, 0, 13.4], [W + 0.05, -0.9, 12]], 0.4, 0);
    // the coin drops beside the book and bounces
    const k = Math.min(1, h * 1.3);
    if (k > 0.01) {
      const z = drop(k);
      p.cylinder(W + 6, T + 3, z, 4.4, 1.4, { side: 0.14, top: 0.32, edge: 0 });
      p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [W + 6 + Math.cos(a) * 2.8, T + 3 + Math.sin(a) * 2.8, z + 1.42] as V3; }), 1, 0.6);
    }
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [W + 3, -T, H + 1], 4.4 * pop);
    }
  },
};
