// Nobody has visited: a thick bristle doormat with a dark border band and a heart cut into the bristles in the middle. Hover and two footprints press into it, one after the other, and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 16, D = 11, TH = 3.4; // half length, half depth, thickness

// a heart lying on the mat, its point toward us (+y)
const heart = (r: number, z: number): V3[] => Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [x * r, -y * r + 1, z] as V3;
});

// a shoe print: a sole and a heel, pressed dark into the top
function print(p: Pen, x: number, y: number, a: number) {
  p.push();
  p.translate(x, y, 0);
  p.rotate("z", a);
  const oval = (cx: number, cy: number, rx: number, ry: number): V3[] => Array.from({ length: 20 }, (_, i) => { const t = (i / 20) * Math.PI * 2; return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, TH + 0.06]; });
  p.face(oval(0, -1.8, 1.9, 2.9), 0.03, 0);
  p.face(oval(0, 3.1, 1.5, 1.5), 0.03, 0);
  p.pop();
}

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

export const doormat: Illustration = {
  k: "doormat", name: "Doormat", title: "Nobody has visited", body: "When someone stops by, their visit will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -4);
    p.scale(1.12);
    p.shadow(0, 0, 32, 14, 0.12);
    p.rotate("z", -0.12);
    // the mat: a lit bristle top, a dense front edge, a sparse end
    p.box(-L, -D, 0, L * 2, D * 2, TH, { top: 0.2, left: 0.13, right: 0.065, edge: 0 });
    // a sunken border band round the field, cut in
    const b = 2.6, z = TH + 0.03;
    const rim = (k: number): V3[] => [[-L + k, -D + k, z], [L - k, -D + k, z], [L - k, D - k, z], [-L + k, D - k, z], [-L + k, -D + k, z]];
    p.face(rim(1.2), 0.07, 0);
    p.face(rim(b), 0.24, 0);
    p.line(rim(b), SH.edge, 0.6);
    // the heart, cut dark into the bristles
    p.face(heart(0.4, z + 0.03), 0.03, 0);
    // two footprints step on, left then right
    if (h > 0.18) print(p, -9.5, 1, 0.18);
    if (h > 0.45) print(p, 9.5, -1, -0.12);
    const k = Math.max(0, (h - 0.7) / 0.3);
    if (k > 0) tick(p, [-L + 4, -D + 3, TH + 4], 4.4 * (k < 0.65 ? ease(k / 0.65) * 1.18 : 1.18 - 0.18 * ease((k - 0.65) / 0.35)));
  },
};
