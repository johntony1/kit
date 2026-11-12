// No traces yet: a trace waterfall built of chunky blocks, one long root span over three child spans stepping down. Hover and the request runs through them: each span lights in turn and stays lit, and a tick pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the spans: [left, right, bottom]
const SPANS: [number, number, number][] = [[-19, 19, 27], [-15, -2, 18], [-2, 10, 9], [10, 19, 0]];
const HT = 5.6, D = 1.7;

function tick(p: Pen, pos: V3, r: number) {
  const [x, y] = p.pt(pos);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.46, y - r * 0.32); g.stroke();
  });
}

export const trace: Illustration = {
  k: "trace", name: "Trace", title: "No traces yet", body: "Send a request through your service and its spans will be laid out here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 27, 11, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 1.5, 0);
    // the links: each child hangs from the span above it
    for (let i = 1; i < SPANS.length; i++) {
      const [x0, , z] = SPANS[i];
      p.box(x0 + 0.8, -0.8, z + HT, 1.6, 1.6, SPANS[i - 1][2] - z - HT + 0.2, { top: 0.2, left: 0.3, right: 0.14, edge: 0 });
    }
    // the spans, bottom first; on hover each one lights as the request reaches it
    for (let i = SPANS.length - 1; i >= 0; i--) {
      const [x0, x1, z] = SPANS[i];
      const lit = ease(clamp(h * 2.6 - i * 0.5));
      const base = i === 0 ? 0.16 : 0.1;
      p.box(x0, -D, z, x1 - x0, D * 2, HT, { top: 0.3, left: base + (0.3 - base) * lit, right: 0.065, edge: 0 });
      // an end cap cut into each span
      p.line([[x0 + 2.2, D + 0.03, z + 0.2], [x0 + 2.2, D + 0.03, z + HT - 0.2]], 1, 0.8);
    }
    const q = clamp((h - 0.66) / 0.34);
    if (q > 0) {
      const pop = q < 0.65 ? ease(q / 0.65) * 1.18 : 1.18 - 0.18 * ease((q - 0.65) / 0.35);
      tick(p, [-12, 2, 5], 5 * pop);
    }
  },
};
