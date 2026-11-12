// No traffic yet: a load balancer over three servers, joined by a bright bus. Requests drop from it to each server in turn and that server's light comes on.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const XS = [-14.5, 0, 14.5]; // where the servers stand
const SV = 13, BUS = 17, TOP = 22.4, D = 2.2; // server height, bus height, underside of the balancer, half depth

export const loadbalancer: Illustration = {
  k: "loadbalancer", name: "Load balancer", title: "No traffic yet", body: "Point your traffic here and requests will be spread across your servers.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) % 1) * 3, turn = Math.floor(u) % 3, k = u - Math.floor(u);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 28, 10, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 1, 0);
    // the three servers, well apart: lit tops, two bay cuts across each front, a status light
    XS.forEach((cx, i) => {
      const hit = i === turn && k > 0.62 ? Math.sin(((k - 0.62) / 0.38) * Math.PI) : 0;
      p.box(cx - 4.6, -D, 0, 9.2, D * 2, SV, { top: 0.3, left: 0.13 + 0.17 * hit, right: 0.065, edge: 0 });
      for (const z of [4.3, 8.6]) p.line([[cx - 4.6, D + 0.03, z], [cx + 4.6, D + 0.03, z]], SH.edge, 0.9);
      p.dot([cx + 2.6, D + 0.05, 10.8], 0.9, hit > 0 ? 1 : 0);
    });
    // the bus: a drop to each server, a bar across, a riser to the balancer
    for (const cx of XS) p.box(cx - 0.8, -0.8, SV, 1.6, 1.6, BUS - SV, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.box(XS[0] - 0.8, -0.8, BUS, XS[2] - XS[0] + 1.6, 1.6, 1.6, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.box(-0.8, -0.8, BUS + 1.6, 1.6, 1.6, TOP - BUS - 1.6, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    // the balancer: a wide bright block with three dark ports
    p.box(-8, -D, TOP, 16, D * 2, 8, { top: 0.3, left: 0.24, right: 0.065, edge: 0 });
    for (let i = 0; i < 3; i++) p.dot([-4.4 + i * 4.4, D + 0.06, TOP + 4], 1.3, 0);
    // the request: a bright dot down the riser, along the bar and down to its server
    if (k < 0.66) {
      const cx = XS[turn], v = k / 0.66;
      const a = TOP - BUS - 0.8, b = Math.abs(cx), c = BUS + 0.8 - SV, L = a + b + c, d = v * L;
      const at: V3 = d < a ? [0, 0.9, TOP - d] : d < a + b ? [Math.sign(cx) * (d - a), 0.9, BUS + 0.8] : [cx, 0.9, BUS + 0.8 - (d - a - b)];
      p.dot(at, 2.4, 1);
    }
  },
};
