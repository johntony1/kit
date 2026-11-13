// No conversions yet: a three tier funnel. Over and over bright balls drop into its wide mouth and only one rolls out of the spout at the bottom.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
/** a cone section from radius r0 at z0 to r1 at z1: the half we see, lit on its left, shaded on its right */
function tier(p: Pen, z0: number, z1: number, r0: number, r1: number) {
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 4 + (i / N) * Math.PI, b = -Math.PI / 4 + ((i + 1) / N) * Math.PI;
    const q: V3[] = [[Math.cos(a) * r0, Math.sin(a) * r0, z0], [Math.cos(b) * r0, Math.sin(b) * r0, z0], [Math.cos(b) * r1, Math.sin(b) * r1, z1], [Math.cos(a) * r1, Math.sin(a) * r1, z1]];
    p.face(q, a + b > Math.PI * 0.5 ? 0.12 : 0.065, 0);
  }
}
const ring = (r: number, z: number): V3[] => Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const funnel: Illustration = {
  k: "funnel", name: "Funnel", title: "No conversions yet", body: "As people move from first visit to sign up, each step will fill in here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 11, 0.12);
    // the ball that gets through: drops out of the spout and rolls off toward us, fading
    const ball = (q: V3, r: number, a = 1) => {
      const [x, y] = p.pt(q);
      p.screen((g) => { g.globalAlpha = a; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill(); g.strokeStyle = "#000"; g.lineWidth = 0.6; g.stroke(); });
    };
    // a lit lip round the top of a tier, the next one sitting inside it
    const rim = (r: number, z: number) => { p.face(ring(r, z), 0.3, 0); p.face(ring(r - 1.6, z + 0.01), 0.03, 0); };
    // the spout and three tiers, bottom up, each pinched in at the lip below
    tier(p, 4, 8, 1.8, 2.4);
    tier(p, 8, 14, 2.4, 6.8);
    rim(6.8, 14);
    tier(p, 14, 21, 5.4, 10.8);
    rim(10.8, 21);
    tier(p, 21, 30, 9.4, 15);
    // the open mouth: a lit rim round a dark inside
    p.face(ring(15, 30), 0.28, 0);
    p.face(ring(12.8, 30.02), 0.03, 0);
    // the far inside wall, seen through the mouth, sloping down to the next lip
    for (let i = 0; i < 20; i++) {
      const a = (3 * Math.PI) / 4 + (i / 20) * Math.PI, b = (3 * Math.PI) / 4 + ((i + 1) / 20) * Math.PI;
      p.face([[Math.cos(a) * 12.8, Math.sin(a) * 12.8, 30.03], [Math.cos(b) * 12.8, Math.sin(b) * 12.8, 30.03], [Math.cos(b) * 7, Math.sin(b) * 7, 22], [Math.cos(a) * 7, Math.sin(a) * 7, 22]], 0.12, 0);
    }
    // balls falling into the mouth
    for (let i = 0; i < 3; i++) {
      const v = (u + i / 3) % 1;
      const z = 40 - 12 * Math.pow(v, 1.6);
      if (z > 31) ball([Math.cos(i * 2.3) * 4, Math.sin(i * 2.3) * 4, z], 2.4);
    }
    // the one that comes out: from the spout, onto the floor, rolling toward us
    const w = (u + 0.5) % 1;
    if (w < 0.85) {
      const d = w < 0.3 ? 0 : (w - 0.3) * 14;
      const z = w < 0.3 ? 4 - 3.3 * Math.pow(w / 0.3, 2) : 0.7 + Math.abs(Math.sin((w - 0.3) * 9)) * 1.2 * (1 - (w - 0.3) / 0.55);
      ball([d * 0.7, d * 0.7, z + 1.6], 2.2, w > 0.65 ? 1 - (w - 0.65) / 0.2 : 1);
    }
  },
};
