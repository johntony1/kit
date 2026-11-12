// No context added: a glass case on a plate, one document lying in the bottom. Hover and three more drop in and stack up, filling the window.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const S = 11, HZ = 23, DH = 3.2, PITCH = 4.4; // half size of the case, its height, a document's thickness, stack pitch

const wire = (p: Pen, pts: V3[], dim = false, lw = 0.9) => {
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = dim || p.ink ? "rgb(120,120,120)" : "#fff"; c.lineWidth = dim ? 0.5 : lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
};
// a drop that lands with one small bounce: height above rest, 1 down to 0
const fall = (k: number) => (k <= 0 ? 1 : k < 0.6 ? 1 - Math.pow(k / 0.6, 2) : k < 1 ? 0.09 * Math.sin(((k - 0.6) / 0.4) * Math.PI) : 0);

function doc(p: Pen, z: number, i: number) {
  const o = [0, 0.7, -0.6, 0.4][i], w = 8.6;
  p.box(-w + o, -w - o, z, 2 * w, 2 * w, DH, { top: 0.22 });
  const Z = z + DH + 0.02;
  for (let r = 0; r < 4; r++) p.line([[-5.5 + o, -5 + r * 3.2 - o, Z], [(r === 3 ? 0.5 : 5.5 - (r % 2) * 2) + o, -5 + r * 3.2 - o, Z]], SH.edge, 0.8);
}

export const context: Illustration = {
  k: "context", name: "Context window", title: "No context added", body: "Add files, notes or links to give the model something to work from.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -11);
    p.scale(0.9);
    p.shadow(0, 0, 30, 15, 0.12);
    p.box(-S - 1.5, -S - 1.5, -2, 2 * S + 3, 2 * S + 3, 2, { top: p.ink ? 0.2 : 0.045 });
    // the far edges of the glass
    wire(p, [[-S, -S, 0], [-S, -S, HZ]], true);
    wire(p, [[S, -S, 0], [-S, -S, 0], [-S, S, 0]], true);
    // the documents: the first is there, the rest fall in one after another
    for (let i = 0; i < 4; i++) {
      const k = i ? clamp((h - 0.05 - (i - 1) * 0.27) / 0.36) : 1;
      if (k <= 0) continue;
      const z = 0.3 + i * PITCH + fall(k) * (HZ + 6 - i * PITCH);
      doc(p, z, i);
    }
    // the near edges and the rim, bright, with a glint on the left pane
    wire(p, [[-S, S, 0], [-S, S, HZ]]); wire(p, [[S, -S, 0], [S, -S, HZ]]); wire(p, [[S, S, 0], [S, S, HZ]], false, 1.1);
    wire(p, [[-S, S, 0], [S, S, 0], [S, -S, 0]]);
    wire(p, [[-S, -S, HZ], [S, -S, HZ], [S, S, HZ], [-S, S, HZ], [-S, -S, HZ]], false, 1.1);
    wire(p, [[-8, S, HZ - 3], [-4.5, S, HZ - 7.5]], true); wire(p, [[-6, S, HZ - 2.5], [-3.5, S, HZ - 5.8]], true);
    // how full it is: marks up the near corner
    for (let i = 1; i <= 4; i++) wire(p, [[S, S, i * PITCH + 0.3], [S - 1.8, S, i * PITCH + 0.3]], false, 0.8);
  },
};
