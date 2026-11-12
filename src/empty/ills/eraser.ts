// Eraser: a big two tone eraser, bright rubber in a grey paper sleeve, tipped onto its working end, rubbings beside it. Hover and it rubs back and forth, leaving more.
import { type Illustration, type V3 } from "../dots";

// the working end seen from the front: its top corner worn round
const end: [number, number][] = [[7, 0.5], [7, 8.5], [12, 8.5], ...Array.from({ length: 7 }, (_, i) => { const a = Math.PI / 2 - ((i + 1) / 7) * (Math.PI / 2); return [12 + 3 * Math.cos(a), 5.5 + 3 * Math.sin(a)] as [number, number]; }), [15, 0.5]];

export const eraser: Illustration = {
  k: "eraser", name: "Eraser", title: "Nothing to undo", body: "Changes you make will be listed here so you can step back through them.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(2, 0, 22, 10, 0.1);
    p.rotate("z", -0.5); // turned so its long side faces us
    p.push();
    p.translate(h * Math.sin(t * 8) * 2, 0, 0);
    p.rotate("y", 0.3, [15, 0, 0]); // tipped onto the end that rubs
    // a short bright end, the grey paper sleeve round the middle
    p.box(-15, -6, 0.5, 4, 12, 8, { top: 0.3, left: 0.22, right: 0.085, edge: 0 });
    p.box(-11, -6.6, 0, 18, 13.2, 9, { top: 0.16, left: 0.13, right: 0.065, edge: 0 });
    p.line([[-11, -6.6, 9.03], [-11, 6.63, 9.03], [-11, 6.63, 0]], 1, 1);
    // the bright working end, round at its worn corner
    for (let i = 1; i < end.length - 1; i++) {
      const [x0, z0] = end[i], [x1, z1] = end[i + 1], l = Math.hypot(x1 - x0, z1 - z0), nz = (x1 - x0) / l;
      p.face([[x0, -6, z0], [x1, -6, z1], [x1, 6, z1], [x0, 6, z0]], 0.085 + 0.215 * nz, 0);
    }
    p.face(end.map(([x, z]) => [x, 6, z] as V3), 0.22, 0);
    p.line([[7, -6, 8.53], [7, 6.03, 8.53], [7, 6.03, 0.5]], 1, 1);
    p.pop();
    // rubbings on the desk: short bright curls
    const bits: [number, number][] = [[10, 11], [15.5, 9.5], [5, 13.5], [12.5, 14.5], [18, 5.5], [0.5, 12]];
    const n = 4 + Math.round(2 * h);
    const q = bits.slice(0, n).map(([x, y]) => p.pt([x, y, 0]));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.8; g.lineCap = "round";
      q.forEach(([x, y], i) => { g.beginPath(); g.arc(x, y, 1.9, i * 1.7, i * 1.7 + 2.6); g.stroke(); });
    });
  },
};
