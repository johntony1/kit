// No room service yet: a desk bell, a shiny dome with a bright highlight and a plunger on top, sitting on a round base. Hover and the plunger is pressed, the bell jumps and rings.
import { type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const R = 13, H = 12.5; // the dome's radius and height
const rad = (z: number) => R * Math.sqrt(Math.max(0, 1 - Math.pow(z / H, 2)));
/** the dome: strips of a half ellipsoid, the ones facing us, back to front, shaded by where they look */
function dome(p: Pen, z0: number) {
  const N = 40, M = 9, strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let m = 0; m < M; m++) {
    const za = (H * m) / M, zb = (H * (m + 1)) / M, ra = rad(za), rb = rad(zb);
    for (let j = 0; j < N; j++) {
      const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, c = (a0 + a1) / 2;
      const up = (za + zb) / (2 * H), nx = Math.cos(c) * (1 - up), ny = Math.sin(c) * (1 - up);
      if (nx + ny + up * 1.4 <= 0.02) continue;
      const q = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z0 + z];
      strips.push({ d: (Math.cos(c) + Math.sin(c)) * (ra + rb) / 2 + (za + zb) / 2, pts: [q(a0, ra, za), q(a1, ra, za), q(a1, rb, zb), q(a0, rb, zb)], f: up > 0.6 ? 0.2 : ny > nx ? 0.12 : 0.06 });
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}

export const hotelbell: Illustration = {
  k: "hotelbell", name: "Hotel bell", title: "No room service yet", body: "When guests check in, their stays will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const press = Math.sin(Math.PI * seg(h, 0, 0.4));
    const ring = seg(h, 0.3, 1);
    const jump = Math.sin(Math.PI * seg(h, 0.3, 0.6)) * 1.4;
    const shake = ring > 0 && ring < 1 ? Math.sin(t * 34) * 0.05 * (1 - ring) : 0;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 15, 0.1);
    // the base: a round block with a lit top and a dense side
    p.cylinder(0, 0, 0, 17, 4, { side: 0.065, top: 0.22, edge: 0 });
    p.disc(0, 0, 4.02, 15, 0.02);
    p.push();
    p.translate(0, 0, jump);
    p.rotate("x", shake, [0, 0, 4]);
    // a bright flange, then the dome on it
    p.cylinder(0, 0, 4.4, 13.4, 1.4, { side: 0.3, top: 0.3, edge: 0 });
    dome(p, 5.8);
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(a) * 13, Math.sin(a) * 13, 6] as V3; }), 1, 0.8);
    // the shine: a bright curved stroke on the shaded right of the dome, and a glint
    const sh = Array.from({ length: 9 }, (_, i) => { const a = 0.1 - i * 0.12, z = 3.2 + i * 0.75; return p.pt([Math.cos(a) * rad(z) * 1.02, Math.sin(a) * rad(z) * 1.02, 5.8 + z]); });
    p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 1.8; c.lineCap = "round"; c.beginPath(); sh.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); });
    p.dot([Math.cos(-1.25) * rad(9.6), Math.sin(-1.25) * rad(9.6), 5.8 + 9.6], 1.2, 1);
    // the plunger: a dark stem and a bright round button, pushed down
    const dz = -2 * press, top = 5.8 + H;
    p.cylinder(0, 0, top - 0.6, 1.3, 5.4 + dz, { side: 0.065, top: 0.065, edge: 0 });
    p.cylinder(0, 0, top + 4.8 + dz, 4, 2, { side: 0.12, top: 0.4, edge: 0 });
    p.pop();
    // the ding: short bright strokes either side of the button
    if (ring > 0 && ring < 1) {
      const o = p.pt([0, 0, top + 4]), a = Math.sin(Math.PI * ring), n = Math.round(255 * a);
      p.screen((c) => {
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.5; c.lineCap = "round";
        for (const s of [-1, 1]) for (const ang of [-0.5, 0, 0.5]) {
          const ca = Math.cos(ang) * s, sa = Math.sin(ang) - 0.3, r0 = 7 + ring * 1.5;
          c.beginPath(); c.moveTo(o[0] + ca * r0, o[1] + sa * r0); c.lineTo(o[0] + ca * (r0 + 3), o[1] + sa * (r0 + 3)); c.stroke();
        }
      });
    }
  },
};
