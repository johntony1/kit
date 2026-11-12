// No doctors yet: a stethoscope hanging in the air, ear tubes at the top and the chest piece at the end of its loop. The chest piece beats and sends out rings.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop: two heartbeats
type P2 = [number, number];
/** a stroke through 3D points, flat to the screen: a tube, a rope, a needle */
function tube(p: Pen, pts: V3[], w: number, shade = 1) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    const n = Math.round(255 * shade);
    g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}
/** flat to the viewer: u right, v up */
const f = (u: number, v: number, w = 0): V3 => [0.5774 * (u - 3.4) + 0.7071 * w, -0.5774 * (u - 3.4) + 0.7071 * w, v];
const bez = (a: P2, b: P2, c: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const q = i / n, r = 1 - q; return [r * r * a[0] + 2 * r * q * b[0] + q * q * c[0], r * r * a[1] + 2 * r * q * b[1] + q * q * c[1]] as P2; });
const EAR: P2[] = [...bez([-5, 33], [-11.5, 30], [-9.5, 23]), ...bez([-9.5, 23], [-8, 17.5], [0, 15.5]).slice(1)];
const TUBE: P2[] = [[0, 15.5], [0, 9.5], ...Array.from({ length: 17 }, (_, i) => { const a = Math.PI + (i / 16) * Math.PI; return [7 + Math.cos(a) * 7, 9.5 + Math.sin(a) * 7] as P2; }), [14, 13]];
const circle = (cu: number, cv: number, r: number, w = 0): V3[] => Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return f(cu + Math.cos(a) * r, cv + Math.sin(a) * r, w); });

export const stethoscope: Illustration = {
  k: "stethoscope", name: "Stethoscope", title: "No doctors yet", body: "Add your doctors and clinics to keep their details in one place.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) * 2) % 1;
    const beat = Math.exp(-Math.pow((u - 0.12) / 0.07, 2)) + 0.6 * Math.exp(-Math.pow((u - 0.36) / 0.08, 2));
    p.translate(0, 0, -17);
    p.shadow(0, 0, 20, 8, 0.11);
    const CU = 14, CV = 17.4, CR = 5 + 0.5 * beat;
    // rings leaving the chest piece with each beat
    for (const o of [0.12, 0.36]) {
      const q = (u - o + 1) % 1;
      if (q < 0.6) { const c = circle(CU, CV, CR + 1 + q * 11); tube(p, [...c, c[0]], 0.8, (1 - q / 0.6) * 0.8); }
    }
    // the ear tubes: thin metal, ending in ear tips
    for (const sx of [-1, 1]) {
      tube(p, EAR.map(([a, b]) => f(a * sx, b)), 1.2);
      p.dot(f(-5 * sx, 33.4), 1.7, 1);
    }
    // the rubber tube: thick, down and round to the chest piece
    tube(p, TUBE.map(([a, b]) => f(a, b)), 2.6, p.ink ? 0.5 : 0.8);
    p.dot(f(0, 15.5), 1.5, 1);
    // the chest piece: a rim behind, a bright drum in front
    p.face(circle(CU, CV, CR, -1.6), 0.1, SH.edge, 0.5);
    p.face(circle(CU, CV, CR), 0.2, SH.edge, 0.6);
    p.face(circle(CU, CV, CR * 0.62, 0.02), 0.3 + 0.2 * beat, SH.edge, 0.5);
  },
};
