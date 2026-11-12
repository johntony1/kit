// No shows yet: a small concert stage with a lighting truss, a mic and two speaker stacks. The three spotlights sweep across the empty stage.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop

export const concert: Illustration = {
  k: "concert", name: "Concert stage", title: "No shows yet", body: "Shows you book or follow will be listed here with their dates.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -14);
    p.scale(0.96);
    p.shadow(0, 0, 30, 15, 0.1);
    const X = 19, Y = 10, S = 3.6, TOP = 27;
    // the stage deck, with a step line along its front
    p.box(-X, -Y, 0, X * 2, Y * 2, S, { top: 0.045, lw: 0.65 });
    p.line([[-X, Y + 0.03, S - 1.2], [X, Y + 0.03, S - 1.2], [X + 0.03, -Y, S - 1.2]], SH.edge, 0.45);
    // the far post of the truss
    p.box(-X + 1, -Y + 1, S, 1.8, 1.8, TOP - S, { lw: 0.5 });
    // the pools of light on the deck, then the beams that make them
    const spots = [-10, 0, 10].map((x, i) => ({ x, sx: x * 0.75 + 5.5 * Math.sin(ph + i * 2.1), sy: 1.5 + 2.5 * Math.sin(ph * 2 + i * 1.3) }));
    for (const s of spots) p.disc(s.sx, s.sy, S + 0.02, 4.6, 0.5, 0);
    for (const s of spots) {
      const lamp: V3 = [s.x, -Y + 1.9, TOP - 3.4];
      p.face([lamp, [s.sx - 3.3, s.sy + 3.3, S + 0.05], [s.sx + 3.3, s.sy - 3.3, S + 0.05]], 0.07, 0);
      p.guide([lamp, [s.sx - 3.3, s.sy + 3.3, S + 0.05]]); p.guide([lamp, [s.sx + 3.3, s.sy - 3.3, S + 0.05]]);
    }
    // the mic on its stand, mid stage
    p.disc(0, 3, S + 0.04, 1.8, 0.2, SH.edge);
    p.box(-0.3, 2.7, S, 0.6, 0.6, 11.5, { left: 0.3, right: 0.3, edge: 0 });
    p.box(-0.8, 2.2, S + 11.5, 1.6, 1.6, 2.4, { top: 0.5, left: 0.5, right: 0.3, lw: 0.5 });
    // the near post, the beam across with its bracing, and the three lamps hung from it
    p.box(X - 2.8, -Y + 1, S, 1.8, 1.8, TOP - S, { lw: 0.5 });
    p.box(-X + 1, -Y + 1, TOP, X * 2 - 2, 1.8, 2.6, { lw: 0.55 });
    const zig: V3[] = [];
    for (let i = 0; i <= 12; i++) zig.push([-X + 1 + (i * (X * 2 - 2)) / 12, -Y + 2.83, TOP + (i % 2 ? 2.3 : 0.3)]);
    p.line(zig, SH.edge, 0.4);
    for (const s of spots) p.box(s.x - 1.5, -Y + 0.9, TOP - 3.4, 3, 2.4, 3.4, { top: 0.3, left: 0.4, right: 0.2, lw: 0.5 });
    // speaker stacks at the two front corners
    for (const x of [-X + 1, X - 7]) {
      p.box(x, Y - 7, S, 6, 6, 10.5, { top: 0.22, left: 0.1, right: 0.06, lw: 0.55 });
      p.ringV("y", [x + 3, Y - 0.97, S + 3.6], 2.2, 0.3, SH.edge, 0.5);
      p.ringV("y", [x + 3, Y - 0.97, S + 8], 1.3, 0.3, SH.edge, 0.5);
    }
  },
};
