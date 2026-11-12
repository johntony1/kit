// No seats assigned: an empty office chair on its five wheels. Hover and it swivels round to face you, and a plus pops up beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** a box turned about z by `ang`, centred on (cx, cy): only the faces that face us */
function rbox(p: Pen, cx: number, cy: number, z: number, w: number, d: number, h: number, ang: number, top: number, left = 0.13, right = 0.07) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const pt = (u: number, v: number): [number, number] => [cx + u * c - v * s, cy + u * s + v * c];
  const q = [pt(-w / 2, -d / 2), pt(w / 2, -d / 2), pt(w / 2, d / 2), pt(-w / 2, d / 2)];
  const sides: { pts: V3[]; f: number; k: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % 4];
    const nx = y1 - y0, ny = -(x1 - x0);
    if (nx + ny <= 0.001) continue;
    sides.push({ pts: [[x0, y0, z], [x1, y1, z], [x1, y1, z + h], [x0, y0, z + h]], f: ny > nx ? left : right, k: (x0 + x1 + y0 + y1) / 2 });
  }
  sides.sort((a, b) => a.k - b.k).forEach((f) => p.face(f.pts, f.f, SH.edge, 0.55));
  p.face(q.map(([x, y]) => [x, y, z + h] as V3), top, SH.edge, 0.55);
}

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const seats: Illustration = {
  k: "seats", name: "Seats", title: "No seats assigned", body: "Assign a seat to a teammate and they can sign in and start working.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.scale(1.12);
    p.shadow(0, 0, 26, 13, 0.11);
    const k = ease(Math.min(1, h / 0.7));
    const ang = -0.95 + 0.5 * k + Math.sin(k * Math.PI) * 0.12;
    const c = Math.cos(ang), s = Math.sin(ang);
    // the star base: five legs, a wheel under each tip, turning with the chair
    const legs = Array.from({ length: 5 }, (_, i) => ang * 0.5 + 0.5 + (i / 5) * Math.PI * 2).sort((a, b) => Math.cos(a) + Math.sin(a) - Math.cos(b) - Math.sin(b));
    for (const a of legs) {
      const dx = Math.cos(a), dy = Math.sin(a), w = 0.9;
      p.cylinder(dx * 9.6, dy * 9.6, 0, 1.3, 1.5, { side: 0.045, top: 0.2, lw: 0.5 });
      p.face([[-dy * w, dx * w, 2], [dx * 10.4 - dy * w, dy * 10.4 + dx * w, 1.6], [dx * 10.4 + dy * w, dy * 10.4 - dx * w, 1.6], [dy * w, -dx * w, 2]], 0.2, SH.edge, 0.5);
    }
    // the gas lift
    p.cylinder(0, 0, 1.8, 2.2, 1.6, { side: 0.12, top: 0.2 });
    p.cylinder(0, 0, 3.4, 1.3, 6, { side: 0.045, top: 0.2 });
    // back to front: the backrest and its bracket sit behind the seat when it faces us
    const back = () => {
      rbox(p, s * 6.6, -c * 6.6, 10.5, 2.6, 1.2, 4, ang, 0.2, 0.045, 0.045);
      rbox(p, s * 7.2, -c * 7.2, 13.5, 13, 2.2, 13.5, ang, 0.22, 0.2, 0.13);
    };
    const seat = () => rbox(p, 0, 0, 9.4, 14, 13.5, 2.8, ang, 0.24, 0.13, 0.07);
    if (s - c < 0) { back(); seat(); } else { seat(); back(); }
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [12, -8, 26], 4.4 * pop);
    }
  },
};
