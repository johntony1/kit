// No wishes yet: one thick pillar candle with wax drips running down its front. Its flame flickers and sways over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const R = 7, H = 22, DZ = 0; // candle radius, candle height, dish height
const K = 0.57735;
/** a point in the plane that faces us, around the candle's axis */
const B = (u: number, z: number, out = 0): V3 => [u * K + out * 0.707, -u * K + out * 0.707, z];

export const candle: Illustration = {
  k: "candle", name: "Candle", title: "No wishes yet", body: "Make the first wish and it will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -20);
    p.shadow(0, 0, 16, 7, 0.12);
    // the candle: lit on the left, shaded on the right
    p.cylinder(0, 0, DZ, R, H, { side: 0.1, top: 0.24, edge: 0 });
    const side = (a0: number, a1: number, f: number) => {
      const q: V3[] = [];
      for (let i = 0; i <= 16; i++) { const a = a0 + ((a1 - a0) * i) / 16; q.push([Math.cos(a) * (R + 0.03), Math.sin(a) * (R + 0.03), DZ]); }
      for (let i = 16; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / 16; q.push([Math.cos(a) * (R + 0.03), Math.sin(a) * (R + 0.03), DZ + H]); }
      p.face(q, f, 0);
    };
    side(-Math.PI / 4, Math.PI / 6, 0.05);
    // drips running down the front from the rim, brighter than the wall
    for (const [u, len, wd] of [[-4.6, 8, 1.7], [0.8, 13, 2], [5, 6, 1.5]]) {
      const out = Math.sqrt(Math.max(0, R * R - u * u)) + 0.15;
      const q: V3[] = [B(u - wd, DZ + H + 0.1, out), B(u + wd, DZ + H + 0.1, out)];
      for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI; q.push(B(u + Math.cos(a) * wd, DZ + H - len + Math.sin(-a) * wd, out)); }
      p.face(q, 0.3, 0);
    }
    // the melted pool on top, a shade darker, and its lip
    p.disc(0, 0, DZ + H + 0.02, R - 1.6, 0.1);
    // the wick
    const zt = DZ + H;
    const [wx, wy] = p.pt([0, 0, zt]), [wx2, wy2] = p.pt([0, 0, zt + 2.4]);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx2, wy2); g.stroke(); });
    // the flame: a bright teardrop that stretches and sways
    const sway = Math.sin(w) * 0.9 + Math.sin(w * 3) * 0.35, tall = 1 + 0.12 * Math.sin(w * 2) + 0.06 * Math.sin(w * 5);
    const base = zt + 5.4;
    const drop = (g: number): V3[] => Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), up = s > 0 ? s : 0;
      return B(c * (4 + g) * (1 - up * 0.85) + up * up * sway, base + (s < 0 ? s * (3.6 + g) : s * (11 * tall + g)), 0.1);
    });
    p.face(drop(1.1), 0.02, 0); // a dark rim parts it from the candle top
    p.face(drop(0), 0.45, 0);
  },
};
