// No buzz yet: a domed straw beehive of coiled rings with a dark doorway. Bees circle it, passing in front and behind.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const RINGS: [number, number][] = [[14.5, 4.6], [15, 4.6], [14.2, 4.4], [12.4, 4.2], [9.6, 4], [6, 3.4]]; // radius, height
const F0 = -Math.PI / 4, F1 = (3 * Math.PI) / 4;
const arc = (r: number, z: number, a0: number, a1: number, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

function bee(p: Pen, at: V3, flap: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#fff";
    g.fillStyle = "#000"; g.beginPath(); g.ellipse(x, y - 0.6, 4.2, 3.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff";
    g.beginPath(); g.ellipse(x - 1.2, y - 2.3, 1.8, 1 + flap * 0.8, -0.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + 0.9, y - 2.4, 1.7, 1 + flap * 0.8, 0.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x, y, 3, 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#000"; g.fillRect(x - 0.5, y - 2, 0.9, 4);
  });
}

export const beehive: Illustration = {
  k: "beehive", name: "Beehive", title: "No buzz yet", body: "Share your first post and the buzz will start here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 12, 0.12);
    // the bees: three on one tilted orbit, the far ones behind the hive
    const bees = [0, 1, 2].map((i) => {
      const a = (u + [0, 0.18, 0.52][i]) * Math.PI * 2;
      const r = 18 + 1.2 * Math.sin(a * 2 + i);
      return { at: [Math.cos(a) * r, Math.sin(a) * r, 15 + 6 * Math.sin(a + 0.9) + 1.2 * Math.sin(u * Math.PI * 12 + i)] as V3, front: Math.cos(a) + Math.sin(a) > 0, flap: Math.abs(Math.sin(t * 40 + i)) };
    });
    bees.filter((b) => !b.front).forEach((b) => bee(p, b.at, b.flap));
    // a low stand, then the coiled rings, bottom up
    p.cylinder(0, 0, 0, 16.5, 1.6, { side: 0.12, top: 0.2, edge: 0 });
    let z = 1.6;
    RINGS.forEach(([r, hh], i) => {
      const r1 = RINGS[i + 1]?.[0] ?? r * 0.4;
      p.face([...arc(r, z, F0, F1), ...arc(i === RINGS.length - 1 ? r1 : r, z + hh, F0, F1).reverse()], 0.16, 0);
      p.face([...arc(r + 0.03, z, F0, F0 + 0.8, 8), ...arc((i === RINGS.length - 1 ? r1 : r) + 0.03, z + hh, F0, F0 + 0.8, 8).reverse()], 0.065, 0);
      if (i < RINGS.length - 1) p.disc(0, 0, z + hh, r, 0.22);
      p.face([...arc(r + 0.06, z + 0.02, F0, F1), ...arc(r + 0.06, z + 0.75, F0, F1).reverse()], 0.03, 0);
      z += hh;
    });
    // a little knob on the top
    p.cylinder(0, 0, z, 2.6, 1.8, { side: 0.16, top: 0.24, edge: 0 });
    // the doorway at the foot of the front
    const c = Math.PI / 4, R = 14.55;
    const door: V3[] = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; door.push([Math.cos(c) * R + Math.cos(a) * 3.2 * 0.707, Math.sin(c) * R - Math.cos(a) * 3.2 * 0.707, 1.8 + Math.sin(a) * 3.6]); }
    p.clear(door);
    bees.filter((b) => b.front).forEach((b) => bee(p, b.at, b.flap));
  },
};
