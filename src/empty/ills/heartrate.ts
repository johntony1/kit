// No heart rate data: a watch standing on its strap, a pulse line on its dark face. The trace sweeps across and the little heart beats as the spike passes, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const X = 10, Y = 2.2, Z0 = 9, Z1 = 30, F = Y + 0.03; // the case: half width, half depth, bottom, top, its front
// the pulse as [x, z] across the face
const ECG: [number, number][] = [[-7.6, 17], [-4, 17], [-3, 18.6], [-2, 17], [-1, 17], [-0.2, 14.4], [1.2, 24], [2.6, 12.6], [3.6, 17], [4.8, 17], [5.6, 18.8], [6.6, 17], [7.6, 17]];
const HEART: [number, number][] = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [16 * Math.pow(Math.sin(a), 3), 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)] as [number, number]; });

// a free standing stroke, flat to the screen (pen lines only show as cuts in a face)
const wire = (p: Pen, pts: V3[], w: number, v: number) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((c) => {
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
  });
};
/** the point a fraction f of the way along the pulse */
const along = (f: number): [number, number] => {
  const g = Math.min(0.9999, Math.max(0, f)) * (ECG.length - 1), i = Math.floor(g), u = g - i;
  return [ECG[i][0] + (ECG[i + 1][0] - ECG[i][0]) * u, ECG[i][1] + (ECG[i + 1][1] - ECG[i][1]) * u];
};

export const heartrate: Illustration = {
  k: "heartrate", name: "Heart rate", title: "No heart rate data", body: "Wear your watch or start a reading to see your heart rate here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -20);
    p.shadow(0, 1, 18, 8, 0.12);
    p.rotate("z", -0.42);
    const at = (x: number, z: number, d = 0.02): V3 => [x, F + d, z];
    // the strap, below and above the case
    for (const z of [0, Z1]) {
      p.box(-6.4, -0.9, z, 12.8, 1.8, 9.4, { top: 0.26, left: 0.12, right: 0.065, lw: 0.6 });
      for (let i = 0; i < 3; i++) p.line([[-6.4, 0.93, z + 2.2 + i * 2.5], [6.4, 0.93, z + 2.2 + i * 2.5]], SH.edge, 0.7);
    }
    // the case, its crown and the dark face
    p.box(-X, -Y, Z0, X * 2, Y * 2, Z1 - Z0, { top: 0.3, left: 0.2, right: 0.065, lw: 0.7 });
    p.box(X, -1, 18, 1.5, 2, 3.6, { top: 0.3, left: 0.2, right: 0.1, lw: 0.5 });
    p.clear([at(-X + 1.5, Z0 + 1.5, 0), at(X - 1.5, Z0 + 1.5, 0), at(X - 1.5, Z1 - 1.5, 0), at(-X + 1.5, Z1 - 1.5, 0)]);
    // the trace: faint all the way, bright where the sweep is
    wire(p, ECG.map(([x, z]) => at(x, z)), 1.2, 140);
    const head = ph * 1.35, tail = head - 0.35, seg: V3[] = [];
    for (let i = 0; i <= 24; i++) { const f = tail + ((head - tail) * i) / 24; if (f >= 0 && f <= 1) { const [x, z] = along(f); seg.push(at(x, z, 0.04)); } }
    if (seg.length > 1) wire(p, seg, 2.2, 255);
    if (head <= 1) { const [x, z] = along(head); p.dot(at(x, z, 0.05), 1.5, 1); }
    // the heart beats as the spike goes by
    const beat = Math.exp(-Math.pow((ph - 0.42) / 0.07, 2)), s = 0.14 * (1 + 0.35 * beat);
    p.face(HEART.map(([x, z]) => at(-4.6 + x * s, 25.6 + z * s, 0.03)), 0.9, 0);
    // two dashes where the number would be
    for (const x of [1.6, 4.8]) p.face([at(x, 25.1), at(x + 2.2, 25.1), at(x + 2.2, 26.3), at(x, 26.3)], 0.3, 0);
  },
};
