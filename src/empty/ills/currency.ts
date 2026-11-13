// No currencies added: a big chunky dollar mark standing on a round plinth. Hover and it turns half round and comes back as a euro mark; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 9.5, ZC = 15, TH = 3.4; // glyph scale, height of its centre, depth of the extrusion

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
// a face tone as a canvas colour for this render: the stipple pen paints faces in its lit tone scale
function tone(p: Pen, f: number) {
  const v = (p as unknown as { tone: boolean }).tone ? Math.min(1, 0.45 + f * 2.8) : f, n = Math.round(v * 255);
  return `rgb(${n},${n},${n})`;
}
// the glyph's path in local units (y down, about 2.6 tall)
function glyph(g: CanvasRenderingContext2D, euro: boolean) {
  g.beginPath();
  if (euro) {
    g.arc(0.15, 0, 1.05, 0.28 * Math.PI, 1.72 * Math.PI, false);
    g.moveTo(-1.25, -0.25); g.lineTo(0.15, -0.25); g.moveTo(-1.25, 0.3); g.lineTo(0.05, 0.3);
  } else {
    const s: [number, number][] = [[0.75, -0.72], [0.32, -0.98], [-0.38, -0.98], [-0.78, -0.58], [-0.58, -0.12], [0.58, 0.12], [0.78, 0.58], [0.38, 0.98], [-0.32, 0.98], [-0.78, 0.72]];
    s.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.moveTo(0, -1.35); g.lineTo(0, 1.35);
  }
}

export const currency: Illustration = {
  k: "currency", name: "Currency", title: "No currencies added", body: "Add the currencies you hold or spend in and their balances will show here side by side.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const turn = ease(clamp(h / 0.7)) * Math.PI, sway = h * Math.sin(t * 2.2) * 0.06;
    p.translate(0, 0, -12);
    p.shadow(0, 0, 24, 12, 0.12);
    // the plinth: a thick round base
    p.cylinder(0, 0, 0, 10.5, 2.6, { side: 0.12, top: 0.2 });
    p.cylinder(0, 0, 2.6, 8, 1.2, { side: 0.14, top: 0.22 });
    // the mark: face on to us at rest, turning about the upright axis
    let a = turn + sway, euro = false;
    let u: V3 = [Math.cos(-Math.PI / 4 + a), Math.sin(-Math.PI / 4 + a), 0];
    let n: V3 = [Math.cos(Math.PI / 4 + a), Math.sin(Math.PI / 4 + a), 0];
    if (Math.cos(a) < 0) { u = [-u[0], -u[1], 0]; n = [-n[0], -n[1], 0]; euro = true; a = 0; }
    // slices from the back to the front face: shaded sides, then a cut outline and the lit face
    for (let i = 0; i <= 6; i++) {
      const o = -TH / 2 + (TH * i) / 6, c: V3 = [n[0] * o, n[1] * o, ZC];
      const [ox, oy] = p.pt(c), [ux, uy] = p.pt([c[0] + u[0] * S, c[1] + u[1] * S, ZC]), [vx, vy] = p.pt([c[0], c[1], ZC - S]);
      const side = tone(p, 0.09), face = tone(p, 0.3);
      p.screen((g) => {
        g.transform(ux - ox, uy - oy, vx - ox, vy - oy, ox, oy);
        g.lineCap = "round"; g.lineJoin = "round";
        glyph(g, euro);
        if (i < 6) { g.strokeStyle = side; g.lineWidth = 0.44; g.stroke(); return; }
        g.strokeStyle = "#000"; g.lineWidth = 0.58; g.stroke();
        g.strokeStyle = face; g.lineWidth = 0.4; g.stroke();
      });
    }
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) badge(p, [9, -9, 27], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
