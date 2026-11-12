// Permission needed: a settings panel with three switches, all off. Hover and they flick on one by one; a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const X = 13, Y = 1.2, Z = 30, F = Y + 0.03; // half width, half thickness, height, just in front of the panel

/** a pill on the front of the panel */
const pill = (cx: number, cz: number, w: number, r: number, y: number): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 10; out.push([cx + w / 2 - r + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (Math.PI * i) / 10; out.push([cx - w / 2 + r + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  return out;
};
// a round bright badge with a dark tick, flat to the screen
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
  });
}

export const permissions: Illustration = {
  k: "permissions", name: "Permissions", title: "Permission needed", body: "Allow access in your settings to use this feature.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 2, 24, 9, 0.12);
    p.push();
    p.rotate("z", -0.42);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.26, left: 0.04, right: 0.1, lw: 0.8 });
    // three rows: a mark, a label and a switch
    for (let i = 0; i < 3; i++) {
      const z = Z - 6.5 - i * 8.5;
      const k = ease(cl((h - 0.08 - i * 0.2) / 0.34));
      p.ringV("y", [-X + 4.4, F, z], 2, k > 0.5 ? 0.9 : 0.25, SH.edge, 0.7);
      p.face([[-X + 8.4, F, z - 0.8], [-X + 13.6, F, z - 0.8], [-X + 13.6, F, z + 0.8], [-X + 8.4, F, z + 0.8]], 0.5, 0);
      // the switch: dim when off, bright when on, its knob sliding across
      const cx = X - 6.2;
      p.face(pill(cx, z, 9.8, 2.8, F), 0.9, SH.edge, 0.9);
      if (k <= 0.5) p.clear(pill(cx, z, 8.2, 2, F + 0.01));
      p.dot([cx - 2.1 + 4.2 * k, F + 0.03, z], k > 0.5 ? 1.8 : 1.5, k > 0.5 ? 0 : 1);
    }
    p.pop();
    const b = cl((h - 0.72) / 0.28);
    if (b > 0) tick(p, [14, -6, Z + 1], 4.8 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
