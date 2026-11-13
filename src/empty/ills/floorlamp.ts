// Nothing lit yet: a floor lamp, a tall tapered shade on a slim pole and a round base, switched off. Hover and its pull cord tugs down, the shade lights up and a pool of light spreads on the floor.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ZB = 26, ZT = 39, RB = 12, RT = 8; // the shade: bottom and top heights and radii
const ring = (r: number, z: number, a0 = 0, a1 = Math.PI * 2, n = 40): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const floorlamp: Illustration = {
  k: "floorlamp", name: "Floor lamp", title: "Nothing lit yet", body: "Turn something on and it will light up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const tug = h < 0.35 ? Math.sin((h / 0.35) * Math.PI) : 0;
    const e = ease(clamp((h - 0.3) / 0.45)) * (1 + h * Math.sin(t * 5) * 0.03);
    p.translate(0, 0, -21);
    p.shadow(0, 0, 18, 9, 0.11);
    // the pool of light on the floor
    if (e > 0.02) p.disc(0, 0, 0.02, 13, 0.05 + 0.23 * e, 0);
    // the base and the pole
    p.cylinder(0, 0, 0, 7, 2, { side: 0.13, top: 0.24, edge: 0 });
    p.line(ring(7, 2, -Math.PI / 4, (3 * Math.PI) / 4, 20), SH.edge, 0.6);
    p.box(-1, -1, 2, 2, 2, ZB + 2, { top: 0.3, left: 0.26, right: 0.12, edge: 0 });
    // the top opening: dark inside, glowing once lit
    p.face(ring(RT, ZT).slice(0, -1), 0.04 + 0.26 * e, 0);
    // the shade: its right side sparse, its left side dense, all of it bright when lit
    const N = 24;
    for (let i = 0; i < N; i++) {
      const a0 = -Math.PI / 4 + (i / N) * Math.PI, a1 = a0 + Math.PI / N, k = (i + 0.5) / N;
      const off = 0.085 + 0.09 * k, on = 0.22 + 0.1 * k, f = off + (on - off) * e;
      p.face([[RB * Math.cos(a0), RB * Math.sin(a0), ZB], [RB * Math.cos(a1), RB * Math.sin(a1), ZB], [RT * Math.cos(a1), RT * Math.sin(a1), ZT], [RT * Math.cos(a0), RT * Math.sin(a0), ZT]], f, 0);
    }
    p.line(ring(RT, ZT), SH.edge, 0.7);
    p.line(ring(RB - 0.5, ZB + 1.6, -Math.PI / 4, (3 * Math.PI) / 4, 24), SH.edge, 0.6);
    // the pull cord with its bead, hanging at the front
    const a = Math.PI / 4 + 0.55, top: V3 = [Math.cos(a) * (RB - 1), Math.sin(a) * (RB - 1), ZB];
    const [x0, y0] = p.pt(top), [x1, y1] = p.pt([top[0], top[1], ZB - 6 - 3 * tug]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1; g.lineCap = "round";
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(x1, y1, 1.5, 0, Math.PI * 2); g.fill();
    });
  },
};
