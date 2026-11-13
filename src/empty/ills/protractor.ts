// No measurements yet: a big protractor standing upright with ticks cut round its edge and a pencil leaning on it. Hover and a bright arm sweeps up from the base line, an arc filling in behind it.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 25, RI = 14, B = 3; // outer edge, inner edge of the scale band, the base bar's height
const arc = (r: number, a0: number, a1: number, n = 40): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r]; });

export const protractor: Illustration = {
  k: "protractor", name: "Protractor", title: "No measurements yet", body: "Take your first measurement and it will be recorded here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.15)), ang = k * 1.1 + h * 0.03 * Math.sin(t * 3);
    p.translate(0, 0, -12);
    p.shadow(0, 0, 30, 9, 0.12);
    p.rotate("z", -Math.PI / 4 + 0.22); // nearly face on: x across, z up, y toward us
    const put = (q: [number, number][], y: number): V3[] => q.map(([a, v]) => [a, y, v + B] as V3);
    // the body's thickness: layers stepping back, in shade
    const body: [number, number][] = [[-R, -B], [R, -B], ...arc(R, 0, Math.PI), [-R, -B]];
    for (let y = -2; y < 0; y += 0.4) p.face(put(body, y), 0.065, 0);
    // the face: the scale band and the base bar, lit, round a dark window
    p.face(put([...arc(R, 0, Math.PI), ...arc(RI, Math.PI, 0)], 0), 0.24, 0);
    p.face(put([[-R, -B], [R, -B], [R, 0], [-R, 0]], 0), 0.24, 0);
    p.clear(put([...arc(RI, 0, Math.PI), [-RI, 0]], 0.02));
    // ticks cut into the band: long every 30 degrees, short between
    for (let i = 1; i < 12; i++) {
      const a = (i / 12) * Math.PI, big = i % 3 === 0, r0 = big ? R - 7 : R - 4;
      p.line(put([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * (R + 0.5), Math.sin(a) * (R + 0.5)]], 0.03), 0, big ? 1.3 : 0.9);
    }
    p.line(put([[-R + 1.2, -B / 2], [R - 1.2, -B / 2]], 0.03), 0, 0.7);
    // the arm and the arc it sweeps, bright across the dark window
    const o = p.pt(put([[0, 0]], 0.06)[0]);
    const tip = p.pt(put([[Math.cos(ang) * (RI - 1), Math.sin(ang) * (RI - 1)]], 0.06)[0]);
    const base = p.pt(put([[RI - 1, 0]], 0.06)[0]);
    const A = put(arc(7, 0, Math.max(0.001, ang), 24), 0.06).map((v) => p.pt(v));
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#fff"; c.fillStyle = "#fff";
      c.lineWidth = 1.6; c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(base[0], base[1]); c.stroke();
      if (ang > 0.02) { c.beginPath(); A.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
      c.lineWidth = 2; c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(tip[0], tip[1]); c.stroke();
      c.beginPath(); c.arc(o[0], o[1], 1.8, 0, Math.PI * 2); c.fill();
    });
    // the pencil, leaning on the right of the face in front of it: point on the floor, a dark gap round it
    const PX = R + 4, PL = R + 16, la = 0.3, ca = Math.cos(la), sa = Math.sin(la), w = 2.6;
    const q = (a: number, b: number): V3 => [PX - a * sa - b * ca, 2.5, -B + a * ca - b * sa + B];
    p.face([q(-1, -w - 1), q(PL + 1, -w - 1), q(PL + 1, w + 1), q(-1, w + 1)], 0.015, 0);
    p.face([q(5, -w), q(PL - 3.5, -w), q(PL - 3.5, w), q(5, w)], 0.3, 0);
    p.face([q(0, 0), q(5, -w), q(5, w)], 0.12, 0);
    p.face([q(PL - 3, -w), q(PL, -w), q(PL, w), q(PL - 3, w)], 0.12, 0);
    p.line([q(5, 0), q(PL - 3.5, 0)], 0, 0.6);
  },
};
