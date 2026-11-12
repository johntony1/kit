// Tip jar: a glass jar with a heart on its label and a few coins at the bottom. A coin drops in through the mouth and lands on the pile, and the heart beats.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const arc = (cx: number, cy: number, z: number, r: number, a0: number, a1: number): V3[] =>
  Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });
/** a heart outline in [u, v], about 2 wide, centred */
const HEART: [number, number][] = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [Math.pow(Math.sin(a), 3), (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16 + 0.1] as [number, number]; });
const JR = 9.6, JH = 24; // the jar
const CR = 7.6, CH = 2; // the coins inside

export const tip: Illustration = {
  k: "tip", name: "Tip jar", title: "No tips yet", body: "Tips from your customers will drop in here as they arrive.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -14);
    p.shadow(0, 0, 19, 9.5, 0.12);
    // the glass: faint walls, a dark mouth
    p.cylinder(0, 0, 0, JR, JH, { side: 0.06, top: 0.03 });
    // the coins inside, seen through the glass: the pile settles by one coin each loop
    const sink = ease(clamp((u - 0.74) / 0.26)) * CH;
    const coin = (z: number, a = 1) => {
      if (z < 0.4) { a *= clamp((z + CH) / CH); z = 0.4; }
      p.cylinder(0.4 * Math.sin(z * 3), 0, z, CR, CH, { side: 0.13 * a, top: 0.2 * a, edge: a });
      p.line(arc(0.4 * Math.sin(z * 3), 0, z, CR, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 0.5);
    };
    for (let j = 0; j < 3; j++) coin(0.4 + j * CH - sink);
    // the new coin: falls to the mouth, then on down to the pile
    const k = clamp((u - 0.08) / 0.5), drop = 0.4 + 3 * CH + (JH + 22) * (1 - k * k);
    if (drop < JH - CH) coin(drop - sink);
    // the lip of the jar
    p.cylinder(0, 0, JH - 1.8, JR + 0.9, 1.8, { side: 0.2, top: 0.2 });
    p.disc(0, 0, JH + 0.02, JR - 0.9, 0.03, 0);
    p.line(arc(0, 0, JH - 1.8, JR + 0.9, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 0.5);
    // the label, wrapped round the front, and its heart
    const on = (a: number, z: number): V3 => [Math.cos(a) * (JR + 0.05), Math.sin(a) * (JR + 0.05), z];
    const label: V3[] = [];
    for (let i = 0; i <= 12; i++) label.push(on(Math.PI / 4 - 0.85 + (1.7 * i) / 12, 9.4));
    for (let i = 12; i >= 0; i--) label.push(on(Math.PI / 4 - 0.85 + (1.7 * i) / 12, 19.6));
    p.face(label, 0.2, 0);
    const beat = 1 + 0.28 * Math.sin(Math.PI * clamp((u - 0.56) / 0.2)), s = 3 * beat;
    p.line([...HEART, HEART[0]].map(([a, b]) => [(JR + 0.1) * 0.7071 + a * s * 0.7071, (JR + 0.1) * 0.7071 - a * s * 0.7071, 14.5 + b * s * 1.15] as V3), SH.edge, 1.1);
    // the coin above the mouth
    if (drop >= JH - CH && k > 0) {
      const a = Math.min(1, k * 5);
      p.cylinder(0, 0, drop, 5.6, 1.6, { side: 0.14 * a, top: 0.3 * a, edge: a });
      p.line(arc(0, 0, drop + 1.62, 3.9, 0, Math.PI * 2), SH.edge, 0.55);
    }
  },
};
