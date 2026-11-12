// Shopping list: a ring bound notepad standing up, one item written and four empty boxes. Hover and a pencil writes the rest in, then the first box is ticked.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}
const W = 10, Z0 = 1, H = 29, T = 0.9;
const ENDS = [6.6, 3.6, 7.2, 5]; // where each written line stops

export const shoppinglist: Illustration = {
  k: "shoppinglist", name: "Shopping list", title: "Your list is empty", body: "Add the things you need and tick them off as you shop.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 21, 9, 0.1);
    p.rotate("z", -0.55);
    p.box(-W, -T, Z0, W * 2, T * 2, H, { top: 0.3, left: 0.22, right: SH.right });
    const y = T + 0.03, top = Z0 + H;
    // the binding: punched holes with wire rings over the top edge
    for (let i = 0; i < 6; i++) {
      const x = -7.5 + i * 3;
      p.dot([x, y, top - 2], 0.6, 0);
      stroke(p, [[x, y, top - 2], [x, y, top + 1.2], [x, -T, top + 1.2]], 1, 0.9);
    }
    p.line([[-7.6, y, top - 5.2], [7.6, y, top - 5.2]], SH.edge, 1.1);
    // four rows: a box, then a line that gets written in
    let tip: V3 = [ENDS[0], y, top - 9.6];
    for (let i = 0; i < 4; i++) {
      const z = top - 9.6 - i * 5.3;
      p.line([[-7.6, y, z - 1.5], [-4.6, y, z - 1.5], [-4.6, y, z + 1.5], [-7.6, y, z + 1.5], [-7.6, y, z - 1.5]], SH.edge, 0.6);
      const w = i === 0 ? 1 : seg(h, 0.04 + 0.2 * (i - 1), 0.24 + 0.2 * (i - 1));
      if (w <= 0) continue;
      const x1 = -2.4 + (ENDS[i] + 2.4) * w;
      p.line([[-2.4, y, z], [x1, y, z]], SH.edge, 0.9);
      tip = [x1, y, z];
    }
    // the tick in the first box, drawn once the list is written
    const k = seg(h, 0.7, 0.95);
    if (k > 0) {
      const z = top - 9.6, a: V3 = [-7.2, y + 0.02, z + 0.2], b: V3 = [-6.2, y + 0.02, z - 1], c: V3 = [-3.6, y + 0.02, z + 2.4];
      const k1 = Math.min(1, k * 2.5), k2 = Math.max(0, (k - 0.4) / 0.6);
      const pts: V3[] = [a, [a[0] + (b[0] - a[0]) * k1, a[1], a[2] + (b[2] - a[2]) * k1]];
      if (k2 > 0) pts.push([b[0] + (c[0] - b[0]) * k2, b[1], b[2] + (c[2] - b[2]) * k2]);
      p.line(pts, SH.edge, 1.2);
    }
    // the pencil, its point on the line being written
    const [tx, ty] = p.pt([tip[0] + 0.3, y + 0.4, tip[2]]);
    p.screen((c) => {
      const dx = 0.5, dy = -0.866;
      c.lineCap = "butt";
      c.strokeStyle = "#000"; c.lineWidth = 5.4; c.beginPath(); c.moveTo(tx + dx * 1.2, ty + dy * 1.2); c.lineTo(tx + dx * 17.8, ty + dy * 17.8); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 1; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + dx * 2.6, ty + dy * 2.6); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(tx + dx * 2.6, ty + dy * 2.6); c.lineTo(tx + dx * 14, ty + dy * 14); c.stroke();
      c.strokeStyle = "#000"; c.lineWidth = 3; c.beginPath(); c.moveTo(tx + dx * 14, ty + dy * 14); c.lineTo(tx + dx * 14.8, ty + dy * 14.8); c.stroke();
      c.strokeStyle = "#fff"; c.beginPath(); c.moveTo(tx + dx * 14.8, ty + dy * 14.8); c.lineTo(tx + dx * 17, ty + dy * 17); c.stroke();
    });
  },
};
