// No souvenirs yet: a snow globe with a little fir tree inside, on a round wooden base. Snow drifts down inside the glass, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.4;
const S = 15.5; // the globe's radius on screen, in dots
const E: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0]; // across the screen, in the world
// a point in the vertical plane facing us, through (0, 0, z0): u across, v up
const f = (u: number, v: number, z0: number): V3 => [E[0] * u, E[1] * u, z0 + v];
const FLAKES = Array.from({ length: 16 }, (_, i) => ({ x: Math.sin(i * 12.9898) * 0.8, k: (i * 0.618) % 1, w: 0.5 + ((i * 7) % 5) * 0.12 }));

export const snowglobe: Illustration = {
  k: "snowglobe", name: "Snow globe", title: "No souvenirs yet", body: "Save the things you bring home from a trip and they will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -21);
    p.shadow(0, 0, 22, 10, 0.12);
    // the base: a round plinth, and a lip
    p.cylinder(0, 0, 0, 11.5, 5.5, { side: 0.12, top: 0.2 });
    p.cylinder(0, 0, 5.5, 9.5, 2.2, { side: 0.3, top: 0.24 });
    const zc = 7.7 + 11.2, [cx, cy] = p.pt([0, 0, zc]);
    // the glass: dark inside, a snowy mound, the tree, the falling snow
    p.screen((g) => {
      g.fillStyle = "rgb(16,16,16)"; g.beginPath(); g.arc(cx, cy, S, 0, Math.PI * 2); g.fill();
      g.save(); g.beginPath(); g.arc(cx, cy, S - 0.4, 0, Math.PI * 2); g.clip();
      p.face(Array.from({ length: 25 }, (_, i) => { const a = Math.PI + (i / 24) * Math.PI; return f(Math.cos(a) * 16, Math.sin(-a) * 2.4, zc - 11.5); }).concat([f(16, -8, zc - 11.5), f(-16, -8, zc - 11.5)]), 0.34, 1, 0.5);
      p.face([f(-1.2, 0, zc - 10.5), f(1.2, 0, zc - 10.5), f(1.2, 0, zc - 8), f(-1.2, 0, zc - 8)], 0.08, 0);
      for (const [w, v0, v1] of [[8, -8.5, -1.5], [6.4, -4.8, 3], [4.6, -0.8, 7.6]]) p.face([f(-w, v0, zc), f(w, v0, zc), f(0, v1, zc)], 0.24, 1, 0.6);
      for (const fl of FLAKES) {
        const v = (u + fl.k) % 1, x = (fl.x + Math.sin((v + fl.k) * Math.PI * 4) * 0.06) * S, y = -S + v * S * 2.1;
        const a = Math.sin(Math.PI * v);
        g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; g.beginPath(); g.arc(cx + x, cy + y - S * 0.05, fl.w + 0.25, 0, Math.PI * 2); g.fill();
      }
      g.restore();
      // the rim and a highlight on the glass
      g.strokeStyle = "#fff"; g.lineCap = "round";
      g.lineWidth = 1.3; g.beginPath(); g.arc(cx, cy, S, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1.8; g.beginPath(); g.arc(cx, cy, S - 3, Math.PI * 1.08, Math.PI * 1.38); g.stroke();
    });
    // the front of the lip over the glass's foot
    p.cylinder(0, 0, 5.5, 9.5, 2.2, { side: 0.3, top: 0, edge: 0 });
    p.cylinder(0, 0, 0, 11.5, 5.5, { side: 0.12, top: 0, edge: 0 });
  },
};
