// No restock alerts: a counter bell sitting on a crate. Hover and the button dips, the bell rings and sound arcs spread from both sides.
import { SH, type Illustration, type V3 } from "../dots";

const S = Math.SQRT1_2;
const R = 9, ZB = 11.4; // radius of the dome, height of its foot
// the dome's profile: radius at each height
const PROF: [number, number][] = Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * (Math.PI / 2); return [Math.sin(a) * R * 0.86, Math.cos(a) * R] as [number, number]; });
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const restock: Illustration = {
  k: "restock", name: "Restock bell", title: "No restock alerts", body: "Ask to be told when something sold out comes back. Your alerts will ring here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // a ring every 1.4 s while hovered
    const u = (t % 1.4) / 1.4, env = h * Math.exp(-3 * u);
    const press = h * Math.max(0, 1 - u * 5), shake = env * Math.sin(u * Math.PI * 14) * 0.5;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 26, 13, 0.11);
    // the crate: slats on both sides
    p.box(-11, -9, 0, 22, 18, 9, { top: 0.2, left: 0.12, right: 0.065 });
    for (const z of [3, 6]) p.line([[-11, 9.03, z], [11, 9.03, z], [11.03, -9, z]], 0.7, 0.45);
    p.translate(shake, -shake, 0);
    // the bell's base plate
    p.cylinder(0, 0, 9, R + 1.4, 1.4, { side: 0.3, top: 0.26, lw: 0.55 });
    // the dome: the outline of a half ball, lit, with a highlight
    const dome: V3[] = [
      ...PROF.map(([z, r]) => [r * S, -r * S, ZB + z] as V3),
      ...PROF.slice().reverse().map(([z, r]) => [-r * S, r * S, ZB + z] as V3),
      ...front(R, ZB).reverse(),
    ];
    p.face(dome, 0.15, SH.edge, 0.6);
    p.line(front(R, ZB), SH.edge, 0.6);
    const band = (a: number) => PROF.slice(1, 10).map(([z, r]) => [Math.cos(a) * r, Math.sin(a) * r, ZB + z] as V3);
    p.face([...band(1.7), ...band(2.15).reverse()], 0.5, 0);
    // the button on top, dipping when it rings
    const zt = ZB + R * 0.86 - 0.3;
    p.cylinder(0, 0, zt, 1.5, 2.6 - press * 1.7, { side: 0.5, top: 0.9, lw: 0.5 });
    // sound: arcs to the left and right, fading as the ring dies away
    const k = Math.min(1, env * 1.8);
    if (k > 0.05) {
      const [bx, by] = p.pt([0, 0, ZB + 4]);
      p.screen((c) => {
        c.lineCap = "round"; c.lineWidth = 1.1;
        for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
          const a = k * (1 - i * 0.25) * Math.min(1, u * 12 - i * 0.6);
          if (a < 0.08) continue;
          const n = Math.round(255 * Math.min(1, a)), r = 17 + i * 4.4 + u * 3;
          c.strokeStyle = `rgb(${n},${n},${n})`;
          c.beginPath();
          if (side > 0) c.arc(bx, by, r, -0.75, 0.15); else c.arc(bx, by, r, Math.PI - 0.15, Math.PI + 0.75);
          c.stroke();
        }
      });
    }
  },
};
