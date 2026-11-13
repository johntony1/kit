// No payments in: a wide shallow tray and a big coin with a down arrow on its face. The coin drops into the tray, the tray dips under it, and the coin sinks away, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const X = 14, Y = 8.5, H = 5.5, W = 1.3; // tray half length, half depth, wall height, rim width
const CR = 8.5, TOPZ = 25, REST = CR + 1.2; // coin radius, start height and resting height of its centre
const N: V3 = [0.707, 0.707, 0], A: V3 = [0.577, -0.577, 0]; // the coin faces us: its normal and its across axis

const clamp = (x: number) => Math.min(1, Math.max(0, x));

export const paymentin: Illustration = {
  k: "paymentin", name: "Payment received", title: "No payments in", body: "Money people send you will land here as soon as it arrives.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // fall in 0..0.35, a small bounce, rest, sink away, then a new coin grows in at the top
    const f = clamp(u / 0.35);
    let cz = TOPZ - (TOPZ - REST) * f * f;
    if (u > 0.35 && u < 0.5) { const v = (u - 0.35) / 0.15; cz += 2.2 * 4 * v * (1 - v); }
    const sink = clamp((u - 0.74) / 0.14), grow = u < 0.88 ? 1 - sink : clamp((u - 0.88) / 0.12);
    if (u < 0.88) cz -= sink * 6; else cz = TOPZ;
    const d = u > 0.35 ? Math.exp(-(u - 0.35) * 10) * Math.sin((u - 0.35) * 34) * 1.2 : 0;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 14, 0.12);
    p.push();
    p.rotate("z", -0.62);
    p.translate(0, 0, -d);
    // the rim, the dark inside and the far inner walls
    p.face([[-X, -Y, H], [X, -Y, H], [X, Y, H], [-X, Y, H]], 0.24, 0);
    p.face([[-X + W, -Y + W, H], [X - W, -Y + W, H], [X - W, Y - W, H], [-X + W, Y - W, H]], 0.03, 0);
    p.face([[-X + W, -Y + W, 1], [X - W, -Y + W, 1], [X - W, -Y + W, H], [-X + W, -Y + W, H]], 0.1, 0);
    p.face([[-X + W, -Y + W, 1], [-X + W, Y - W, 1], [-X + W, Y - W, H], [-X + W, -Y + W, H]], 0.065, 0);
    p.pop();
    // the coin, face on, between the far walls and the front
    const r = CR * grow;
    if (r > 0.3) {
      const pt = (c: number, s: number, off: number): V3 => [A[0] * c + N[0] * off, A[1] * c + N[1] * off, cz + s];
      const disc = (off: number, rr: number) => Array.from({ length: 40 }, (_, i) => { const q = (i / 40) * Math.PI * 2; return pt(Math.cos(q) * rr, Math.sin(q) * rr, off); });
      for (const o of [-1.4, -0.9, -0.45]) p.face(disc(o, r), 0.12, 0);
      p.face(disc(0, r), 0.34, 0);
      const ring = disc(0.03, r * 0.8);
      p.line([...ring, ring[0]], SH.edge, 0.7);
      // a bold down arrow cut into its face
      const k = r / CR;
      const arrow: [number, number][] = [[-1.5, 4.6], [1.5, 4.6], [1.5, 0], [3.8, 0], [0, -4.6], [-3.8, 0], [-1.5, 0]];
      p.face(arrow.map(([x, z]) => pt(x * k, z * k, 0.05)), 0.02, 0);
    }
    p.push();
    p.rotate("z", -0.62);
    p.translate(0, 0, -d);
    // the front and end walls over the coin's foot
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, H], [-X, Y, H]], 0.13, 0);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, H], [X, -Y, H]], 0.065, 0);
    p.line([[-X, Y + 0.03, H], [X, Y + 0.03, H], [X + 0.03, -Y, H]], SH.edge, 0.7);
    p.pop();
  },
};
