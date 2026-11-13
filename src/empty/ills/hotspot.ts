// No one connected: a broadcast mast with a ball at its tip. Rings of signal light up on both sides, one after another, from the tip outward.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4, ZB = 29; // seconds per pulse, height of the ball

/** a bright arc in the plane facing us: lines turn dark in the dot styles, so it is stroked on the screen */
function arc(p: Pen, r: number, side: 1 | -1, lw: number) {
  const pts: V3[] = Array.from({ length: 13 }, (_, i) => { const a = -0.8 + (i / 12) * 1.6; return [side * Math.cos(a) * r, 0.5, ZB + Math.sin(a) * r] as V3; });
  if (p.ink) { p.line(pts, SH.edge, lw > 2 ? 1 : 0.5); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const hotspot: Illustration = {
  k: "hotspot", name: "Hotspot", title: "No one connected", body: "Share your connection and devices that join will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20, 10, 0.12);
    p.rotate("z", -0.42);
    // the foot, then the mast: a tapering slab with an open middle and a cross brace
    p.box(-9, -4.5, 0, 18, 9, 2.4, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    const leg = (s: number) => {
      p.face([[s * 7.5, 0, 2.4], [s * 3.8, 0, 2.4], [s * 0.4, 0, ZB - 2], [s * 2, 0, ZB - 2]], 0.22, 0);
      p.face([[s * 7.5, -1.8, 2.4], [s * 7.5, 0, 2.4], [s * 2, 0, ZB - 2], [s * 2, -1.8, ZB - 2]], 0.065, 0);
    };
    leg(-1); leg(1);
    p.face([[-4.6, 0.02, 11], [4.6, 0.02, 11], [4, 0.02, 12.8], [-4, 0.02, 12.8]], 0.22, 0);
    p.face([[-3.4, 0.02, 18.6], [3.4, 0.02, 18.6], [2.8, 0.02, 20.2], [-2.8, 0.02, 20.2]], 0.22, 0);
    // the ball at the tip, lit, with a dark rim
    p.ringV("y", [0, 0.2, ZB], 3.9, 0.4, SH.edge, 0.8);
    p.dot([-1, 0.4, ZB + 1.1], 1, 0);
    // three rings each side, lighting in turn from the tip outward, then all fading together
    for (let i = 0; i < 3; i++) {
      const on = Math.min(1, Math.max(0, (u - i * 0.16) / 0.12));
      const fade = u > 0.78 ? 1 - (u - 0.78) / 0.22 : 1;
      const a = on * fade;
      arc(p, 6.5 + i * 4.6, 1, 1 + 1.6 * a);
      arc(p, 6.5 + i * 4.6, -1, 1 + 1.6 * a);
    }
  },
};
