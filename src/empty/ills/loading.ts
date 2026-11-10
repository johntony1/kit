// Loading: a ring of blocks around a small hub. One by one the blocks lift and light up, chasing round, each settling as the next one rises.
import { SH, type Illustration } from "../dots";

const PERIOD = 2.4, N = 8, RING = 12.5, S = 5, BASE = 0;

export const loading: Illustration = {
  k: "loading", name: "Loading", title: "Getting things ready", body: "This should only take a few seconds.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -4);
    p.shadow(0, 0, 34, 17, 0.12);
    // a dashed track through the blocks in the line style, and the hub in the middle
    p.guide(Array.from({ length: 61 }, (_, i) => { const a = (i / 60) * Math.PI * 2; return [Math.cos(a) * RING, Math.sin(a) * RING, BASE] as [number, number, number]; }));
    // blocks, far ones first; the head of the chase goes round clockwise on screen
    const blocks = Array.from({ length: N }, (_, i) => {
      const a = -Math.PI * 0.75 + (i / N) * Math.PI * 2;
      const d = (((u * N - i) % N) + N) % N; // how long ago this block was the head
      const v = d < 1 ? Math.sin(Math.min(1, d * 2) * Math.PI * 0.5) : d < 3.2 ? 1 - (d - 1) / 2.2 : 0;
      return { x: Math.cos(a) * RING, y: Math.sin(a) * RING, v, head: d < 1 };
    }).sort((a, b) => a.x + a.y - (b.x + b.y));
    let hub = false;
    for (const b of blocks) {
      // the hub sits in the middle: draw it once the far blocks are down
      if (!hub && b.x + b.y > 0) {
        hub = true;
        p.cylinder(0, 0, 0, 5, 2.4, { top: SH.top, side: SH.left });
        p.cylinder(0, 0, 2.4, 2.2, 1.6, { top: 0.24, side: SH.right });
      }
      const lift = b.v * 4.5;
      const top = b.head ? 0.5 : b.v > 0.3 ? 0.22 : 0.12;
      if (lift > 0.3) p.guide([[b.x + S / 2, b.y + S / 2, BASE], [b.x + S / 2, b.y + S / 2, BASE + lift]], b.head);
      p.box(b.x - S / 2, b.y - S / 2, BASE + lift, S, S, S, { top: b.head ? 1 : top, left: b.v > 0.3 ? 0.16 : SH.left, right: b.v > 0.3 ? 0.1 : SH.right });
      if (b.head && b.v > 0.6) p.dot([b.x, b.y, BASE + lift + S + 2.2], 0.75, 1);
    }
  },
};
