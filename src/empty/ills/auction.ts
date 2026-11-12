// No bids yet: an auction gavel resting on its sound block. The gavel lifts, comes down hard and the strike rings out, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ZT = 3.8, HX = 6; // top of the block, where the head lands
/** the near half of a ring around the head */
const band = (z: number, r: number): V3[] => Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [HX + Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const auction: Illustration = {
  k: "auction", name: "Auction gavel", title: "No bids yet", body: "Bids will show here as soon as someone makes an offer.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // lift slowly, strike fast, a small rebound, rest
    const a = u < 0.45 ? ease(u / 0.45) : u < 0.55 ? 1 - Math.pow((u - 0.45) / 0.1, 2) : u < 0.7 ? 0.1 * Math.sin((Math.PI * (u - 0.55)) / 0.15) : 0;
    const hit = u >= 0.55 && u < 0.92 ? 1 - (u - 0.55) / 0.37 : 0;
    p.translate(2, 0, -9);
    p.shadow(3, 0, 26, 12, 0.11);
    // the sound block: a wide base and a raised top
    p.cylinder(HX, 0, 0, 8.6, 2.4, { side: 0.1, top: 0.16 });
    p.cylinder(HX, 0, 2.4, 6.8, 1.4, { side: 0.14, top: 0.24 });
    // the gavel, swinging about the end of its handle
    p.push();
    p.rotate("y", -0.66 * a, [-16, 0, ZT + 4.6]);
    p.box(-10, -0.9, ZT + 3.7, 14, 1.8, 1.8, { top: 0.26, left: 0.16, right: 0.08 });
    p.box(-17, -1.3, ZT + 3.3, 7.5, 2.6, 2.6, { top: 0.3, left: 0.2, right: 0.1, lw: 0.6 });
    p.cylinder(HX, 0, ZT, 3.9, 9.4, { side: 0.14, top: 0.3, lw: 0.6 });
    p.line(band(ZT + 1.7, 3.93), SH.edge, 0.7);
    p.line(band(ZT + 7.7, 3.93), SH.edge, 0.7);
    p.pop();
    // the strike rings out from the block
    if (hit > 0) {
      const [cx, cy] = p.pt([HX, 0, ZT]);
      const g = (1 - hit) * 5;
      p.screen((c) => {
        c.strokeStyle = `rgba(255,255,255,${hit})`; c.lineWidth = 0.8; c.lineCap = "round";
        for (const an of [-2.9, -2.45, -0.7, -0.25, 0.35, 2.8]) {
          const dx = Math.cos(an), dy = Math.sin(an) * 0.62;
          c.beginPath(); c.moveTo(cx + dx * (11.5 + g), cy + dy * (11.5 + g)); c.lineTo(cx + dx * (15 + g), cy + dy * (15 + g)); c.stroke();
        }
      });
    }
  },
};
