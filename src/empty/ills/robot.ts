// No bots yet: a little robot, a boxy head with a dark visor on a small body. Hover and it wakes: the head lifts and tilts, the eyes light, it smiles, the antenna pings and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const robot: Illustration = {
  k: "robot", name: "Robot", title: "No bots yet", body: "Create your first bot and it will show up here, ready to work.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 24, 11, 0.12);
    p.rotate("z", -0.5);
    const st = { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 };
    // the body and the neck
    p.box(-11.4, -2, 1.2, 2.4, 4, 4.6, st);
    p.box(-8, -5, 0, 16, 10, 6.5, st);
    p.box(9, -2, 1.2, 2.4, 4, 4.6, st);
    p.line([[-4, 5.03, 3.3], [4, 5.03, 3.3]], SH.edge, 0.9);
    p.box(-2.5, -2, 6.5, 5, 4, 2.4, st);
    // the head: lifts and tilts on hover
    p.push();
    p.translate(0, 0, 1.8 * e);
    p.rotate("y", 0.1 * h * Math.sin(t * 2.2), [0, 0, 8.5]);
    p.box(-13.2, -2, 12.5, 2.2, 4, 6, st);
    p.box(-11, -7, 8.5, 22, 14, 14, st);
    p.box(11, -2, 12.5, 2.2, 4, 6, st);
    // the visor, the eyes and the mouth
    const y = 7.03;
    p.clear(rr(-8.5, 11.2, 8.5, 19.8, 2.2).map(([u, v]) => [u, y, v] as V3));
    const blink = h > 0.6 && (t * 0.6 + 0.4) % 1 < 0.07;
    if (blink) { p.line([[-5.6, y + 0.02, 16.6], [-2.6, y + 0.02, 16.6]], 0.5, 0.8); p.line([[2.6, y + 0.02, 16.6], [5.6, y + 0.02, 16.6]], 0.5, 0.8); }
    else { p.dot([-4.1, y + 0.02, 16.6], 1.5 + 0.6 * e, 0.75 + 0.25 * e); p.dot([4.1, y + 0.02, 16.6], 1.5 + 0.6 * e, 0.75 + 0.25 * e); }
    p.line(Array.from({ length: 9 }, (_, i) => [-2.6 + (5.2 * i) / 8, y + 0.02, 13.4 - Math.sin((Math.PI * i) / 8) * 1.2 * e] as V3), 0.5, 0.9);
    // the antenna
    p.box(-0.6, -0.6, 22.5, 1.2, 1.2, 3.6, st);
    p.dot([0, 0, 27.4], 1.9 + 0.3 * e, 1);
    if (h > 0.3) {
      const [sx, sy] = p.pt([0, 0, 27.4]);
      p.screen((c) => {
        for (let i = 0; i < 2; i++) {
          const w = (t * 0.8 + i / 2) % 1, n = Math.round(255 * h * Math.sin(w * Math.PI));
          c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.8;
          c.beginPath(); c.arc(sx, sy, 3 + w * 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
        }
      });
    }
    p.pop();
    // the plus badge
    const b = seg(h, 0.6, 1);
    if (b > 0) badge(p, [14, -5, 27], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
