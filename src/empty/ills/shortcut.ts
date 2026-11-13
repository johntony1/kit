// No shortcuts set: one big chunky keycap with the command mark on its top, a smaller key behind it. Hover and the big key presses down and springs back up, and a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
// a round bright badge with a dark mark: a plus, or a cross
function badge(p: Pen, c: V3, r: number, cross = false) {
  const [x, y] = p.pt(c);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    const d = r * (cross ? 0.4 : 0.5);
    g.beginPath();
    if (cross) { g.moveTo(x - d, y - d); g.lineTo(x + d, y + d); g.moveTo(x + d, y - d); g.lineTo(x - d, y + d); }
    else { g.moveTo(x - d, y); g.lineTo(x + d, y); g.moveTo(x, y - d); g.lineTo(x, y + d); }
    g.stroke();
  });
}

// a keycap: a short base, a sloped skirt and a lit top, centred on (cx, cy)
function key(p: Pen, cx: number, cy: number, B: number, H: number, inset: number) {
  p.box(cx - B, cy - B, 0, B * 2, B * 2, 2, { top: 0.12, left: 0.12, right: 0.065, edge: 0 });
  const T = B - inset, z0 = 2, z1 = H;
  p.face([[cx - B, cy + B, z0], [cx + B, cy + B, z0], [cx + T, cy + T, z1], [cx - T, cy + T, z1]], 0.12, 0);
  p.face([[cx + B, cy - B, z0], [cx + B, cy + B, z0], [cx + T, cy + T, z1], [cx + T, cy - T, z1]], 0.065, 0);
  p.face([[cx - T, cy - T, z1], [cx + T, cy - T, z1], [cx + T, cy + T, z1], [cx - T, cy + T, z1]], 0.26, 0);
}

export const shortcut: Illustration = {
  k: "shortcut", name: "Keyboard shortcut", title: "No shortcuts set", body: "Pick an action and give it a key combination to reach it in a flash.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -6);
    p.shadow(-2, -2, 30, 15, 0.12);
    p.rotate("z", -0.12);
    // the small key behind, to the upper right
    key(p, -6, -21, 7, 7, 2);
    p.line([[-8.5, -21, 7.05], [-3.5, -21, 7.05]], 1, 1.1);
    // the big key: it presses down and springs back
    const k = Math.min(1, h / 0.6), press = k < 1 ? Math.sin(k * Math.PI) * 3 : 0;
    p.push();
    p.translate(0, 0, -press);
    key(p, 2, 2, 13, 12, 3.6);
    // the command mark on its top: a square with a loop at each corner
    const z = 12.05, s = 2.8, r = 2.1, c: V3 = [2, 2, z];
    p.line([[c[0] - s, c[1] - s, z], [c[0] + s, c[1] - s, z], [c[0] + s, c[1] + s, z], [c[0] - s, c[1] + s, z], [c[0] - s, c[1] - s, z]], 1, 1.1);
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const ox = c[0] + sx * (s + r), oy = c[1] + sy * (s + r);
      p.line(Array.from({ length: 21 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [ox + Math.cos(a) * r, oy + Math.sin(a) * r, z] as V3; }), 1, 1.1);
    }
    p.pop();
    const b = Math.max(0, (h - 0.62) / 0.38);
    if (b > 0) badge(p, [16, -12, 18], 4.6 * pop(b));
  },
};
