// Everything is off: a wall light switch, a rounded plate with two screws and a big rocker pressed to off. Hover and the rocker clicks over to on and its little light glows.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const K = 0.57735;
const PW = 11.5, PH = 33, PR = 3.5; // the plate's half width, height and corner radius
/** the plane that faces us: u to the right, v up, d a little depth going back up and to the right (out toward us when negative) */
const B = (u: number, v: number, d = 0): V3 => { const x = u + d * 0.5; return [x * K, -x * K, v + d * 0.36]; };
const plate = (d: number): V3[] => {
  const o: V3[] = [];
  const corners: [number, number, number][] = [[PW - PR, PR, -0.5], [PW - PR, PH - PR, 0], [-PW + PR, PH - PR, 0.5], [-PW + PR, PR, 1]];
  for (const [cu, cv, q] of corners) for (let i = 0; i <= 6; i++) { const a = (q + i / 12) * Math.PI; o.push(B(cu + Math.cos(a) * PR, cv + Math.sin(a) * PR, d)); }
  return o;
};
const rect = (u0: number, v0: number, u1: number, v1: number, d = 0): V3[] => [B(u0, v0, d), B(u1, v0, d), B(u1, v1, d), B(u0, v1, d)];

export const lightswitch: Illustration = {
  k: "lightswitch", name: "Light switch", title: "Everything is off", body: "Nothing is switched on yet. Turn something on and it will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const s = ease(clamp((h - 0.1) / 0.3)); // 0 off, 1 on
    const glow = clamp((h - 0.4) / 0.3);
    p.translate(-1, 1, -17);
    p.shadow(0, 0, 18, 8, 0.08);
    // the plate: its edge in shade, then a bright front with a cut round it
    for (let d = 3; d > 0; d -= 0.4) p.face(plate(d), 0.08, 0);
    const f = plate(0);
    p.face(f, 0.22, 0);
    p.line([...f, f[0]], 1, 0.8);
    // two screws
    for (const v of [3.4, PH - 3.4]) { p.dot(B(0, v), 1.5, 0); p.line([B(-0.9, v), B(0.9, v)], 0.3, 0.5); }
    // the dark recess the rocker sits in
    const U = 5.4, V0 = 8.4, V1 = PH - 8.4;
    p.face(rect(-U, V0, U, V1), 0.03, 0);
    // the rocker: tilted so one half stands out of the plate. Off: its top stands out; on: its bottom
    const u = U - 0.8, a0 = V0 + 0.8, a1 = V1 - 0.8, dt = -2.8 * (1 - s), db = -2.8 * s;
    const TL = B(-u, a1, dt), TR = B(u, a1, dt), BR = B(u, a0, db), BL = B(-u, a0, db);
    p.face([TL, TR, B(u, a1, 0), B(-u, a1, 0)], 0.3, 0); // its top wall, lit
    p.face([TR, BR, B(u, a0, 0), B(u, a1, 0)], 0.06, 0); // its right wall, in shade
    p.face([BL, BR, TR, TL], 0.12 + 0.16 * s, 0);
    p.line([BL, BR, TR, TL, BL], 1, 0.8);
    // the little light near its top: dark when off, glowing when on
    const L = B(0, a1 - 3, dt + (db - dt) * (3 / (a1 - a0)));
    p.dot(L, 1.9, 0);
    if (glow > 0) {
      p.dot(L, 1.4 * glow, 1);
      const [x, y] = p.pt(L), r0 = 3.4, r1 = r0 + 2.4 * glow * (1 + 0.1 * Math.sin(t * 5));
      p.screen((g) => {
        g.strokeStyle = "#000"; g.lineWidth = 2.8; g.lineCap = "round";
        const rays = () => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55; g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); } g.stroke(); };
        rays(); g.strokeStyle = "#fff"; g.lineWidth = 1.3; rays();
      });
    }
  },
};
