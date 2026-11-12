// Nothing to track: a small parcel hops along a route from stop to stop, each one lighting as it lands; at the last the pin jumps, then the route clears.
import { SH, type Illustration } from "../dots";

const P = 3.8; // seconds per loop
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const XS = [-18, -6, 6, 18]; // the stops, along x

export const tracking: Illustration = {
  k: "tracking", name: "Parcel tracker", title: "Nothing to track", body: "Once an order ships, you can follow every stop of its trip here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const fade = 1 - cl((u - 0.88) / 0.1), grow = cl(u / 0.06) * fade;
    // three hops, with a short rest on each stop
    const hops = [0, 1, 2].map((i) => cl((u - 0.08 - i * 0.22) / 0.18));
    const at = hops.reduce((a, b) => a + ease(b), 0); // 0..3, the stop the parcel is at
    const air = hops.reduce((a, b) => a + Math.sin(b * Math.PI), 0);
    p.translate(0, 0, -8);
    p.rotate("z", -0.3);
    p.shadow(0, 0, 30, 9, 0.08);
    // the route between the stops: dim dashes, bright once travelled
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = XS[i] + 4 + j * 1.7, done = at >= i + 1;
      p.line([[x, 0, 0], [x + 0.9, 0, 0]], done ? 0.45 + 0.55 * fade : 0.45, done ? 1 : 0.7);
    }
    const bx = XS[0] + at * 12, s = 2.7 * grow, bz = 1.8 + air * 6;
    XS.forEach((x, i) => {
      // a low round plinth that lights once the parcel has landed on it
      const on = (at >= i ? 1 : 0) * fade * (i === 0 ? grow : 1);
      p.cylinder(x, 0, 0, 4, 1.8, { side: 0.12 + 0.12 * on, top: 0.18 + 0.4 * on, lw: 0.6 });
      // the parcel, drawn with the stop it is nearest
      if (grow > 0.02 && Math.round(at) === i) {
        p.box(bx - s, -s, bz, s * 2, s * 2, s * 1.7, { top: 0.4, left: 0.26, right: 0.13 });
        p.line([[bx, -s, bz + s * 1.7 + 0.03], [bx, s, bz + s * 1.7 + 0.03], [bx, s + 0.03, bz + s * 0.9]], SH.edge, 0.7);
      }
    });
    // the pin over the last stop: it jumps when the parcel arrives
    const arrive = cl((u - 0.7) / 0.16), lift = Math.sin(arrive * Math.PI) * 4 * fade + 5.2 * cl(at - 2) * fade;
    const tip = p.pt([XS[3], 0, 3 + lift]), c = p.pt([XS[3], 0, 15 + lift]), r = 5.6, lit = at > 2.95 && fade > 0.5;
    p.screen((g) => {
      g.beginPath(); g.moveTo(tip[0], tip[1]);
      g.arc(c[0], c[1], r, Math.PI * 0.74, Math.PI * 0.26, false);
      g.closePath(); g.fillStyle = "rgb(70,70,70)"; g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 0.8; g.lineJoin = "round"; g.stroke();
      g.beginPath(); g.arc(c[0], c[1], r * 0.42, 0, Math.PI * 2); g.fillStyle = lit ? "#fff" : "#000"; g.fill(); g.stroke();
    });
  },
};
