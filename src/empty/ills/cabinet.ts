// No data yet: a filing cabinet whose bottom drawer slides out, empty, and back in.
import { pulse, SH, type Illustration } from "../dots";

export const cabinet: Illustration = {
  k: "cabinet", name: "Filing cabinet", title: "No data yet", body: "Your data will appear here once you create or import your first records.",
  kind: "loop", period: 4.2, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const s = pulse(t, 4.2, 0.5) * 10; // how far the drawer is out
    p.translate(-2, -4, -15);
    p.shadow(2, 4, 26, 13, 0.1);
    // feet
    p.box(-5, 3, 0, 2, 2, 2, { top: 0.2 }); p.box(3, 3, 0, 2, 2, 2, { top: 0.2 });
    // body: front faces +y (the left wall on screen)
    p.box(-6, -6, 2, 12, 11, 30);
    p.line([[6, -5.2, 31], [6, -5.2, 31]], 1, 1.2); // lock
    // top drawer, closed
    p.face([[-5, 5, 18], [5, 5, 18], [5, 5, 30], [-5, 5, 30]], 0.14, SH.edge, 0.5);
    p.face([[-1.6, 5.02, 25.5], [1.6, 5.02, 25.5], [1.6, 5.02, 27.5], [-1.6, 5.02, 27.5]], 0.5, SH.edge, 0.4);
    p.line([[-2.6, 5.05, 22.5], [-2.2, 5.05, 21.4], [2.2, 5.05, 21.4], [2.6, 5.05, 22.5]], 0.95, 0.55);
    // the slot the bottom drawer leaves
    p.face([[-5, 5, 4], [5, 5, 4], [5, 5, 16], [-5, 5, 16]], s > 0.4 ? 0.02 : 0.14, SH.edge, 0.5);
    // bottom drawer: an open tray with its runners, then its front panel
    // only the part of the tray that is out of the cabinet shows
    if (s > 0.6) {
      p.box(-4.6, 5, 5, 9.2, s, 9.5, { open: true, left: 0.2, right: 0.12 });
      p.line([[4.7, 5, 6.2], [4.7, 5 + s, 6.2]], 0.8, 0.5); // runner
    }
    p.push(); p.translate(0, s, 0);
    p.face([[-5.4, 5, 4], [5.4, 5, 4], [5.4, 5, 16], [-5.4, 5, 16]], 0.16, SH.edge, 0.55);
    p.face([[-1.6, 5.02, 12.5], [1.6, 5.02, 12.5], [1.6, 5.02, 14.5], [-1.6, 5.02, 14.5]], 0.5, SH.edge, 0.4);
    p.line([[-2.6, 5.05, 9.5], [-2.2, 5.05, 8.4], [2.2, 5.05, 8.4], [2.6, 5.05, 9.5]], 0.95, 0.55);
    p.pop();
    // dust lifting out of the empty drawer
    const k = s / 10;
    if (k > 0.6) for (let i = 0; i < 3; i++) {
      const u = ((t * 0.6 + i / 3) % 1);
      p.dot([-2 + i * 2.2, 2 + s * 0.6, 15 + u * 9], 0.5, (k - 0.6) * 2.5 * (1 - u));
    }
  },
};
