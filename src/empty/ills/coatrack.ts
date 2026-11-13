// Nobody checked in: a standing coat rack, a thick post on three splayed feet with four hooks rising round its top, all of them bare. Hover and a hat drops onto a front hook, swings and settles.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ZT = 34; // the top of the post
const ring = (r: number, z: number, n = 32): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

// a hook: a bright arm rising out of the post at angle a, ending in a round knob
function hook(p: Pen, a: number, z: number, r: number, w: number) {
  const c = Math.cos(a), s = Math.sin(a);
  const [x0, y0] = p.pt([c * 1.5, s * 1.5, z]), [x1, y1] = p.pt([c * r * 0.75, s * r * 0.75, z + r * 0.45]), [x2, y2] = p.pt([c * r, s * r, z + r * 0.85]);
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(x2, y2, w * 1.05, 0, Math.PI * 2); g.fill();
  });
}

// a foot: a slanted slab from the post out to the floor
function foot(p: Pen, a: number, fill: number) {
  const c = Math.cos(a), s = Math.sin(a), tx = -s * 1.6, ty = c * 1.6;
  p.face([[c * 1 - tx, s * 1 - ty, 8], [c * 1 + tx, s * 1 + ty, 8], [c * 12 + tx, s * 12 + ty, 0], [c * 12 - tx, s * 12 - ty, 0]], fill, 0);
  p.face([[c * 12 - tx, s * 12 - ty, 0], [c * 12 + tx, s * 12 + ty, 0], [c * 12 + tx, s * 12 + ty, 1.4], [c * 12 - tx, s * 12 - ty, 1.4]], 0.3, 0);
}

export const coatrack: Illustration = {
  k: "coatrack", name: "Coat rack", title: "Nobody checked in", body: "When people check in, they will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -21);
    p.shadow(0, 0, 22, 10, 0.12);
    // the back foot and the hooks round the back, the post, then the front feet and hooks
    foot(p, -Math.PI * 0.6, 0.14);
    for (const a of [-Math.PI * 0.85, -Math.PI * 0.35]) hook(p, a, ZT - 4, 6, 2.2);
    p.cylinder(0, 0, 0, 2.2, ZT, { side: 0.24, top: 0.3, edge: 0 });
    p.line(ring(2.25, 5).slice(0, 17), SH.edge, 0.6);
    // the round knob on top
    p.ringV("y", [0, 0.5, ZT + 2], 3, 0.34, 0);
    foot(p, Math.PI * 0.08, 0.1);
    foot(p, Math.PI * 0.72, 0.24);
    for (const a of [Math.PI * 0.15, Math.PI * 0.65]) hook(p, a, ZT - 4, 6, 2.4);
    // the hat drops onto the front left hook, swings and settles
    const k = Math.min(1, h * 1.2);
    if (k > 0.01) {
      const ha = Math.PI * 0.65, hx = Math.cos(ha) * 6, hy = Math.sin(ha) * 6, hz = ZT - 4 + 5.1 - 1.6;
      const fall = k < 0.5 ? 14 * (1 - Math.pow(k / 0.5, 2)) : 0;
      const swing = k < 0.5 ? 0 : 0.35 * Math.sin(((k - 0.5) / 0.5) * Math.PI * 3) * (1 - (k - 0.5) / 0.5) + h * Math.sin(t * 2.4) * 0.03;
      p.push();
      p.translate(hx, hy, hz + fall);
      p.rotate("x", -0.25 + swing, [0, 0, 4]);
      p.rotate("y", 0.15, [0, 0, 4]);
      // the brim, then the crown with its dark band
      p.cylinder(0, 0, 0, 4.6, 0.7, { side: 0.14, top: 0.24, edge: 0 });
      p.cylinder(0, 0, 0.7, 2.8, 3.6, { side: 0.22, top: 0.3, edge: 0 });
      p.face([...ring(2.85, 0.9).slice(-4), ...ring(2.85, 0.9).slice(0, 20), ...ring(2.85, 1.9).slice(0, 20).reverse(), ...ring(2.85, 1.9).slice(-4).reverse()], 0.04, 0);
      p.pop();
    }
  },
};
