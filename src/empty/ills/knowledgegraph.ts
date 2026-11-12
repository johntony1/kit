// No connections yet: a hub and five nodes joined by threads, floating over a round plinth. The graph sways slowly and a pulse runs out along each thread in turn.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 4; // seconds per loop
const HUB: V3 = [0, 0, 17];
const NODES: [number, number, number][] = [ // across the picture, height, radius
  [-14, 24, 2.6], [-10, 9.5, 2.9], [11, 8.5, 2.4], [15, 22, 2.8], [1, 31.5, 2.5],
];
const LINKS: [number, number][] = [[0, 4], [2, 3], [0, 1]];

const ball = (p: Pen, at: V3, r: number, solid: boolean) => {
  const [x, y] = p.pt(at);
  p.screen((c) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = solid ? "#fff" : "rgb(20,20,20)"; c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = 1.2; c.stroke();
    if (solid) return;
    c.fillStyle = "rgb(150,150,150)"; c.beginPath(); c.arc(x - r * 0.32, y - r * 0.32, r * 0.26, 0, Math.PI * 2); c.fill();
  });
};
const wire = (p: Pen, a: V3, b: V3, g: number, lw: number) => {
  const [x0, y0] = p.pt(a), [x1, y1] = p.pt(b);
  p.screen((c) => { c.strokeStyle = `rgb(${g},${g},${g})`; c.lineWidth = lw; c.lineCap = "round"; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); });
};

export const knowledgegraph: Illustration = {
  k: "knowledgegraph", name: "Knowledge graph", title: "No connections yet", body: "As you add notes and sources, the links between them will be mapped here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 24, 12, 0.12);
    p.cylinder(0, 0, 0, 9.5, 2.4, { side: 0.12, top: 0.2 });
    // the graph sways round its hub and each node bobs a little
    const sway = 0.3 * Math.sin(w);
    const pts = NODES.map(([s, z, r], i) => { const d = s * 0.816; return { at: [Math.cos(sway - Math.PI / 4) * d, Math.sin(sway - Math.PI / 4) * d, z + Math.sin(w + i * 1.9) * 1.1] as V3, r, i }; });
    for (const [a, b] of LINKS) wire(p, pts[a].at, pts[b].at, 110, 0.5);
    for (const n of pts) wire(p, HUB, n.at, 200, 0.75);
    // a pulse on each spoke, one after another
    for (const n of pts) {
      const v = (u + n.i / 5) % 1;
      if (v < 0.5) { const s = v / 0.5; p.dot([HUB[0] + (n.at[0] - HUB[0]) * s, HUB[1] + (n.at[1] - HUB[1]) * s, HUB[2] + (n.at[2] - HUB[2]) * s], 1.05, 1); }
    }
    // far nodes first, the hub among them by depth
    const all = [...pts.map((n) => ({ at: n.at, r: n.r, hub: false })), { at: HUB, r: 4.1 + 0.3 * Math.sin(w * 2), hub: true }];
    all.sort((a, b) => a.at[0] + a.at[1] + a.at[2] - (b.at[0] + b.at[1] + b.at[2]));
    for (const n of all) ball(p, n.at, n.r, n.hub);
  },
};
