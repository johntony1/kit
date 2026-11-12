// Bridge: a suspension bridge with two solid towers, a thick deck and cables swooping between them. Hover and a car drives across, then the tower lights come on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const glow = (p: Pen, pts: V3[], lw = 1.2, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 1.2, v = 1) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw, v); };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const TX = 11, TOP = 34, DZ = 9, DH = 3.2, END = 24, DY = 3.4; // tower x, tower top, deck bottom and thickness, deck end, deck half depth
// the main cable's height along the bridge
const cable = (x: number) => { const a = Math.abs(x); return a <= TX ? 15.4 + (TOP - 15.4) * Math.pow(a / TX, 2) : TOP - (TOP - DZ - DH) * Math.pow((a - TX) / (END - TX), 0.85); };
const sweep = (y: number): V3[] => Array.from({ length: 49 }, (_, i) => { const x = -END + i; return [x, y, cable(x)] as V3; });

export const bridge: Illustration = {
  k: "bridge", name: "Bridge", title: "No routes across", body: "There is no route between these places yet. Try another start or end point.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 11, 0.1);
    p.rotate("z", -0.62);
    p.scale(0.92);
    const tower = (x: number, z: number, hh: number) => p.box(x - 1.9, -DY - 0.8, z, 3.8, DY * 2 + 1.6, hh, { top: 0.14, left: 0.3, right: 0.065, edge: 0 });
    // the far cable, dim
    rod(p, sweep(-DY - 0.4), 1, 0.4);
    // the towers below the deck, on their piers
    for (const s of [-1, 1]) { p.box(s * TX - 3, -DY - 2, 0, 6, DY * 2 + 4, 2.4, { top: 0.14, left: 0.3, right: 0.065, edge: 0 }); tower(s * TX, 2.4, DZ - 2.4); }
    // the deck: a thick slab with a cut line along its side
    p.box(-END, -DY, DZ, END * 2, DY * 2, DH, { top: 0.13, left: 0.3, right: 0.05, edge: 0 });
    p.line([[-END, DY + 0.03, DZ + DH], [END, DY + 0.03, DZ + DH]], SH.edge, 0.5);
    // the car
    const k = clamp(h / 0.7);
    if (k > 0) {
      const cx = -END + 2 + (END * 2 - 9) * ease(k), z = DZ + DH;
      p.box(cx, -1.6, z, 5.5, 3.2, 1.5, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
      p.box(cx + 1.2, -1.6, z + 1.5, 2.8, 3.2, 1.4, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
      p.line([[cx, 1.63, z], [cx + 5.5, 1.63, z]], SH.edge, 0.7);
    }
    // the towers above the deck
    for (const s of [-1, 1]) {
      tower(s * TX, DZ + DH, TOP - DZ - DH);
      p.line([[s * TX - 1.9, DY + 0.83, DZ + DH], [s * TX + 1.9, DY + 0.83, DZ + DH]], SH.edge, 0.5);
    }
    // the hangers and the near cable, bold
    for (let x = -END + 3; x <= END - 3; x += 3) if (Math.abs(Math.abs(x) - TX) > 1.5) rod(p, [[x, DY + 0.4, cable(x)], [x, DY + 0.4, DZ + DH]], 0.7, 0.75);
    rod(p, sweep(DY + 0.4), 1.6);
    // the tower lights
    const b = clamp((h - 0.72) / 0.28);
    if (b > 0) for (const s of [-1, 1]) p.dot([s * TX, 0, TOP + 2.2], 1.9 * b, 1);
  },
};
