// Build your AI workforce: a row of agent cards made of real UI. The middle card arrives as a
// skeleton and its agent resolves out of a blur, then the row slides on to the next one.
// The component is empty/flat/AgentDeck.tsx; the drawing below is only a stand in for exports.
import type { Illustration } from "../dots";

export const workforce: Illustration = {
  k: "workforce", name: "Agent cards", title: "Build your AI workforce", body: "Add agents that work around the clock, each one made for a single job.",
  kind: "loop", period: 3.26, cols: 92, rows: 80, zoom: 1.42, flat: "agentDeck",
  draw(p) {
    p.translate(0, 0, -6);
    p.shadow(0, 0, 26, 10, 0.1);
    p.box(-14, -10, 0, 28, 20, 2, { top: 0.22, left: 0.12, right: 0.065 });
    p.disc(-8, -4, 2.05, 3, 0.3);
    p.line([[-3, -6, 2.1], [8, -6, 2.1]], 1, 0.9);
    p.line([[-3, -3, 2.1], [5, -3, 2.1]], 1, 0.7);
    p.line([[-11, 2, 2.1], [11, 2, 2.1]], 1, 0.7);
    p.line([[-11, 5, 2.1], [6, 5, 2.1]], 1, 0.7);
  },
};
