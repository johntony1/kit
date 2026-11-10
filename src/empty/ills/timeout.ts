// Request timed out: a stopwatch. The hand sweeps round, shading the time it has used, and buzzes when it comes back to the top.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 4;
const R = 12.5, D = 2.6, CZ = R + 0.6; // radius, half thickness, height of the centre (the face looks toward +y)

// a point on the face plane at angle a (clockwise from twelve) and radius r
const at = (a: number, r: number, y = D): V3 => [Math.sin(a) * r, y, CZ + Math.cos(a) * r];
const circle = (r: number, y = D, n = 48): V3[] => Array.from({ length: n }, (_, i) => at((i / n) * Math.PI * 2, r, y));

export const timeout: Illustration = {
  k: "timeout", name: "Stopwatch", title: "Request timed out", body: "This is taking longer than it should. Check your connection and try again.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const a = u * Math.PI * 2;
    // the buzz at twelve: a quick shake that dies away
    const bz = u < 0.14 ? Math.sin((u / 0.14) * Math.PI) : 0;
    const shake = bz * 0.06 * Math.sin(u * 260);
    p.translate(0, 0, -15);
    p.rotate("z", -0.6); // turn the face toward us
    p.shadow(0, 0, 16, 8, 0.12);
    p.push();
    p.rotate("y", shake, [0, 0, 0]);

    // the crown and the button on top (drawn first: the case covers their feet)
    const press = bz * 0.9;
    p.cylinder(0, 0, CZ + R - 0.6, 1.6, 3.4 - press, { side: SH.left, top: 0.2 });
    p.cylinder(0, 0, CZ + R + 2.8 - press, 3.2, 2, { side: SH.left, top: 0.24 });
    // a side button at two o'clock
    p.push();
    p.rotate("y", Math.PI / 3.2, [0, 0, CZ]);
    p.box(-1.5, -1.5, CZ + R - 0.8, 3, 3, 3.4, { top: 0.22, left: SH.left, right: SH.right });
    p.pop();

    // the case: slices from back to front make the rim, then the front ring
    for (let i = 0; i <= 8; i++) p.face(circle(R, -D + (i / 8) * 2 * D), 0.12, 0);
    p.face(circle(R), 0.24, 0);
    p.line(circle(R - 1.5, D + 0.02).concat([at(0, R - 1.5, D + 0.02)]), SH.edge, 0.6);
    // the time used so far: a darker wedge from twelve to the hand
    if (a > 0.05) {
      const n = Math.max(2, Math.ceil(a / 0.12));
      p.face([[0, D + 0.03, CZ], ...Array.from({ length: n + 1 }, (_, i) => at((a * i) / n, R - 2.6, D + 0.03))], 0.055, 0);
    }
    // ticks: twelve, the quarters longer
    for (let i = 0; i < 12; i++) {
      const b = (i / 12) * Math.PI * 2, long = i % 3 === 0;
      p.line([at(b, R - 2.4, D + 0.04), at(b, long ? R - 4.6 : R - 3.6, D + 0.04)], SH.edge, long ? 0.8 : 0.55);
    }
    // the hand, with a short tail, and the hub
    p.line([at(a + Math.PI, 2.2, D + 0.05), at(a, R - 3.4, D + 0.05)], SH.edge, 0.95);
    p.clear(circle(1.25, D + 0.06, 20));
    p.pop();

    // the buzz: arcs either side of the crown
    if (bz > 0.05) {
      const [cx, cy] = p.pt([0, 0, CZ + R + 3.5]);
      p.screen((c) => {
        c.lineCap = "round"; c.lineWidth = 1.1;
        const n = Math.round(255 * Math.min(1, bz * 1.5));
        c.strokeStyle = `rgb(${n},${n},${n})`;
        for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
          const r = 6 + i * 3.2;
          c.beginPath();
          if (s > 0) c.arc(cx, cy, r, -Math.PI / 2 + 0.45, -Math.PI / 2 + 1.05); else c.arc(cx, cy, r, -Math.PI / 2 - 1.05, -Math.PI / 2 - 0.45);
          c.stroke();
        }
      });
    }
  },
};
