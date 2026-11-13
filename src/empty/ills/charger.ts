// Not charging: a cube wall charger, a bolt and a port on its front, its prongs folded flat. Hover and the prongs swing up and a bolt badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = 9, H = 17; // half width of the cube, its height
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const back = (x: number) => { const v = Math.min(1, Math.max(0, x)); return 1 + 2.4 * Math.pow(v - 1, 3) + 1.4 * Math.pow(v - 1, 2); };

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    const b = [[0.15, -0.7], [-0.4, 0.1], [0, 0.1], [-0.15, 0.7], [0.4, -0.1], [0, -0.1]];
    g.beginPath(); b.forEach(([u, v], i) => (i ? g.lineTo(x + u * r, y + v * r) : g.moveTo(x + u * r, y + v * r))); g.closePath();
    g.fillStyle = "#000"; g.fill();
  });
}

export const charger: Illustration = {
  k: "charger", name: "Charger", title: "Not charging", body: "Plug in your device and its charge will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 25, 12, 0.12);
    p.rotate("z", -0.2);
    p.box(-S, -S, 0, S * 2, S * 2, H, { top: 0.24, left: 0.2, right: 0.065, edge: 0 });
    p.line([[-S, S + 0.03, H], [S, S + 0.03, H], [S + 0.03, -S, H]], SH.edge, 0.6);
    // the front: a bolt cut into it, and the port at its foot
    const y = S + 0.04, bz = 10;
    p.clear(([[0.6, 4], [-2.6, -0.4], [-0.2, -0.4], [-1, -4.6], [2.6, 0.6], [0.2, 0.6], [1.4, 4]] as [number, number][]).map(([u, v]) => [u * 1.15, y, bz + v * 1.15] as V3));
    p.clear([[-2.8, y, 2.4], [2.8, y, 2.4], [2.8, y, 3.8], [-2.8, y, 3.8]]);
    // the prongs: two slots in the top, each blade swinging up out of its slot
    const a = (Math.PI / 2) * back(h * 1.4);
    for (const x of [-4, 4]) {
      p.clear([[x - 0.7, -4.6, H + 0.02], [x + 0.7, -4.6, H + 0.02], [x + 0.7, 4.6, H + 0.02], [x - 0.7, 4.6, H + 0.02]]);
      p.push();
      p.rotate("x", -a, [x, 4.2, H]);
      p.box(x - 0.6, -4.4, H, 1.2, 8.6, 1, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
      p.pop();
    }
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) badge(p, [-S + 1, -S + 3, H + 4], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.15 : 1.15 - 0.15 * ease((b - 0.65) / 0.35)));
  },
};
