// No models yet: a small neural network on a stand, three layers of nodes joined by threads. Hover and a signal runs through it, layer by layer, until the answer lights.
import { type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const LAYERS: V3[][] = [
  [[-11.5, 0, 11], [-11.5, 0, 21]],
  [[0, 0, 7], [0, 0, 16], [0, 0, 25]],
  [[11.5, 0, 11], [11.5, 0, 21]],
];
const NR = 2.7; // node radius on screen

const wire = (p: Pen, a: V3, b: V3, g: number, lw: number) => {
  const [x0, y0] = p.pt(a), [x1, y1] = p.pt(b);
  p.screen((c) => { c.strokeStyle = `rgb(${g},${g},${g})`; c.lineWidth = lw; c.lineCap = "round"; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); });
};
// a node: a dark ball with a bright rim, or all bright when the signal has reached it
const node = (p: Pen, at: V3, lit: number, r = NR) => {
  const [x, y] = p.pt(at);
  p.screen((c) => {
    c.beginPath(); c.arc(x, y, r + lit * 0.5, 0, Math.PI * 2); c.fillStyle = lit > 0.5 ? "#fff" : "rgb(20,20,20)"; c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = 0.9; c.stroke();
    if (lit <= 0.5) { c.fillStyle = "rgb(140,140,140)"; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2); c.fill(); }
  });
};

export const model: Illustration = {
  k: "model", name: "Model", title: "No models yet", body: "Add a model to start running prompts. The ones you set up will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 27, 12, 0.12);
    p.rotate("z", -0.5);
    // the stand: a slab with a short post under the middle layer
    p.box(-15, -4.5, 0, 30, 9, 2.2);
    p.box(-1, -1, 2.2, 2, 2, 2.4, { lw: 0.4 });
    // how far the signal has run: 0 at the first layer, 2 at the last
    const s = clamp(h / 0.85) * 2.4 - 0.2;
    // the threads between layers, then the signal travelling along them
    for (let l = 0; l < 2; l++) for (const a of LAYERS[l]) for (const b of LAYERS[l + 1]) wire(p, a, b, s > l + 1 ? 235 : 150, 0.7);
    for (let l = 0; l < 2; l++) {
      const v = s - l;
      if (v > 0.05 && v < 0.95) for (const a of LAYERS[l]) for (const b of LAYERS[l + 1]) {
        p.dot([a[0] + (b[0] - a[0]) * v, 0, a[2] + (b[2] - a[2]) * v], 0.85, 1);
      }
    }
    LAYERS.forEach((layer, l) => layer.forEach((n, i) => {
      // the last layer gives one answer: only its top node lights
      const on = s >= l && h > 0.02 && !(l === 2 && i === 0);
      node(p, n, on ? 1 + 0.25 * Math.sin(t * 3 + l + i) : 0);
    }));
    // the answer: a ring bursting from the lit output node
    const q = clamp((h - 0.82) / 0.18);
    if (q > 0) {
      const [x, y] = p.pt(LAYERS[2][1]);
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 0.9; c.lineCap = "round";
        for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r0 = NR + 2 + q, r1 = r0 + 2.2 * q; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); c.stroke(); }
      });
    }
  },
};
