// No supplies yet: a zip pencil case with the zip a little open and two pencil tips peeking out. Hover and the zip runs open along the top and the pencils pop up out of it.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 17, D = 7, H = 9, CR = 4.5; // half length, half depth, height, corner radius in plan

/** the plan outline: a rounded rectangle, anticlockwise from above */
const plan: [number, number][] = [];
for (const [cx, cy, a0] of [[L - CR, -(D - CR), -Math.PI / 2], [L - CR, D - CR, 0], [-(L - CR), D - CR, Math.PI / 2], [-(L - CR), -(D - CR), Math.PI]] as const)
  for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); plan.push([cx + Math.cos(a) * CR, cy + Math.sin(a) * CR]); }

function body(p: Pen) {
  // side panels that look at us, shaded by which way they face, then the lit top
  plan.forEach(([x0, y0], i) => {
    const [x1, y1] = plan[(i + 1) % plan.length];
    const nx = y1 - y0, ny = -(x1 - x0);
    if (nx + ny <= 0) return;
    p.face([[x0, y0, 0], [x1, y1, 0], [x1, y1, H], [x0, y0, H]], ny >= nx ? 0.12 : 0.065, 0);
  });
  p.face(plan.map(([x, y]) => [x, y, H] as V3), 0.22, 0);
  // a seam round the middle of the sides
  p.line(plan.filter(([x, y]) => x + y > -4).map(([x, y]) => [x * 1.005, y * 1.005, H * 0.45] as V3), 0, 0.6);
}

/** a pencil standing up, leaning a little, drawn flat to the screen: a dark rim round a bright body,
 *  a dark band near the top, a sharpened tip with a dark point */
function pencil(p: Pen, x: number, y: number, z: number, lean: number, len: number) {
  const dx = Math.sin(lean), dz = Math.cos(lean), at = (s: number): V3 => [x + dx * s, y, z + dz * s];
  const [a, b, band, c] = [p.pt(at(0)), p.pt(at(len)), p.pt(at(len - 2.4)), p.pt(at(len + 4.6))];
  const ux = b[0] - a[0], uy = b[1] - a[1], n = Math.hypot(ux, uy) || 1, ox = -uy / n, oy = ux / n, w = 1.9;
  p.screen((g) => {
    g.lineCap = "butt"; g.lineJoin = "round";
    g.strokeStyle = "#000"; g.lineWidth = w * 2 + 1.6;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke();
    g.strokeStyle = "#fff"; g.lineWidth = w * 2;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.fillStyle = "#fff";
    g.beginPath(); g.moveTo(b[0] + ox * w, b[1] + oy * w); g.lineTo(c[0], c[1]); g.lineTo(b[0] - ox * w, b[1] - oy * w); g.closePath(); g.fill();
    g.strokeStyle = "#000"; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(band[0] + ox * w, band[1] + oy * w); g.lineTo(band[0] - ox * w, band[1] - oy * w); g.stroke();
    g.fillStyle = "#000"; g.beginPath(); g.arc(c[0] - (ux / n) * 0.9, c[1] - (uy / n) * 0.9, 0.9, 0, Math.PI * 2); g.fill();
  });
}

export const pencilcase: Illustration = {
  k: "pencilcase", name: "Pencil case", title: "No supplies yet", body: "Add the supplies you need for class and they will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const z = ease(Math.min(1, h * 1.4)); // how far the zip has run
    const pop = Math.max(0, Math.min(1, (h - 0.4) / 0.6));
    const up = pop < 0.7 ? 1.12 * ease(pop / 0.7) : 1.12 - 0.12 * ease((pop - 0.7) / 0.3);
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 12, 0.12);
    p.rotate("z", -0.25);
    body(p);
    const Z = H + 0.04, X0 = -L + 3, X1 = L - 3;
    const at = (x: number, w = 0): V3 => [x, w, Z];
    const xs = (a: number, b: number, n = 16) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
    // the zip track: a dark band with bright teeth along it
    const track = xs(X0, X1, 24).map((x) => p.pt(at(x)));
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#000"; c.lineWidth = 2.4; c.beginPath(); track.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 0.9; c.setLineDash([0.9, 0.9]); c.beginPath(); track.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    });
    // the opening: from the slider to the far end, wide in the middle
    const sx = X0 + 18 - z * 16; // where the slider is
    const gap = (x: number) => 3 * Math.pow(Math.sin(Math.PI * (x - sx) / (X1 - sx)), 0.7);
    const open = xs(sx, X1, 20);
    p.face([...open.map((x) => at(x, -gap(x))), ...open.slice().reverse().map((x) => at(x, gap(x)))], 0.015, 0);
    // the pencils, rising out of the opening
    pencil(p, 6, -0.4, 2 + 7 * up, -0.24, 14);
    pencil(p, 10, 0, 4 + 8 * up, 0.22, 14);
    // the near lip of the opening, over their feet
    p.face([...open.map((x) => at(x, gap(x))), ...open.slice().reverse().map((x) => at(x, D - 1.2))], 0.22, 0);
    // the slider and its bright pull tab, hanging over the near wall
    const [px, py] = p.pt(at(sx)), [qx, qy] = p.pt([sx - 0.5, D, H - 3.2]);
    p.screen((c) => {
      c.fillStyle = "#fff"; c.strokeStyle = "#fff"; c.lineCap = "round";
      c.beginPath(); c.arc(px, py, 1.7, 0, Math.PI * 2); c.fill();
      c.lineWidth = 2.4; c.beginPath(); c.moveTo(px, py); c.lineTo(qx, qy); c.stroke();
    });
  },
};
