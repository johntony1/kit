// No clothes yet: a rolling garment rail on wheels, three hangers on its bar and one shirt on the middle hanger. The hangers sway gently out of step.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const X = 13, ZR = 27; // half span between the uprights, height of the rail

// a hanger in the plane facing us, hooked over the rail at x = cx, maybe carrying a shirt
function hanger(p: Pen, cx: number, ang: number, shirt: boolean) {
  p.push();
  p.rotate("y", ang, [cx, 0, ZR + 1]);
  const Y = 0.8, top = ZR - 2.8, low = ZR - 8.4, w = 5.4;
  if (shirt) {
    // a t shirt hanging from the shoulders: body, sleeves, a dark neck
    const s: [number, number][] = [[-2, top - 0.6], [-5.2, low + 0.6], [-8.4, low - 3.2], [-6.6, low - 5.6], [-4.6, low - 4], [-4.6, low - 15],
      [4.6, low - 15], [4.6, low - 4], [6.6, low - 5.6], [8.4, low - 3.2], [5.2, low + 0.6], [2, top - 0.6]];
    p.face(s.map(([x, z]) => [cx + x, Y + 0.2, z] as V3), 0.26, 0);
    p.face([[cx - 2, Y + 0.25, top - 0.6], [cx, Y + 0.25, top - 3], [cx + 2, Y + 0.25, top - 0.6]], 0.02, 0);
    p.line([[cx - 4.5, Y + 0.25, low - 4.2], [cx - 4.5, Y + 0.25, low - 1]], 1, 0.6);
    p.line([[cx + 4.5, Y + 0.25, low - 4.2], [cx + 4.5, Y + 0.25, low - 1]], 1, 0.6);
  }
  // the hook and the triangle, as bright strokes
  const hook: V3[] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 - 0.2 + (i / 12) * Math.PI * 1.45; hook.push([cx + Math.cos(a) * 1.8, Y, ZR + 1 + Math.sin(a) * 1.8]); }
  const tri: V3[] = [[cx, Y, top], [cx - w, Y, low], [cx + w, Y, low], [cx, Y, top]];
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
    g.lineWidth = 1.4; g.beginPath();
    const [x0, y0] = p.pt([cx, Y, top]); g.moveTo(x0, y0);
    for (const q of hook) { const [x, y] = p.pt(q); g.lineTo(x, y); }
    g.stroke();
    if (!shirt) {
      g.lineWidth = 2; g.beginPath();
      tri.forEach((q, i) => { const [x, y] = p.pt(q); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    }
  });
  p.pop();
}

export const clothesrack: Illustration = {
  k: "clothesrack", name: "Clothes rack", title: "No clothes yet", body: "Clothes you save or buy will hang here, ready to mix and match.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 30, 12, 0.11);
    p.rotate("z", -0.55); // turned so the rail faces us
    const wheel = (x: number, y: number) => { p.ringV("y", [x, y, 1.3], 1.3, 0.3, 0); p.dot([x, y + 0.1, 1.3], 0.45, 0); };
    // the far wheels, then each foot running front to back with an upright rising from its middle
    for (const x of [-X, X]) wheel(x, -5);
    for (const x of [-X, X]) {
      p.box(x - 1, -6, 2.6, 2, 12, 1.6, { top: 0.26, left: 0.3, right: 0.08, edge: 0 });
      p.box(x - 1.2, -1.2, 4.2, 2.4, 2.4, ZR - 4.2, { top: 0.26, left: 0.3, right: 0.08, edge: 0 });
    }
    // the bar across the top
    p.box(-X - 1.6, -1, ZR, X * 2 + 3.2, 2, 2, { top: 0.34, left: 0.32, right: 0.1, edge: 0 });
    // three hangers, swaying; a shirt on the middle one
    hanger(p, -7.6, 0.12 * Math.sin(u), false);
    hanger(p, 7.6, 0.12 * Math.sin(u + 4.2), false);
    hanger(p, 0, 0.08 * Math.sin(u + 2.1), true);
    for (const x of [-X, X]) wheel(x, 5);
  },
};
