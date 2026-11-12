// Notifications are off: a bell with a strike through it. Hover and the strike slides away and the bell rings again.
import { SH, type Illustration, type V3 } from "../dots";

// the bell's profile: radius at each height, from the lip up to the crown
const PROF: [number, number][] = [[0, 12.5], [1.2, 12.2], [2.6, 10.6], [5, 9.4], [9, 8.6], [13, 8.1], [16.5, 7.4], [19.5, 6], [21.5, 4], [22.6, 1.6], [22.9, 0]];
const S = Math.SQRT1_2, Z = 7;
const cl = (x: number) => Math.min(1, Math.max(0, x));
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
// a point on the plane that faces the viewer: u to the right, v up
const scr = (u: number, v: number): V3 => [u * S * 0.82 + 9, -u * S * 0.82 + 9, v];

export const notificationsoff: Illustration = {
  k: "notificationsoff", name: "Muted bell", title: "Notifications are off", body: "Turn notifications on so you do not miss what matters.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.scale(0.9, [0, 0, 20]);
    const on = cl((h - 0.45) / 0.4); // the bell wakes once the strike has gone
    const u = (t % 1.6) / 1.6, env = on * Math.exp(-2.4 * u);
    const ang = 0.26 * env * Math.sin(Math.PI * 2 * 3 * u);
    p.shadow(0, 0, 19, 7, 0.09);
    const pv = p.pt([0, 0, Z + 27.4]);
    p.screen((c) => {
      c.translate(pv[0], pv[1]); c.rotate(ang); c.translate(-pv[0], -pv[1]);
      // the clapper
      p.line([[0, 0, Z + 6], [0, 0, Z - 3.5]], SH.edge, 0.8);
      p.dot([0, 0, Z - 5.2], 2.5, 0.35 + 0.65 * on);
      // the body: the outline of a surface of revolution
      const body: V3[] = [
        ...PROF.map(([z, r]) => [r * S, -r * S, Z + z] as V3),
        ...PROF.slice().reverse().map(([z, r]) => [-r * S, r * S, Z + z] as V3),
        ...front(PROF[0][1], Z).reverse(),
      ];
      p.face(body, 0.1 + 0.03 * on, SH.edge, 0.6);
      const band = (a: number) => PROF.slice(1, 9).map(([z, r]) => [Math.cos(a) * r, Math.sin(a) * r, Z + z] as V3);
      p.face([...band(0.05), ...band(0.45).reverse()], 0.15 + 0.1 * on, 0);
      p.line(front(PROF[1][1], Z + 1.2), SH.edge, 0.6);
      p.ringV("y", [0, 0, Z + 25], 2.4, 0, SH.edge, 1);
    });
    // the strike: a bright bar with a dark gap round it, sliding off to the lower right
    const s = 1 - cl(h / 0.5);
    if (s > 0.02) {
      const a: [number, number] = [-16 + 32 * (1 - s), Z + 28 - 31 * (1 - s)], b: [number, number] = [16, Z - 3];
      const bar = (w: number): V3[] => [scr(a[0] - w, a[1] - w), scr(b[0] - w, b[1] - w), scr(b[0] + w, b[1] + w), scr(a[0] + w, a[1] + w)];
      p.clear(bar(1.5));
      p.face(bar(0.7), 0.9, 0);
    }
    // sound arcs once it rings
    const k = Math.min(1, env * 1.6);
    if (k > 0.05) {
      const [bx, by] = p.pt([0, 0, Z + 12]);
      p.screen((c) => {
        c.lineCap = "round";
        for (const side of [-1, 1]) for (let i = 0; i < 2; i++) {
          const n = Math.round(255 * Math.min(1, k * (1 - i * 0.3)));
          c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.1;
          c.beginPath();
          if (side > 0) c.arc(bx, by, 16 + i * 4.2, -0.5, 0.5); else c.arc(bx, by, 16 + i * 4.2, Math.PI - 0.5, Math.PI + 0.5);
          c.stroke();
        }
      });
    }
  },
};
