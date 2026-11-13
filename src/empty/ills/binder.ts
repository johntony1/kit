// No documents filed: a ring binder lying open, three big rings in its spine and a stack of paper on them. Hover and the top sheet flips over the rings to the other cover and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const CW = 18, D = 16, G = 2.2, T = 1.4, PH = 2.2; // cover width, half depth, half gap at the spine, cover and paper thickness
const RR = 4.4, RY = [-10.5, 0, 10.5]; // ring radius, where the rings sit along the spine
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// a ring: a bright metal arc with a dark rim, so it reads over paper and over the dark alike
function ring(p: Pen, y: number, a0: number, a1: number) {
  const pts: V3[] = Array.from({ length: 19 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 18; return [Math.cos(a) * RR, y, T + PH + Math.sin(a) * RR]; });
  if (p.ink) { p.line(pts, SH.edge, 1); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    g.lineCap = "round"; g.lineJoin = "round";
    for (const [col, lw] of [["#000", 3.4], ["#fff", 1.7]] as const) {
      g.strokeStyle = col; g.lineWidth = lw;
      g.beginPath(); q.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy))); g.stroke();
    }
  });
}

export const binder: Illustration = {
  k: "binder", name: "Binder", title: "No documents filed", body: "File your first document and it will be kept here in order.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -4);
    p.shadow(0, 0, 34, 17, 0.12);
    p.rotate("z", -Math.PI / 4);
    // the spine lying in the middle, then the two covers either side
    p.box(-G, -D, 0, G * 2, D * 2, 0.8, { top: 0.065, left: 0.12, right: 0.065, edge: 0 });
    p.box(-G - CW, -D, 0, CW, D * 2, T, { top: 0.065, left: 0.12, right: 0.065, edge: 0 });
    p.box(G, -D, 0, CW, D * 2, T, { top: 0.065, left: 0.12, right: 0.065, edge: 0 });
    // the paper stack on the right cover, holes along its spine edge
    const P0 = G + 1.2, Z = T + PH;
    p.box(P0, -D + 1.5, T, CW - 2.6, D * 2 - 3, PH, { top: 0.3, left: 0.2, right: 0.08, edge: 0 });
    p.line([[P0 + 0.05, D - 1.5 + 0.05, T + PH * 0.5], [P0 + CW - 2.6, D - 1.5 + 0.05, T + PH * 0.5]], SH.edge, 0.5);
    for (const y of RY) p.disc(RR, y, Z + 0.02, 1.1, 0.02);
    // the top sheet flips from the stack over the rings to the left cover
    const k = ease(h / 0.7);
    if (h > 0.01) {
      p.push();
      p.rotate("y", -Math.PI * k, [0, 0, Z + 0.1]);
      const f = Math.abs(Math.cos(Math.PI * k));
      p.face([[P0, -D + 1.5, Z + 0.1], [P0 + CW - 2.6, -D + 1.5, Z + 0.1], [P0 + CW - 2.6, D - 1.5, Z + 0.1], [P0, D - 1.5, Z + 0.1]], k < 0.5 ? 0.3 * f + 0.1 : 0.3, 0);
      p.line([[P0 + 4.5, -D + 5, Z + 0.15], [P0 + CW - 5, -D + 5, Z + 0.15]], SH.edge, 0.7);
      p.line([[P0 + 4.5, -D + 9, Z + 0.15], [P0 + CW - 7, -D + 9, Z + 0.15]], SH.edge, 0.7);
      p.pop();
    }
    // the rings, arching over the spine
    for (const y of RY) ring(p, y, 0, Math.PI);
    // the plus badge once the sheet is filed
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) badge(p, [-G - CW + 3, -D + 2, T + 9], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.15 : 1.15 - 0.15 * ease((b - 0.65) / 0.35)));
  },
};
