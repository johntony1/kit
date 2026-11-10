// No music yet: a record player. Hover and the platter spins up, the tone arm swings onto the record and notes drift up.
import { SH, type Illustration, type V3 } from "../dots";

const X = 15, Y = 12, H = 5; // half width, half depth, height of the base
const CX = -3.2, CY = 0, R = 10; // the platter
const PX = 11, PY = -7.5; // the tone arm's pivot

const ring = (r: number, z: number, a0 = 0, a1 = Math.PI * 2, n = 40): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r, z] as V3; });

export const record: Illustration = {
  k: "record", name: "Record player", title: "No music yet", body: "Add a song or a playlist and it will be ready to play here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -5);
    p.shadow(0, 0, 30, 14, 0.12);
    // feet, then the base with a lit top
    for (const [x, y] of [[-X + 1.5, Y - 3], [X - 3, Y - 3], [X - 3, -Y + 1.5]]) p.box(x, y, -1.2, 1.5, 1.5, 1.2, { top: 0.2 });
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.2, left: 0.12, right: 0.065 });
    // the front: a speed switch and a lit knob
    const fy = Y + 0.04;
    p.line([[-X + 2, fy, H - 1.2], [X - 2, fy, H - 1.2]], SH.edge, 0.5);
    p.face([[X - 9, fy, 1.2], [X - 5.5, fy, 1.2], [X - 5.5, fy, 2.6], [X - 9, fy, 2.6]], 0.03, 0);
    p.dot([X - 9 + 0.8 + 1.9 * Math.min(1, h * 2), fy, 1.9], 0.7, 1);
    p.ringV("y", [X - 2.8, fy, 2.2], 1.3, 0.3, 0);
    // the platter, a little proud of the base
    p.cylinder(CX, CY, H, R + 0.6, 1.4, { side: 0.12, top: 0.13 });
    // the record: dense vinyl with grooves cut in, two dull sheens that turn with it, and a lit label
    const z = H + 1.42, spin = t * 5.5 * h;
    p.disc(CX, CY, z, R, 0.12);
    for (const a of [spin, spin + Math.PI]) p.face([...ring(4.2, z + 0.01, a, a + 0.8, 8), ...ring(9.4, z + 0.01, a, a + 0.8, 8).reverse()], SH.right, 0);
    for (const r of [6, 8]) p.line(ring(r, z + 0.02), SH.edge, 0.45);
    p.disc(CX, CY, z + 0.03, 3.3, 0.3);
    p.line([[CX + Math.cos(spin + 1.2) * 1.2, CY + Math.sin(spin + 1.2) * 1.2, z + 0.05], [CX + Math.cos(spin + 1.2) * 2.8, CY + Math.sin(spin + 1.2) * 2.8, z + 0.05]], SH.edge, 0.6);
    p.dot([CX, CY, z + 0.3], 0.55, 0.02);

    // the tone arm: a post and a counterweight at the back corner, swinging over the record on hover
    p.cylinder(PX, PY, H, 2.2, 0.8, { side: 0.12, top: 0.22 });
    p.cylinder(PX, PY, H + 0.8, 1, 3.4, { side: 0.12, top: 0.24 });
    // the rest it parks on
    p.cylinder(PX + 1, PY + 13.5, H, 0.7, 2.6, { side: 0.12, top: 0.24 });
    p.push();
    p.rotate("z", h * 0.6, [PX, PY, 0]);
    const az = H + 3.6;
    p.box(PX - 1.3, PY - 4.6, az - 1, 2.6, 2.6, 2.6, { top: 0.24, left: 0.14, right: 0.065 }); // counterweight
    p.line([[PX - 1.3, PY - 2, az + 1.6], [PX + 1.3, PY - 2, az + 1.6], [PX + 1.3, PY - 2, az - 1]], SH.edge, 0.5);
    // the arm: a thin tube with a dark rim so it reads against the lit top, then the headshell
    const arm = ([[PX, PY, az + 0.4], [PX, PY + 9, az + 0.4], [PX - 0.9, PY + 12.8, az]] as V3[]).map((v) => p.pt(v));
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      for (const [w, v] of [[2.8, 0], [1.3, 1]] as const) {
        const n = Math.round(v * 255);
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = w;
        c.beginPath(); arm.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    });
    p.box(PX - 2, PY + 12, az - 0.9, 2.4, 3.4, 1.2, { top: 0.3, left: 0.14, right: 0.065 }); // headshell
    p.line([[PX - 2, PY + 15.4, az + 0.3], [PX - 2, PY + 12, az + 0.3], [PX + 0.4, PY + 12, az + 0.3]], SH.edge, 0.5);
    p.pop();

    // notes drifting up once it plays
    const k = Math.max(0, (h - 0.6) / 0.4);
    if (k > 0) {
      const [nx, ny] = p.pt([CX, CY, z + 4]);
      p.screen((c) => {
        for (let i = 0; i < 3; i++) {
          const u = (t * 0.35 + i / 3) % 1;
          const a = k * Math.sin(u * Math.PI);
          if (a < 0.05) continue;
          const n = Math.round(255 * Math.min(1, a * 1.4));
          c.fillStyle = c.strokeStyle = `rgb(${n},${n},${n})`;
          const x = nx - 9 + i * 8 + Math.sin(u * 6 + i) * 1.5, y = ny - 2 - u * 13;
          c.beginPath(); c.ellipse(x, y, 1.6, 1.15, -0.4, 0, Math.PI * 2); c.fill();
          c.lineWidth = 0.75; c.beginPath(); c.moveTo(x + 1.3, y - 0.3); c.lineTo(x + 1.3, y - 5.6); c.lineTo(x + 3.4, y - 4.4); c.stroke();
        }
      });
    }
  },
};
