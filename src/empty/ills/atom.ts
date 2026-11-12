// Atom: a nucleus with three orbits crossing round it. An electron runs along each orbit, passing behind the nucleus and out in front again.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const TAU = Math.PI * 2;
const RX = 25, RY = 8.2; // an orbit's half width and half height on screen
const C: V3 = [0, 0, 0];
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.5774, c[1] - u * 0.5774, c[2] + v];
/** a point on orbit i (screen offsets from the centre) */
const orb = (i: number, a: number): [number, number] => {
  const r = (i * Math.PI) / 3, x = Math.cos(a) * RX, y = Math.sin(a) * RY;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};
function ball(p: Pen, c: V3, r: number, lit: number) {
  const disc = (q: number, du: number, dv: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * TAU; return bb(c, Math.cos(a) * q + du, Math.sin(a) * q + dv); });
  p.face(disc(r, 0, 0), 0.1, 0);
  p.face(disc(r * 0.82, -r * 0.12, r * 0.12), lit, 0);
  p.line([...disc(r, 0, 0), disc(r, 0, 0)[0]], 1, 0.5);
}

export const atom: Illustration = {
  k: "atom", name: "Atom", title: "No science projects yet", body: "Create a project and your experiments and notes will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -1);
    p.shadow(0, 0, 22, 11, 0.07);
    const [ox, oy] = p.pt(C);
    const arc = (i: number, a0: number, a1: number, v: number, lw: number) => p.screen((g) => {
      g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = lw; g.lineCap = "round"; g.beginPath();
      for (let k = 0; k <= 40; k++) { const [x, y] = orb(i, a0 + ((a1 - a0) * k) / 40); if (k) g.lineTo(ox + x, oy + y); else g.moveTo(ox + x, oy + y); }
      g.stroke();
    });
    const electron = (i: number, front: boolean) => {
      const a = (ph + i / 3) * TAU + i * 0.7;
      if ((Math.sin(a) > 0) !== front) return;
      const [x, y] = orb(i, a);
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(ox + x, oy + y, front ? 3 : 2.4, 0, TAU); g.fill(); });
    };
    // the far halves of the orbits, and any electron that is round the back
    for (let i = 0; i < 3; i++) { arc(i, Math.PI, TAU, 150, 1.4); electron(i, false); }
    // the nucleus: three particles packed together
    ball(p, bb(C, 3.2, 2.8), 5.2, 0.2);
    ball(p, bb(C, -3.6, 1.4), 5.2, 0.26);
    ball(p, bb(C, 0.4, -3.2), 5.2, 0.32);
    // the near halves, over the nucleus
    for (let i = 0; i < 3; i++) { arc(i, 0, Math.PI, 255, 1.9); electron(i, true); }
  },
};
