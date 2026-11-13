// No open issues: the open issue mark, a thick ring standing on its edge with a dot in the middle. Hover and the ring turns to face us, the dot sinks away and a tick takes its place.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const circ = (cx: number, cv: number, r: number, n = 40): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
// a ring standing in the x z plane, extruded back along y
function ring(p: Pen, cv: number, R: number, r: number, d: number) {
  const o = circ(0, cv, R), i = circ(0, cv, r);
  const band = (y: number): V3[] => [...on(o, y), on(o, y)[0], on(i, y)[0], ...on(i, y).reverse()];
  for (let y = -d; y < 0; y += 0.6) p.face(band(y), y < -d / 2 ? SH.right : 0.1, 0);
  p.face(band(0), 0.26, 0);
  p.line([...on(o, 0.02), on(o, 0.02)[0]], SH.edge, 0.6);
  p.line([...on(i, 0.02), on(i, 0.02)[0]], SH.edge, 0.6);
}

export const issue: Illustration = {
  k: "issue", name: "Issue", title: "No open issues", body: "Everything is closed. New issues will be listed here as they come in.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 10, 0.1);
    const k = ease(Math.min(1, h * 1.2));
    p.rotate("z", -0.45 - 0.3 * k + h * Math.sin(t * 1.8) * 0.03);
    const cv = 17.5;
    ring(p, cv, 17, 11, 4.5);
    // the dot: a thick button that shrinks away as the tick arrives
    const d = Math.max(0, 1 - k * 1.6);
    if (d > 0.02) {
      for (let y = -3; y < 0; y += 0.6) p.face(on(circ(0, cv, 4.6 * d), y), SH.right, 0);
      p.face(on(circ(0, cv, 4.6 * d), 0), 0.3, SH.edge, 0.6);
    }
    // the tick, drawn bright and bold in the ring's middle
    const c = Math.max(0, (k - 0.45) / 0.55);
    if (c > 0) {
      const a = p.pt([-4.6, 0, cv + 0.2]), b = p.pt([-1.4, 0, cv - 3.4]), e = p.pt([5.2, 0, cv + 4.6]);
      const l1 = Math.min(1, c * 2.2), l2 = Math.max(0, (c - 0.4) / 0.6);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 2.6; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0] + (b[0] - a[0]) * l1, a[1] + (b[1] - a[1]) * l1);
        if (l2 > 0) g.lineTo(b[0] + (e[0] - b[0]) * l2, b[1] + (e[1] - b[1]) * l2);
        g.stroke();
      });
    }
  },
};
