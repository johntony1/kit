// You're all caught up: a classic mailbox on a post. Hover and the door drops open on an empty box and the flag goes up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 5, H = 5.5, Z0 = 17; // roof radius, height of the straight walls, floor of the box
const x0 = -8, x1 = 8; // back end, front end (the front faces +x)
const arc = (x: number, a: number): V3 => [x, Math.cos(a) * R, Z0 + H + Math.sin(a) * R];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

export const mailbox: Illustration = {
  k: "mailbox", name: "Mailbox", title: "You're all caught up", body: "When you get mentions, updates or alerts, they show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-2, -1, -12);
    p.shadow(0, 0, 17, 8.5, 0.12);
    // post and the bracket that holds the box
    p.box(-1.6, -1.6, 0, 3.2, 3.2, Z0 - 1, { top: 0.25, left: 0.2, right: 0.1 });
    p.box(-5, -2.6, Z0 - 1.4, 10, 5.2, 1.4, { top: 0.2, left: 0.16, right: 0.08 });
    // the half round roof, back strips first, shaded by how much each strip faces up
    const N = 16;
    for (let i = N - 1; i >= 0; i--) {
      const a0 = (Math.PI * i) / N, a1 = (Math.PI * (i + 1)) / N, m = (a0 + a1) / 2;
      if (Math.cos(m) + Math.sin(m) < -0.2) continue;
      p.face([arc(x0, a0), arc(x1, a0), arc(x1, a1), arc(x0, a1)], 0.08 + 0.15 * Math.max(0, Math.sin(m)) + 0.04 * Math.max(0, Math.cos(m)), 0);
    }
    // the straight wall facing us (+y)
    p.face([[x0, R, Z0], [x1, R, Z0], [x1, R, Z0 + H], [x0, R, Z0 + H]], 0.12, SH.edge, 0.55);
    // outline: the far silhouette of the roof and the back rim
    p.line([arc(x0, Math.PI * 0.75), arc(x1, Math.PI * 0.75)], SH.edge, 0.55);
    p.line(Array.from({ length: 13 }, (_, i) => arc(x0, (Math.PI * 0.75 * i) / 12)), SH.edge, 0.55);
    // a rolled seam near the front end
    p.line(Array.from({ length: 13 }, (_, i) => arc(x1 - 1.6, (Math.PI * 0.75 * i) / 12)), 0.45, 0.45);
    p.line([[x1 - 1.6, R, Z0], [x1 - 1.6, R, Z0 + H]], 0.45, 0.45);

    // the opening at the front end: dark, with the empty floor and far wall inside
    const prof: V3[] = [[x1, -R, Z0], [x1, R, Z0], ...Array.from({ length: 17 }, (_, i) => arc(x1, (Math.PI * i) / 16))];
    p.face(prof, 0.02, SH.edge, 0.55);
    if (h > 0.02) {
      p.screen((c) => {
        const q = prof.map((v) => p.pt(v));
        c.beginPath(); q.forEach(([sx, sy], i) => (i ? c.lineTo(sx, sy) : c.moveTo(sx, sy))); c.closePath(); c.clip();
        const k = Math.min(1, h * 1.6);
        p.face([[x0, -R, Z0 + 0.3], [x1, -R, Z0 + 0.3], [x1, -R, Z0 + H], [x0, -R, Z0 + H]], 0, 0.3 * k, 0.4);
        p.face([[x0, -R, Z0 + 0.3], [x1, -R, Z0 + 0.3], [x1, R, Z0 + 0.3], [x0, R, Z0 + 0.3]], 0.045 * k, 0.4 * k, 0.4);
      });
    }

    // the flag on the near side: lies along the wall pointing back, swings straight up on hover
    const fx = x1 - 5, fy = R + 0.45, fz = Z0 + 2.2;
    p.push();
    p.rotate("y", h * Math.PI * 0.5, [fx, fy, fz]);
    p.face([[fx - 11, fy, fz - 0.5], [fx, fy, fz - 0.5], [fx, fy, fz + 0.5], [fx - 11, fy, fz + 0.5]], 0.14 + 0.2 * h, 0.6 + 0.4 * h, 0.5);
    p.face([[fx - 11, fy, fz + 0.5], [fx - 7.5, fy, fz + 0.5], [fx - 7.5, fy, fz + 3.6], [fx - 11, fy, fz + 3.6]], 0.14 + 0.82 * h, 0.7 + 0.3 * h, 0.55);
    p.pop();
    p.dot([fx, fy + 0.05, fz], 0.7, 1);

    // the door, hinged along its bottom edge, dropping down and out
    p.push();
    p.rotate("y", h * 1.7, [x1, 0, Z0]);
    const door = prof.map(([x, y, z]) => [x + 0.05, y, z] as V3);
    const out = facing(p, door) > 0;
    p.face(door, out ? 0.2 : 0.08, SH.edge, 0.6);
    if (out) p.line([[x1 + 0.1, 0, Z0 + H + R - 2.2], [x1 + 0.1, 0, Z0 + H + R + 0.8]], 1, 1.1); // latch
    else p.face([[x1 + 0.1, -R + 1.2, Z0 + 1], [x1 + 0.1, R - 1.2, Z0 + 1], [x1 + 0.1, R - 1.2, Z0 + H + 2], [x1 + 0.1, -R + 1.2, Z0 + H + 2]], 0.04, 0.35, 0.4);
    p.pop();
  },
};
