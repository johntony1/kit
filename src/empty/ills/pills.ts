// No medications: a pill organiser with its four lids standing open, a pill in every well. Hover and the pills hop in turn while the lids nod.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const N = 4, W = 8.6, D = 11, H = 6.4, B = 0.9; // wells, their width and depth, tray height, rim
const clamp = (x: number) => Math.max(0, Math.min(1, x));

// a capsule drawn flat to the screen so it stays crisp inside the dark well
function capsule(p: Pen, a: V3, b: V3, w: number) {
  const [x0, y0] = p.pt(a), [x1, y1] = p.pt(b);
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round";
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  });
}

export const pills: Illustration = {
  k: "pills", name: "Pill organiser", title: "No medications", body: "Add a medication and its daily doses will be laid out here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -10);
    p.shadow(0, 0, 34, 15, 0.11);
    p.rotate("z", -0.32);
    const X0 = (-N * W) / 2, yb = -D / 2 - B;
    // the lids, hinged along the back and standing open
    for (let i = 0; i < N; i++) {
      const x = X0 + i * W, k = clamp((h - i * 0.15) / 0.45);
      p.push();
      p.rotate("x", 1.72 - 0.42 * Math.sin(k * Math.PI), [0, yb, H]);
      const q: V3[] = [[x + 0.6, yb, H], [x + W - 0.6, yb, H], [x + W - 0.6, D / 2, H], [x + 0.6, D / 2, H]];
      p.face(q, 0.2, 0);
      p.line([...q, q[0]], SH.edge, 0.5);
      p.dot([x + W / 2, 0.5, H], 1.5, 0); // the day mark
      p.pop();
    }
    // the tray: a lit rim round four dark wells
    p.box(X0 - B, yb, 0, N * W + B * 2, D + B * 2, H, { top: 0.26, left: 0.12, right: 0.065, edge: 0 });
    p.line([[X0 - B, D / 2 + B + 0.03, H], [X0 + N * W + B, D / 2 + B + 0.03, H], [X0 + N * W + B + 0.03, yb, H]], SH.edge, 0.5);
    for (let i = 0; i < N; i++) {
      const x = X0 + i * W, k = clamp((h - 0.08 - i * 0.15) / 0.45);
      p.clear([[x + 0.7, -D / 2, H + 0.02], [x + W - 0.7, -D / 2, H + 0.02], [x + W - 0.7, D / 2, H + 0.02], [x + 0.7, D / 2, H + 0.02]]);
      const z = H - 1.6 + 6 * Math.sin(k * Math.PI), cx = x + W / 2;
      if (i % 2 === 0) {
        p.dot([cx, -0.6, z], 2.5, 1);
        p.line([[cx - 1.5, 0.6, z], [cx + 1.5, -1.8, z]], SH.edge, 0.6);
      } else capsule(p, [cx - 1.6, -2.6, z], [cx + 1.2, 1.6, z], 3.3);
    }
  },
};
