// No appointments: a small clinic with a cross sign on its roof. Hover and the sign rises on its post, the door lights up and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a plus on a wall facing +y: arm half length a, half thickness b */
const plus = (cx: number, y: number, cz: number, a: number, b: number): V3[] =>
  ([[-b, a], [b, a], [b, b], [a, b], [a, -b], [b, -b], [b, -a], [-b, -a], [-b, -b], [-a, -b], [-a, b], [-b, b]] as [number, number][]).map(([u, v]) => [cx + u, y, cz + v] as V3);
const wall = (x0: number, x1: number, y: number, z0: number, z1: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.35); g.stroke();
  });
}

export const appointment: Illustration = {
  k: "appointment", name: "Doctor visit", title: "No appointments", body: "Book a visit with your doctor and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(clamp(h / 0.6));
    p.translate(0, 0, -14);
    p.shadow(0, 2, 28, 14, 0.1);
    p.rotate("z", -0.4);
    // the building
    p.box(-13, -8, 0, 26, 16, 14.5, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    for (const y of [-4.6, 1.6]) p.face([[13.03, y, 7], [13.03, y + 3.4, 7], [13.03, y + 3.4, 11.4], [13.03, y, 11.4]], 0.02, SH.soft, 0.45);
    // the front: a door between two windows, under a small awning
    const F = 8.03;
    for (const x of [-10.4, 5.6]) {
      p.face(wall(x, x + 4.8, F, 6.4, 11.4), 0.025, SH.edge, 0.5);
      p.line([[x + 2.4, F + 0.02, 6.4], [x + 2.4, F + 0.02, 11.4]], 0.6, 0.4);
    }
    p.clear(wall(-3, 3, F, 0, 8.6));
    if (e > 0.02) p.face(wall(-3, 3, F + 0.02, 0, 8.6), 0.36 * e, SH.edge, 0.5);
    p.line([[0, F + 0.04, 0], [0, F + 0.04, 8.6]], e > 0.5 ? 0 : 0.6, 0.45);
    p.box(-4.6, 8, 9.4, 9.2, 3.2, 1, { top: 0.26, left: 0.16, right: 0.08, lw: 0.5 });
    // the roof slab
    p.box(-14.2, -9.2, 14.5, 28.4, 18.4, 1.7, { top: 0.22, left: 0.14, right: 0.07, lw: 0.6 });
    // the sign: a dark plaque with a bright cross, rising on a post
    const zs = 16.2 + 4.6 * e;
    if (e > 0.02) p.box(-0.7, 3.8, 16.2, 1.4, 1.4, zs - 16.2, { top: 0.2, left: 0.2, right: 0.1, edge: 0 });
    p.box(-5.4, 3, zs, 10.8, 3, 10.8, { top: 0.22, left: 0.03, right: 0.07, lw: 0.6 });
    p.face(plus(0, 6.04, zs + 5.4, 4, 1.4), 0.36, SH.edge, 0.5);
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) tick(p, [17, 1, 29], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
