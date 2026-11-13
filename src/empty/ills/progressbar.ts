// Nothing in progress: a big rounded progress bar seen from the front, a bright striped fill on the left and a dark empty track on the right, a percent badge riding over the end of the fill. Over and over the fill grows toward the end and eases back while its stripes march along.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const L = 19, ZC = 12, R = 8; // half length, centre height, half height of the bar

export const progressbar: Illustration = {
  k: "progressbar", name: "Progress bar", title: "Nothing in progress", body: "Start a task and you can follow how far along it is right here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const f = 0.3 + 0.42 * (0.5 - 0.5 * Math.cos(u * Math.PI * 2)); // how full
    p.translate(0, 0, -16);
    p.shadow(0, 0, 22, 8, 0.12);
    p.rotate("z", -0.62); // turned to face us
    const pill = (x0: number, x1: number, r: number, y: number): V3[] => {
      const out: V3[] = [];
      for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; out.push([x1 + Math.cos(a) * r, y, ZC + Math.sin(a) * r]); }
      for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; out.push([x0 + Math.cos(a) * r, y, ZC + Math.sin(a) * r]); }
      return out;
    };
    // the bar: a thick shell with a lit rim, its empty track dark
    for (let y = -3; y < 0; y += p.ink ? 3 : 0.4) p.face(pill(-L + R, L - R, R, y), SH.right, 0);
    p.face(pill(-L + R, L - R, R, 0), 0.2, 0);
    p.face(pill(-L + R, L - R, R - 1.5, 0.03), 0.03, 0);
    // the fill: bright, with dark diagonal stripes marching to the right
    const IR = R - 2.8, x1 = -L + R + f * (2 * L - 2 * R);
    const fill = pill(-L + R, x1, IR, 0.06);
    p.face(fill, 0.3, 0);
    const q = fill.map((v) => p.pt(v));
    const [ax, ay] = p.pt([-L, 0.08, ZC - IR]), [bx, by] = p.pt([-L + 4.4, 0.08, ZC + IR]);
    const step = p.pt([-L + 6, 0.08, ZC - IR]);
    const sx = step[0] - ax, sy = step[1] - ay;
    p.screen((g) => {
      g.save();
      g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
      g.fillStyle = "#000";
      for (let i = -1; i < 10; i++) {
        const o = i + u * 2; // two stripes per loop: seamless
        const x0 = ax + sx * o, y0 = ay + sy * o, x1b = bx + sx * o, y1b = by + sy * o;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + sx * 0.42, y0 + sy * 0.42); g.lineTo(x1b + sx * 0.42, y1b + sy * 0.42); g.lineTo(x1b, y1b); g.closePath(); g.fill();
      }
      g.restore();
    });
    // the percent badge over the end of the fill: a lit pill with a point and a percent mark cut in
    const BZ = ZC + R + 7, bw = 5.6, bh = 4.4, by0 = 0.5;
    const badge: V3[] = [];
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI; badge.push([x1 + bw - bh + Math.cos(a) * bh, by0, BZ + Math.sin(a) * bh]); }
    for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i / 10) * Math.PI; badge.push([x1 - bw + bh + Math.cos(a) * bh, by0, BZ + Math.sin(a) * bh]); }
    p.face([[x1 - 1.8, by0, BZ - bh + 0.2], [x1 + 1.8, by0, BZ - bh + 0.2], [x1, by0, BZ - bh - 2.2]], 0.3, 0);
    p.face(badge, 0.3, 0);
    p.line([[x1 - 2, by0 + 0.03, BZ - 2.6], [x1 + 2, by0 + 0.03, BZ + 2.6]], SH.edge, 1);
    p.dot([x1 - 1.9, by0 + 0.04, BZ + 1.7], 0.95, 0);
    p.dot([x1 + 1.9, by0 + 0.04, BZ - 1.7], 0.95, 0);
  },
};
