// This was deleted: a paper shredder on its stand. A sheet feeds down into the slot and comes out below as waving strips, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const X = 13, Y = 5, Z0 = 17, Z1 = 23; // the head: half width, half depth, bottom and top

// a free standing stroke, flat to the screen (pen lines only show as cuts in a face)
const wire = (p: Pen, pts: V3[], w = 1, v = 255) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((c) => {
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
  });
};
export const deleted: Illustration = {
  k: "deleted", name: "Deleted", title: "This was deleted", body: "It is no longer available. Head back to find something else.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, w = Math.PI * 2 * ph;
    p.translate(0, 0, -20);
    p.shadow(0, 1, 26, 12, 0.12);
    p.rotate("z", -0.42);
    // the back legs of the stand
    for (const x of [-X + 1, X - 1]) wire(p, [[x, 1, 0], [x, 1, Z0]], 1, 150);
    // the strips, hanging from the cutters and swaying
    for (let i = 0; i < 6; i++) {
      const x0 = -9.6 + i * 3.3, len = 11.5 + 2.4 * Math.sin(i * 2.4), n = 8;
      const sway = (k: number) => Math.sin(w + i * 1.1 - k * 2.2) * 1.5 * k;
      const l: V3[] = [], r: V3[] = [];
      for (let j = 0; j <= n; j++) { const k = j / n, z = Z0 - len * k; l.push([x0 + sway(k), 0, z]); r.push([x0 + 2.2 + sway(k), 0, z]); }
      p.face([...l, ...r.reverse()], i % 2 ? 0.2 : 0.3, SH.edge, 0.45);
    }
    // the sheet feeding down into the slot, its lines riding with it
    const top = Z1 + 20 * (1 - ph), fade = Math.min(1, ph / 0.14);
    if (top > Z1 + 0.4) {
      p.face([[-9.6, 0, Z1], [9.6, 0, Z1], [9.6, 0, top], [-9.6, 0, top]], 0.28 * fade, SH.edge * fade, 0.6);
      for (let i = 0; i < 4; i++) {
        const z = top - 3.4 - i * 3.6;
        if (z > Z1 + 0.8) p.line([[-6.6, 0.03, z], [i === 3 ? 0 : 6.6, 0.03, z]], SH.edge, 1);
      }
    }
    // the head: a low box with a dark slot along its top and a row of teeth marks on its front
    p.box(-X, 0, Z0, X * 2, Y, Z1 - Z0, { top: 0.24, left: 0.12, right: 0.065, lw: 0.8 });
    p.line([[-10.6, 0.5, Z1 + 0.02], [10.6, 0.5, Z1 + 0.02]], 0, 1.2);
    p.dot([X - 3, Y + 0.03, Z0 + 3], 1 + 0.25 * Math.sin(w * 4), 1);
    p.line([[-X + 3, Y + 0.03, Z0 + 3], [-X + 11, Y + 0.03, Z0 + 3]], SH.edge, 0.8);
    // the front legs and the foot rail
    for (const x of [-X + 1, X - 1]) wire(p, [[x, Y - 1, Z0], [x, Y - 1, 0]], 1.2);
    wire(p, [[-X + 1, 1, 0], [-X + 1, Y - 1, 0], [X - 1, Y - 1, 0], [X - 1, 1, 0]], 1.2);
  },
};
