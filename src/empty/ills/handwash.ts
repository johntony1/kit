// Nothing logged: a tall pump bottle of hand soap with a drop on its label, big bubbles floating beside it. The pump presses down and a fresh bubble rises from the nozzle, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const R = 10, HB = 30; // body radius and height
const cl = (x: number) => Math.max(0, Math.min(1, x));
const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

export const handwash: Illustration = {
  k: "handwash", name: "Hand wash", title: "Nothing logged", body: "Your routines will appear here once you log the first one.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // the press: down quickly, back up slowly
    const press = u < 0.12 ? Math.sin((u / 0.12) * Math.PI * 0.5) : u < 0.4 ? Math.cos(((u - 0.12) / 0.28) * Math.PI * 0.5) : 0;
    const dz = -2.4 * press;
    p.translate(4, -4, -24);
    p.shadow(0, 0, 22, 11, 0.12);
    // the body: a round bottle, lit on the left, in shade on the right
    const band = (a0: number, a1: number, z0: number, z1: number, f: number, r = R) => p.face([...arc(r, z0, a0, a1), ...arc(r, z1, a1, a0)], f, 0);
    band(-Math.PI / 4, Math.PI / 4, 0, HB, 0.05);
    band(Math.PI / 4, (Math.PI * 3) / 4, 0, HB, 0.085);
    // the label, a bright wrap with a drop cut into it
    band(Math.PI / 4 - 0.75, (Math.PI * 3) / 4 - 0.02, 6, 21, 0.3, R + 0.04);
    const dc = Math.PI * 0.5 - 0.1, dpt = (x: number, z: number): V3 => [Math.cos(dc + x / R) * (R + 0.1), Math.sin(dc + x / R) * (R + 0.1), z];
    p.face(Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return dpt(3.4 * Math.sin(a) * Math.sin(a / 2), 13 + 4.4 * Math.cos(a));
    }), 0.02, 0);
    // the shoulder: rings stepping in and up, lit toward the top
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI * 0.5; p.face(arc(4.2 + (R - 4.2) * Math.cos(a), HB + 3.5 * Math.sin(a), 0, Math.PI * 2, 40), 0.085 + 0.05 * (i / 6), 0); }
    // the collar, a dark seam, then the pump
    p.cylinder(0, 0, HB + 3.5, 4.4, 2.6, { side: 0.12, top: 0.22, edge: 0 });
    p.push();
    p.translate(0, 0, dz);
    p.rotate("z", 0.6);
    p.cylinder(0, 0, HB + 4, 1.5, 7.5, { side: 0.065, top: 0.065, edge: 0 });
    // the head: a round cap, with its nozzle reaching out to the left, a dark seam between them
    p.cylinder(0, 0, HB + 11, 4.2, 3.6, { side: 0.12, top: 0.3, edge: 0 });
    p.box(-1.4, 2.4, HB + 12.4, 2.8, 9.6, 2.2, { top: 0.3, left: 0.2, right: 0.065, edge: 0 });
    p.line([[-1.4, 4.4, HB + 14.62], [1.4, 4.4, HB + 14.62]], SH.edge, 0.7);
    const tip = p.pt([0, 12, HB + 13.4]);
    p.pop();
    // big bubbles beside the bottle: two at rest, and a fresh one rising from the nozzle after each press
    const q = cl((u - 0.15) / 0.8), rise = q * q * (3 - 2 * q);
    const bubbles: [number, number, number, number][] = [
      [tip[0] - 1, tip[1] + 13, 3.4, 1],
      [tip[0] - 5, tip[1] + 5.5, 2.2, 1],
      [tip[0] - 1 - rise * 3, tip[1] - 3 - rise * 9, 1 + 2.2 * cl(q * 3), u < 0.15 || q >= 1 ? 0 : 1],
    ];
    p.screen((g) => {
      g.lineWidth = 1.5;
      for (const [x, y, r, a] of bubbles) {
        if (a <= 0) continue;
        g.strokeStyle = "#fff"; g.fillStyle = "#fff";
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(x - r * 0.38, y - r * 0.38, Math.max(0.45, r * 0.24), 0, Math.PI * 2); g.fill();
      }
    });
  },
};
